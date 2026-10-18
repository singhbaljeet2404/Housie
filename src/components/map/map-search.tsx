"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { GeoJSONSource, Map as MapLibreMap, MapLayerMouseEvent } from "maplibre-gl";
import type { CityInfo, Listing, MapPoint, Suggestion } from "@/lib/listings/types";
import { parseSearchQuery, toSearchParams } from "@/lib/search-params";
import { formatPrice, formatPriceShort } from "@/lib/format";
import { ListingCard } from "@/components/listing-card";
import { SearchBox } from "@/components/search-box";
import { FilterBar, type Filters } from "./filter-bar";

const MAP_STYLE = process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "https://tiles.openfreemap.org/styles/positron";
const GTA: { center: [number, number]; zoom: number } = { center: [-79.62, 43.7], zoom: 9.3 };
const BRAND = "#1d5190";

interface MapResponse {
  total: number;
  points: MapPoint[];
  listings: Listing[];
}

function initialView(params: URLSearchParams, cities: CityInfo[]) {
  const center = params.get("center")?.split(",").map(Number);
  const zoom = Number(params.get("zoom"));
  if (center?.length === 2 && center.every(Number.isFinite)) {
    return { center: center as [number, number], zoom: Number.isFinite(zoom) && zoom > 0 ? zoom : 13 };
  }
  const city = cities.find((c) => c.slug === params.get("city"));
  if (city) return { center: city.center, zoom: 11.5 };
  return GTA;
}

function initialFilters(params: URLSearchParams): Filters {
  // city / bbox / paging are positional, not filters — the map viewport replaces them
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { city, bbox, limit, offset, ...filters } = parseSearchQuery(params);
  return filters;
}

// Stretchable rounded "price tag" image used behind pin labels.
function pillImage(color: string) {
  const ratio = 2;
  const w = 24 * ratio;
  const h = 18 * ratio;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2 * ratio;
  ctx.beginPath();
  ctx.roundRect(ratio, ratio, w - 2 * ratio, h - 2 * ratio, 8 * ratio);
  ctx.fill();
  ctx.stroke();
  return {
    data: ctx.getImageData(0, 0, w, h),
    options: {
      pixelRatio: ratio,
      stretchX: [[10 * ratio, 14 * ratio]] as [number, number][],
      stretchY: [[8 * ratio, 10 * ratio]] as [number, number][],
      content: [6 * ratio, 3 * ratio, 18 * ratio, 15 * ratio] as [number, number, number, number],
    },
  };
}

function toGeoJSON(points: MapPoint[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: { id: p.id, label: formatPriceShort(p.price) },
    })),
  };
}

export function MapSearch({ cities }: { cities: CityInfo[] }) {
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [filters, setFilters] = useState<Filters>(() => initialFilters(searchParams));
  const [bbox, setBbox] = useState<[number, number, number, number] | null>(null);
  const [data, setData] = useState<MapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MapPoint | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [showFilters, setShowFilters] = useState(false);
  const pointsById = useRef(new Map<string, MapPoint>());

  // --- map setup -----------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | undefined;

    (async () => {
      const maplibre = await import("maplibre-gl");
      if (cancelled || !containerRef.current) return;
      maplibre.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

      const view = initialView(new URLSearchParams(window.location.search), cities);
      map = new maplibre.Map({ container: containerRef.current, style: MAP_STYLE, ...view, minZoom: 7, maxZoom: 18 });
      mapRef.current = map;
      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
      map.on("error", (e) => {
        if (!map?.isStyleLoaded()) setMapError(true);
        console.warn("[map]", e.error?.message);
      });

      const updateBounds = () => {
        const b = map!.getBounds();
        setBbox([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
      };

      map.on("load", () => {
        const pill = pillImage(BRAND);
        map!.addImage("pill", pill.data, pill.options);
        const pillHot = pillImage("#e8833a");
        map!.addImage("pill-hot", pillHot.data, pillHot.options);

        map!.addSource("listings", { type: "geojson", data: toGeoJSON([]), cluster: true, clusterMaxZoom: 13, clusterRadius: 48 });

        map!.addLayer({
          id: "clusters",
          type: "circle",
          source: "listings",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": BRAND,
            "circle-opacity": 0.85,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2,
            "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 50, 26, 150, 32],
          },
        });
        map!.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "listings",
          filter: ["has", "point_count"],
          layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 13, "text-font": ["Noto Sans Bold"] },
          paint: { "text-color": "#ffffff" },
        });
        map!.addLayer({
          id: "pins",
          type: "symbol",
          source: "listings",
          filter: ["!", ["has", "point_count"]],
          layout: {
            "icon-image": "pill",
            "icon-text-fit": "both",
            "text-field": ["get", "label"],
            "text-size": 12,
            "text-font": ["Noto Sans Bold"],
            "icon-allow-overlap": true,
            "text-allow-overlap": true,
          },
          paint: { "text-color": "#ffffff" },
        });
        map!.addLayer({
          id: "pins-hot",
          type: "symbol",
          source: "listings",
          filter: ["==", ["get", "id"], ""],
          layout: {
            "icon-image": "pill-hot",
            "icon-text-fit": "both",
            "text-field": ["get", "label"],
            "text-size": 13,
            "text-font": ["Noto Sans Bold"],
            "icon-allow-overlap": true,
            "text-allow-overlap": true,
          },
          paint: { "text-color": "#ffffff" },
        });

        map!.on("click", "clusters", async (e: MapLayerMouseEvent) => {
          const feature = e.features?.[0];
          if (!feature) return;
          const source = map!.getSource("listings") as GeoJSONSource;
          const zoom = await source.getClusterExpansionZoom(feature.properties.cluster_id as number);
          map!.easeTo({ center: (feature.geometry as GeoJSON.Point).coordinates as [number, number], zoom });
        });
        const selectPin = (e: MapLayerMouseEvent) => {
          const id = e.features?.[0]?.properties.id as string | undefined;
          if (id) setSelected(pointsById.current.get(id) ?? null);
        };
        map!.on("click", "pins", selectPin);
        map!.on("click", "pins-hot", selectPin);
        map!.on("click", (e) => {
          if (!map!.queryRenderedFeatures(e.point, { layers: ["pins", "pins-hot", "clusters"] }).length) setSelected(null);
        });
        for (const layer of ["clusters", "pins", "pins-hot"]) {
          map!.on("mouseenter", layer, () => (map!.getCanvas().style.cursor = "pointer"));
          map!.on("mouseleave", layer, () => (map!.getCanvas().style.cursor = ""));
        }

        map!.on("moveend", updateBounds);
        updateBounds();
        setMapReady(true);
      });
    })().catch((err) => {
      console.error("[map] failed to initialise", err);
      setMapError(true);
    });

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [cities]);

  // --- data loading ----------------------------------------------------------
  useEffect(() => {
    if (!bbox && !mapError) return;
    const controller = new AbortController();
    const params = toSearchParams({ ...filters, bbox: bbox ?? undefined, limit: 30 });
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/map?${params}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((res: MapResponse) => {
          pointsById.current = new Map(res.points.map((p) => [p.id, p]));
          setData(res);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== "AbortError") setLoading(false);
        });
    }, 120);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters, bbox, mapError]);

  useEffect(() => {
    if (!mapReady || !data) return;
    (mapRef.current?.getSource("listings") as GeoJSONSource | undefined)?.setData(toGeoJSON(data.points));
  }, [mapReady, data]);

  useEffect(() => {
    if (!mapReady) return;
    mapRef.current?.setFilter("pins-hot", ["==", ["get", "id"], hovered ?? selected?.id ?? ""]);
  }, [mapReady, hovered, selected]);

  // Keep the URL shareable without triggering a Next.js navigation.
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current!;
    const params = toSearchParams(filters);
    const c = map.getCenter();
    params.set("center", `${c.lng.toFixed(4)},${c.lat.toFixed(4)}`);
    params.set("zoom", map.getZoom().toFixed(1));
    window.history.replaceState(null, "", `/map?${params}`);
  }, [mapReady, filters, bbox]);

  const flyTo = useCallback((s: Suggestion) => {
    if (s.center) mapRef.current?.flyTo({ center: s.center, zoom: s.sublabel === "City" ? 11.5 : 14 });
    setMobileView("map");
  }, []);

  const total = data?.total ?? 0;

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] flex-col md:h-[calc(100dvh-4rem)]">
      <div className="space-y-2 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="flex gap-2">
            <SearchBox onSelect={flyTo} className="flex-1 lg:w-96 lg:flex-none" />
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              className="rounded-full border border-slate-300 px-4 text-sm font-medium text-slate-700 lg:hidden"
            >
              Filters
            </button>
          </div>
          <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <FilterBar filters={filters} onChange={setFilters} />
          </div>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        <aside
          className={`${mobileView === "list" ? "flex" : "hidden"} w-full flex-col overflow-y-auto bg-slate-50 md:flex md:w-[440px] md:flex-none lg:w-[520px]`}
        >
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 px-4 py-2 text-sm text-slate-700">
            {loading && !data ? "Loading listings…" : (
              <>
                <strong>{total.toLocaleString("en-CA")}</strong> homes for sale in this area
                {total > (data?.listings.length ?? 0) && <span className="text-slate-500"> · showing {data?.listings.length}, zoom in to narrow down</span>}
              </>
            )}
          </div>
          <div className="grid gap-3 p-3 sm:grid-cols-2">
            {data?.listings.map((listing) => (
              <div key={listing.id} onMouseEnter={() => setHovered(listing.id)} onMouseLeave={() => setHovered(null)}>
                <ListingCard listing={listing} compact />
              </div>
            ))}
          </div>
          {data && total === 0 && (
            <p className="px-4 py-10 text-center text-sm text-slate-500">No homes match these filters here. Try zooming out or clearing filters.</p>
          )}
        </aside>

        <div className={`${mobileView === "map" ? "block" : "hidden"} relative min-w-0 flex-1 md:block`}>
          {/* MapLibre forces position: relative on its container, so size it with h-full rather than inset-0 */}
          <div ref={containerRef} className="h-full w-full" />
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-6 text-center text-sm text-slate-600">
              The map couldn&apos;t load. Listings are still available in the list view.
            </div>
          )}
          {loading && data && (
            <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow">Updating…</div>
          )}
          {selected && (
            <div className="absolute bottom-4 left-1/2 w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 rounded-xl bg-white p-4 shadow-xl">
              <button type="button" aria-label="Close" onClick={() => setSelected(null)} className="absolute right-3 top-2 text-lg text-slate-400 hover:text-slate-700">×</button>
              <p className="text-lg font-bold">{formatPrice(selected.price)}</p>
              <p className="text-sm text-slate-700">{selected.beds} bd · {selected.baths} ba</p>
              <p className="truncate text-sm font-medium">{selected.address}</p>
              <Link href={selected.href} className="mt-3 block rounded-lg bg-brand-600 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700">
                View details
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileView((v) => (v === "map" ? "list" : "map"))}
          className="absolute bottom-4 left-4 z-20 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg md:hidden"
        >
          {mobileView === "map" ? `List (${total})` : "Map"}
        </button>
      </div>
    </div>
  );
}
