import type { Metadata } from "next";
import { getCities, getCity } from "@/lib/listings";
import { CityListings } from "@/components/city-listings";

export async function generateStaticParams() {
  return (await getCities()).map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/real-estate/[city]">): Promise<Metadata> {
  const city = await getCity((await params).city);
  if (!city) return {};
  return {
    title: `${city.name} Homes for Sale & Real Estate Listings`,
    description: `Browse every home for sale in ${city.name}, ON — detached, semi-detached, townhouses and condos — updated from the MLS® System.`,
    alternates: { canonical: `/real-estate/${city.slug}` },
  };
}

export default async function CityPage({ params }: PageProps<"/real-estate/[city]">) {
  const { city } = await params;
  return <CityListings citySlug={city} />;
}
