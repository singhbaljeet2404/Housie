import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCities, getCity } from "@/lib/listings";
import { PROPERTY_TYPES, PROPERTY_TYPE_SLUGS } from "@/lib/listings/types";
import { CityListings, typeFromSlug, typeHeading } from "@/components/city-listings";

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.flatMap((c) => PROPERTY_TYPES.map((t) => ({ city: c.slug, type: PROPERTY_TYPE_SLUGS[t] })));
}

export async function generateMetadata({ params }: PageProps<"/real-estate/[city]/[type]">): Promise<Metadata> {
  const { city: citySlug, type: typeSlug } = await params;
  const [city, type] = [await getCity(citySlug), typeFromSlug(typeSlug)];
  if (!city || !type) return {};
  return {
    title: `${typeHeading(type)} for Sale in ${city.name}`,
    description: `See all ${typeHeading(type).toLowerCase()} for sale in ${city.name}, ON, with prices, photos and details from the MLS® System.`,
    alternates: { canonical: `/real-estate/${city.slug}/${typeSlug}` },
  };
}

export default async function CityTypePage({ params }: PageProps<"/real-estate/[city]/[type]">) {
  const { city, type: typeSlug } = await params;
  const type = typeFromSlug(typeSlug);
  if (!type) notFound();
  return <CityListings citySlug={city} type={type} />;
}
