import type { Metadata } from "next";
import { Suspense } from "react";
import { getCities } from "@/lib/listings";
import { MapSearch } from "@/components/map/map-search";

export const metadata: Metadata = {
  title: "Map Search — Homes for Sale in the GTA",
  description: "Search homes for sale on the map across Brampton, Mississauga, Toronto and the GTA.",
};

export default async function MapPage() {
  const cities = await getCities();
  return (
    <Suspense fallback={<div className="flex h-[calc(100dvh-4rem)] items-center justify-center text-sm text-slate-500">Loading map…</div>}>
      <MapSearch cities={cities} />
    </Suspense>
  );
}
