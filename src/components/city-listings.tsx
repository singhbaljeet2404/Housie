import Link from "next/link";
import { notFound } from "next/navigation";
import { getCity, getCityStats, searchListings } from "@/lib/listings";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS, PROPERTY_TYPE_SLUGS, type PropertyType } from "@/lib/listings/types";
import { formatPrice } from "@/lib/format";
import { toSearchParams } from "@/lib/search-params";
import { ListingCard } from "./listing-card";
import { LeadForm } from "./lead-form";
import { site } from "@/config/site";

export function typeFromSlug(slug: string): PropertyType | null {
  return PROPERTY_TYPES.find((t) => PROPERTY_TYPE_SLUGS[t] === slug) ?? null;
}

export function typeHeading(type: PropertyType) {
  return { detached: "Detached Homes", "semi-detached": "Semi-Detached Homes", townhouse: "Townhouses", condo: "Condos" }[type];
}

// Shared body of the SEO city and city × property-type landing pages.
export async function CityListings({ citySlug, type }: { citySlug: string; type?: PropertyType }) {
  const city = await getCity(citySlug);
  if (!city) notFound();
  const [stats, results] = await Promise.all([
    getCityStats(citySlug),
    searchListings({ city: citySlug, types: type ? [type] : undefined, limit: 24 }),
  ]);
  const scope = type ? stats.byType[type] : { count: stats.activeCount, medianPrice: stats.medianPrice };
  const heading = `${type ? typeHeading(type) : "Homes"} for Sale in ${city.name}`;
  const mapHref = `/map?${toSearchParams({ city: citySlug, types: type ? [type] : undefined })}`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <nav className="mb-3 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/real-estate" className="hover:underline">Homes for sale</Link>
        {" › "}
        {type ? <Link href={`/real-estate/${citySlug}`} className="hover:underline">{city.name}</Link> : <span>{city.name}</span>}
        {type && <>{" › "}<span>{typeHeading(type)}</span></>}
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{heading}</h1>
          <p className="mt-2 text-slate-600">
            <strong>{scope.count}</strong> active listings
            {scope.medianPrice != null && <> · median asking price <strong>{formatPrice(scope.medianPrice)}</strong></>}
          </p>
        </div>
        <Link href={mapHref} className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          View on map
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {PROPERTY_TYPES.map((t) => (
          <Link
            key={t}
            href={t === type ? `/real-estate/${citySlug}` : `/real-estate/${citySlug}/${PROPERTY_TYPE_SLUGS[t]}`}
            className={`rounded-full border px-3 py-1.5 text-sm ${t === type ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 hover:border-brand-500"}`}
          >
            {PROPERTY_TYPE_LABELS[t]} ({stats.byType[t].count})
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.listings.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
      {results.total > results.listings.length && (
        <p className="mt-6 text-center">
          <Link href={mapHref} className="font-semibold text-brand-600 hover:underline">
            See all {results.total} listings on the map →
          </Link>
        </p>
      )}

      <section className="mt-12 grid gap-8 rounded-2xl bg-brand-50 p-6 md:grid-cols-2 md:p-10">
        <div>
          <h2 className="text-2xl font-bold">Thinking about {city.name}?</h2>
          <p className="mt-3 text-slate-700">
            I can set up a private tour, pull recent comparable sales, or send new {city.name} listings the moment they
            hit the market. Ask {site.agent.name} — no obligation.
          </p>
        </div>
        <div className="rounded-xl bg-white p-5">
          <LeadForm defaultMessage={`I'm interested in ${type ? typeHeading(type).toLowerCase() : "homes"} in ${city.name}.`} />
        </div>
      </section>
    </div>
  );
}
