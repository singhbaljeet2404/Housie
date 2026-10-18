// Entry point for listing data. Pages call these cached helpers and never touch
// a provider directly, so switching from sample data to the live feed is a
// change in one place.

import { cacheLife } from "next/cache";
import { createSampleProvider } from "./sample-provider";
import type { ListingProvider, SearchQuery } from "./types";

function createProvider(): ListingProvider {
  const name = process.env.LISTINGS_PROVIDER ?? "sample";
  switch (name) {
    case "sample":
      return createSampleProvider();
    // case "repliers": return createRepliersProvider(process.env.REPLIERS_API_KEY!)
    default:
      throw new Error(`Unknown LISTINGS_PROVIDER "${name}"`);
  }
}

const provider = createProvider();

export const isSampleData = (process.env.LISTINGS_PROVIDER ?? "sample") === "sample";

export async function searchListings(query: SearchQuery) {
  "use cache";
  cacheLife("minutes");
  return provider.search(query);
}

export async function getListing(id: string) {
  "use cache";
  cacheLife("minutes");
  return provider.getById(id);
}

export async function getAllListingIds() {
  "use cache";
  cacheLife("hours");
  return provider.allIds();
}

export async function getCities() {
  "use cache";
  cacheLife("days");
  return provider.cities();
}

export async function getCity(slug: string) {
  const cities = await getCities();
  return cities.find((c) => c.slug === slug) ?? null;
}

export async function getCityStats(citySlug: string) {
  "use cache";
  cacheLife("hours");
  return provider.cityStats(citySlug);
}

// Map and autocomplete queries vary per request, so they skip the cache.
export const getMapPoints = (query: SearchQuery) => provider.mapPoints(query);
export const suggest = (text: string) => provider.suggest(text);

export * from "./types";
