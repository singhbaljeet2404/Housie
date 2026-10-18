import Link from "next/link";
import { site } from "@/config/site";
import { getCities, getCityStats, searchListings } from "@/lib/listings";
import { formatPrice } from "@/lib/format";
import { ListingCard } from "@/components/listing-card";
import { SearchBox } from "@/components/search-box";
import { LeadForm } from "@/components/lead-form";

export default async function HomePage() {
  const [latest, cities] = await Promise.all([searchListings({ sort: "newest", limit: 8 }), getCities()]);
  const stats = await Promise.all(cities.map((c) => getCityStats(c.slug)));

  return (
    <>
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center md:py-28">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Find your next home in the GTA</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-100">{site.tagline}</p>
          <div className="mx-auto mt-8 max-w-2xl text-slate-900">
            <SearchBox />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/map" className="rounded-full bg-white px-5 py-2.5 font-semibold text-brand-700 hover:bg-brand-50">
              Search on the map
            </Link>
            <Link href="/contact" className="rounded-full border border-white/60 px-5 py-2.5 font-semibold hover:bg-white/10">
              Talk to {site.agent.name}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">Just listed</h2>
          <Link href="/map?sort=newest" className="text-sm font-semibold text-brand-600 hover:underline">See all on the map →</Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {latest.listings.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-12">
          <h2 className="text-2xl font-bold">Browse by city</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {cities.map((city, i) => (
              <Link key={city.slug} href={`/real-estate/${city.slug}`} className="rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                <p className="font-semibold">{city.name}</p>
                <p className="text-sm text-slate-500">
                  {stats[i].activeCount} listings{stats[i].medianPrice != null && ` · ${formatPrice(stats[i].medianPrice!)} median`}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent-600">Your local agent</p>
          <h2 className="mt-2 text-3xl font-bold">{site.agent.name}</h2>
          <p className="text-slate-600">{site.agent.title}, {site.brokerage.name}</p>
          {site.agent.bio.map((p) => <p key={p} className="mt-4 leading-relaxed text-slate-700">{p}</p>)}
          <ul className="mt-6 space-y-2 text-slate-700">
            <li>✓ Private showings, usually within 24 hours</li>
            <li>✓ Comparable sales and pricing advice for any home you like</li>
            <li>✓ Negotiation and paperwork handled start to finish</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Have a question? Send me a message</h3>
          <div className="mt-4"><LeadForm /></div>
        </div>
      </section>
    </>
  );
}
