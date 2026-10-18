// Listing shape used throughout the app. Field names loosely follow the RESO
// Data Dictionary so a PropTx / Repliers adapter can map onto it directly.

export const PROPERTY_TYPES = ["detached", "semi-detached", "townhouse", "condo"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  detached: "Detached",
  "semi-detached": "Semi-Detached",
  townhouse: "Townhouse",
  condo: "Condo Apartment",
};

// URL slugs used by the SEO facet pages, e.g. /real-estate/brampton/detached-homes
export const PROPERTY_TYPE_SLUGS: Record<PropertyType, string> = {
  detached: "detached-homes",
  "semi-detached": "semi-detached-homes",
  townhouse: "townhouses",
  condo: "condos",
};

export type ListingStatus = "active";

export interface Room {
  name: string;
  level: string;
  dimensions: string;
}

export interface Listing {
  id: string; // opaque public id — never the MLS® number
  mlsNumber: string;
  status: ListingStatus;
  listPrice: number;
  listDate: string; // ISO date
  daysOnMarket: number; // supplied by the feed, so pages never compute it from the clock
  propertyType: PropertyType;
  address: {
    unit?: string;
    streetNumber: string;
    streetName: string;
    neighbourhood: string;
    city: string; // display name
    citySlug: string;
    province: "ON";
    postalCode: string;
  };
  lat: number;
  lng: number;
  bedrooms: number;
  bedroomsPlus: number; // dens / basement bedrooms ("3+1")
  bathrooms: number;
  parking: number;
  sqftRange: string;
  lotSize?: string;
  yearBuilt?: number;
  taxes: number;
  taxYear: number;
  maintenanceFee?: number;
  description: string;
  features: string[];
  rooms: Room[];
  photoCount: number;
  listingBrokerage: string; // IDX rules: listing brokerage must be shown
}

export type SortOrder = "newest" | "price-asc" | "price-desc";

export interface SearchQuery {
  bbox?: [west: number, south: number, east: number, north: number];
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  types?: PropertyType[];
  maxDaysOnMarket?: number;
  sort?: SortOrder;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  total: number;
  listings: Listing[];
}

// Lightweight listing summary for map pins and the pin preview card.
export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  price: number;
  address: string;
  beds: string;
  baths: number;
  type: PropertyType;
  href: string;
}

export interface Suggestion {
  kind: "city" | "listing";
  label: string;
  sublabel?: string;
  href: string;
  center?: [lng: number, lat: number];
}

export interface CityInfo {
  slug: string;
  name: string;
  center: [lng: number, lat: number];
}

export interface CityStats {
  activeCount: number;
  medianPrice: number | null;
  byType: Record<PropertyType, { count: number; medianPrice: number | null }>;
}

export interface ListingProvider {
  search(query: SearchQuery): Promise<SearchResult>;
  mapPoints(query: SearchQuery): Promise<MapPoint[]>;
  getById(id: string): Promise<Listing | null>;
  allIds(): Promise<string[]>;
  suggest(text: string): Promise<Suggestion[]>;
  cities(): Promise<CityInfo[]>;
  cityStats(citySlug: string): Promise<CityStats>;
}
