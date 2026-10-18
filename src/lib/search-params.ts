// Converts between URL search params and SearchQuery so the map, the API and
// the SEO pages share one filter vocabulary.

import { PROPERTY_TYPES, type PropertyType, type SearchQuery, type SortOrder } from "./listings/types";

type Params = URLSearchParams | Record<string, string | string[] | undefined>;

function get(params: Params, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function num(params: Params, key: string, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = get(params, key);
  if (raw == null || raw === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.min(Math.max(value, min), max) : undefined;
}

const SORTS: SortOrder[] = ["newest", "price-asc", "price-desc"];

export function parseSearchQuery(params: Params): SearchQuery {
  const query: SearchQuery = {};

  const city = get(params, "city");
  if (city && /^[a-z-]+$/.test(city)) query.city = city;

  query.minPrice = num(params, "minPrice");
  query.maxPrice = num(params, "maxPrice");
  query.minBeds = num(params, "beds", { max: 10 });
  query.minBaths = num(params, "baths", { max: 10 });
  query.maxDaysOnMarket = num(params, "dom", { max: 3650 });

  const types = get(params, "type")
    ?.split(",")
    .filter((t): t is PropertyType => (PROPERTY_TYPES as readonly string[]).includes(t));
  if (types?.length) query.types = types;

  const sort = get(params, "sort");
  if (sort && (SORTS as string[]).includes(sort)) query.sort = sort as SortOrder;

  const bbox = get(params, "bbox")?.split(",").map(Number);
  if (bbox?.length === 4 && bbox.every(Number.isFinite)) query.bbox = bbox as SearchQuery["bbox"];

  query.limit = num(params, "limit", { min: 1, max: 100 });
  query.offset = num(params, "offset", { max: 10_000 });

  for (const key of Object.keys(query) as (keyof SearchQuery)[]) {
    if (query[key] === undefined) delete query[key];
  }
  return query;
}

export function toSearchParams(query: SearchQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.city) params.set("city", query.city);
  if (query.minPrice != null) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice != null) params.set("maxPrice", String(query.maxPrice));
  if (query.minBeds != null) params.set("beds", String(query.minBeds));
  if (query.minBaths != null) params.set("baths", String(query.minBaths));
  if (query.maxDaysOnMarket != null) params.set("dom", String(query.maxDaysOnMarket));
  if (query.types?.length) params.set("type", query.types.join(","));
  if (query.sort && query.sort !== "newest") params.set("sort", query.sort);
  if (query.bbox) params.set("bbox", query.bbox.map((n) => n.toFixed(5)).join(","));
  if (query.limit != null) params.set("limit", String(query.limit));
  if (query.offset) params.set("offset", String(query.offset));
  return params;
}
