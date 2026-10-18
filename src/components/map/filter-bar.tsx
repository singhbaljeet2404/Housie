"use client";

import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS, type PropertyType, type SearchQuery } from "@/lib/listings/types";

export type Filters = Omit<SearchQuery, "bbox" | "city" | "limit" | "offset">;

const PRICE_STEPS = [300_000, 400_000, 500_000, 600_000, 700_000, 800_000, 900_000, 1_000_000, 1_250_000, 1_500_000, 1_750_000, 2_000_000, 2_500_000, 3_000_000];
const priceLabel = (v: number) => (v >= 1_000_000 ? `$${v / 1_000_000}M` : `$${v / 1000}K`);

const selectClass =
  "rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none";

export function FilterBar({ filters, onChange }: { filters: Filters; onChange: (next: Filters) => void }) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });
  const numOrUndef = (v: string) => (v === "" ? undefined : Number(v));

  const toggleType = (type: PropertyType) => {
    const current = filters.types ?? [];
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    set("types", next.length ? next : undefined);
  };

  const activeCount = [filters.minPrice, filters.maxPrice, filters.minBeds, filters.minBaths, filters.maxDaysOnMarket, filters.types?.length].filter(
    (v) => v != null && v !== 0,
  ).length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select aria-label="Minimum price" className={selectClass} value={filters.minPrice ?? ""} onChange={(e) => set("minPrice", numOrUndef(e.target.value))}>
        <option value="">Min price</option>
        {PRICE_STEPS.map((p) => <option key={p} value={p}>{priceLabel(p)}</option>)}
      </select>
      <select aria-label="Maximum price" className={selectClass} value={filters.maxPrice ?? ""} onChange={(e) => set("maxPrice", numOrUndef(e.target.value))}>
        <option value="">Max price</option>
        {PRICE_STEPS.map((p) => <option key={p} value={p}>{priceLabel(p)}</option>)}
      </select>
      <select aria-label="Bedrooms" className={selectClass} value={filters.minBeds ?? ""} onChange={(e) => set("minBeds", numOrUndef(e.target.value))}>
        <option value="">Beds</option>
        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ beds</option>)}
      </select>
      <select aria-label="Bathrooms" className={selectClass} value={filters.minBaths ?? ""} onChange={(e) => set("minBaths", numOrUndef(e.target.value))}>
        <option value="">Baths</option>
        {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+ baths</option>)}
      </select>
      <select aria-label="Days on market" className={selectClass} value={filters.maxDaysOnMarket ?? ""} onChange={(e) => set("maxDaysOnMarket", numOrUndef(e.target.value))}>
        <option value="">Any listing date</option>
        <option value="1">New today</option>
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
      </select>
      <div className="flex flex-wrap gap-1" role="group" aria-label="Property type">
        {PROPERTY_TYPES.map((type) => {
          const on = filters.types?.includes(type) ?? false;
          return (
            <button
              key={type}
              type="button"
              aria-pressed={on}
              onClick={() => toggleType(type)}
              className={`rounded-full border px-3 py-1.5 text-sm ${on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-brand-500"}`}
            >
              {PROPERTY_TYPE_LABELS[type].replace(" Apartment", "")}
            </button>
          );
        })}
      </div>
      <select aria-label="Sort" className={selectClass} value={filters.sort ?? "newest"} onChange={(e) => set("sort", e.target.value as Filters["sort"])}>
        <option value="newest">Newest</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
      {activeCount > 0 && (
        <button type="button" onClick={() => onChange({ sort: filters.sort })} className="text-sm font-medium text-brand-600 hover:underline">
          Clear filters
        </button>
      )}
    </div>
  );
}
