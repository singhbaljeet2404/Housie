"use client";

import { useEffect, useRef } from "react";

const MAP_STYLE = process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "https://tiles.openfreemap.org/styles/positron";

export function ListingMap({ lng, lat }: { lng: number; lat: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let remove: (() => void) | undefined;
    import("maplibre-gl").then((maplibre) => {
      if (cancelled || !ref.current) return;
      maplibre.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
      const map = new maplibre.Map({ container: ref.current, style: MAP_STYLE, center: [lng, lat], zoom: 14, cooperativeGestures: true });
      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
      new maplibre.Marker({ color: "#1d5190" }).setLngLat([lng, lat]).addTo(map);
      remove = () => map.remove();
    });
    return () => {
      cancelled = true;
      remove?.();
    };
  }, [lng, lat]);

  return <div ref={ref} className="h-72 w-full overflow-hidden rounded-xl bg-slate-100" aria-label="Map showing the listing location" />;
}
