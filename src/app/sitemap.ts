import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getAllListingIds, getCities, getListing } from "@/lib/listings";
import { PROPERTY_TYPES, PROPERTY_TYPE_SLUGS } from "@/lib/listings/types";
import { listingPath } from "@/lib/format";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cities = await getCities();
  const listings = await Promise.all((await getAllListingIds()).map((id) => getListing(id)));
  const url = (path: string) => `${site.url}${path}`;

  return [
    { url: url("/"), priority: 1 },
    { url: url("/map"), priority: 0.9 },
    { url: url("/real-estate"), priority: 0.8 },
    { url: url("/about") },
    { url: url("/contact") },
    ...cities.flatMap((c) => [
      { url: url(`/real-estate/${c.slug}`), priority: 0.8 },
      ...PROPERTY_TYPES.map((t) => ({ url: url(`/real-estate/${c.slug}/${PROPERTY_TYPE_SLUGS[t]}`), priority: 0.7 })),
    ]),
    ...listings.flatMap((l) => (l ? [{ url: url(listingPath(l)), lastModified: l.listDate, priority: 0.6 }] : [])),
  ];
}
