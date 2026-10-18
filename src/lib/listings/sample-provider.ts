import { CITY_SEEDS, SAMPLE_LISTINGS } from "./sample-data";
import {
  PROPERTY_TYPES,
  type CityStats,
  type Listing,
  type ListingProvider,
  type SearchQuery,
  type Suggestion,
} from "./types";
import { formatAddress, formatBeds, listingPath } from "../format";

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function matches(listing: Listing, q: SearchQuery): boolean {
  if (q.city && listing.address.citySlug !== q.city) return false;
  if (q.minPrice != null && listing.listPrice < q.minPrice) return false;
  if (q.maxPrice != null && listing.listPrice > q.maxPrice) return false;
  if (q.minBeds != null && listing.bedrooms < q.minBeds) return false;
  if (q.minBaths != null && listing.bathrooms < q.minBaths) return false;
  if (q.types?.length && !q.types.includes(listing.propertyType)) return false;
  if (q.maxDaysOnMarket != null && listing.daysOnMarket > q.maxDaysOnMarket) return false;
  if (q.bbox) {
    const [west, south, east, north] = q.bbox;
    if (listing.lng < west || listing.lng > east || listing.lat < south || listing.lat > north) return false;
  }
  return true;
}

function sortListings(listings: Listing[], sort: SearchQuery["sort"] = "newest") {
  const sorted = [...listings];
  if (sort === "price-asc") sorted.sort((a, b) => a.listPrice - b.listPrice);
  else if (sort === "price-desc") sorted.sort((a, b) => b.listPrice - a.listPrice);
  else sorted.sort((a, b) => a.daysOnMarket - b.daysOnMarket || a.mlsNumber.localeCompare(b.mlsNumber));
  return sorted;
}

export function createSampleProvider(listings: Listing[] = SAMPLE_LISTINGS): ListingProvider {
  const byId = new Map(listings.map((l) => [l.id, l]));

  return {
    async search(query) {
      const filtered = sortListings(listings.filter((l) => matches(l, query)), query.sort);
      const offset = query.offset ?? 0;
      const limit = query.limit ?? 24;
      return { total: filtered.length, listings: filtered.slice(offset, offset + limit) };
    },

    async mapPoints(query) {
      return listings
        .filter((l) => matches(l, query))
        .map((l) => ({
          id: l.id,
          lat: l.lat,
          lng: l.lng,
          price: l.listPrice,
          address: formatAddress(l),
          beds: formatBeds(l),
          baths: l.bathrooms,
          type: l.propertyType,
          href: listingPath(l),
        }));
    },

    async getById(id) {
      return byId.get(id) ?? null;
    },

    async allIds() {
      return listings.map((l) => l.id);
    },

    async suggest(text) {
      const needle = text.trim().toLowerCase();
      if (needle.length < 2) return [];
      const results: Suggestion[] = [];

      for (const city of CITY_SEEDS) {
        if (city.name.toLowerCase().startsWith(needle)) {
          results.push({ kind: "city", label: city.name, sublabel: "City", href: `/map?city=${city.slug}`, center: city.center });
        }
        for (const hood of city.neighbourhoods) {
          if (hood.toLowerCase().includes(needle)) {
            const inHood = listings.filter((l) => l.address.neighbourhood === hood && l.address.citySlug === city.slug);
            if (inHood.length) {
              const lng = inHood.reduce((s, l) => s + l.lng, 0) / inHood.length;
              const lat = inHood.reduce((s, l) => s + l.lat, 0) / inHood.length;
              results.push({ kind: "city", label: hood, sublabel: `Neighbourhood · ${city.name}`, href: `/map?center=${lng.toFixed(4)},${lat.toFixed(4)}&zoom=14`, center: [lng, lat] });
            }
          }
        }
      }

      for (const listing of listings) {
        if (results.length >= 10) break;
        const address = formatAddress(listing).toLowerCase();
        if (address.includes(needle) || listing.mlsNumber.toLowerCase() === needle) {
          results.push({
            kind: "listing",
            label: formatAddress(listing),
            sublabel: `${listing.address.neighbourhood}, ${listing.address.city}`,
            href: listingPath(listing),
            center: [listing.lng, listing.lat],
          });
        }
      }

      return results.slice(0, 10);
    },

    async cities() {
      return CITY_SEEDS.map(({ slug, name, center }) => ({ slug, name, center }));
    },

    async cityStats(citySlug) {
      const inCity = listings.filter((l) => l.address.citySlug === citySlug);
      const byType = Object.fromEntries(
        PROPERTY_TYPES.map((type) => {
          const prices = inCity.filter((l) => l.propertyType === type).map((l) => l.listPrice);
          return [type, { count: prices.length, medianPrice: median(prices) }];
        }),
      ) as CityStats["byType"];
      return { activeCount: inCity.length, medianPrice: median(inCity.map((l) => l.listPrice)), byType };
    },
  };
}
