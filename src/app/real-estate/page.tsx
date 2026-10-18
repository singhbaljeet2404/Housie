import type { Metadata } from "next";
import Link from "next/link";
import { getCities, getCityStats } from "@/lib/listings";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "GTA Homes for Sale by City",
  description: "Browse homes for sale across Brampton, Mississauga, Toronto, Caledon, Vaughan, Milton, Oakville and Markham.",
};

export default async function CitiesPage() {
  const cities = await getCities();
  const stats = await Promise.all(cities.map((c) => getCityStats(c.slug)));
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Homes for sale by city</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cities.map((city, i) => (
          <Link key={city.slug} href={`/real-estate/${city.slug}`} className="rounded-xl border border-slate-200 p-5 transition hover:border-brand-500 hover:shadow-md">
            <p className="text-lg font-semibold">{city.name}</p>
            <p className="mt-1 text-sm text-slate-600">{stats[i].activeCount} active listings</p>
            {stats[i].medianPrice != null && (
              <p className="text-sm text-slate-600">Median ask {formatPrice(stats[i].medianPrice!)}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
