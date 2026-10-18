import { describe, expect, it } from "vitest";
import { createSampleProvider, median } from "../listings/sample-provider";
import { SAMPLE_LISTINGS } from "../listings/sample-data";
import { idFromListingSlug, listingPath } from "../format";

const provider = createSampleProvider();

describe("sample data", () => {
  it("is deterministic with unique opaque ids", () => {
    expect(SAMPLE_LISTINGS).toHaveLength(600);
    expect(new Set(SAMPLE_LISTINGS.map((l) => l.id)).size).toBe(600);
    expect(SAMPLE_LISTINGS[0].id).toMatch(/^[A-Za-z0-9]{12}$/);
  });

  it("round-trips listing URLs back to ids", () => {
    for (const listing of SAMPLE_LISTINGS.slice(0, 50)) {
      const slug = listingPath(listing).split("/").pop()!;
      expect(idFromListingSlug(slug)).toBe(listing.id);
    }
    expect(idFromListingSlug("not-a-listing")).toBeNull();
  });
});

describe("search", () => {
  it("applies every filter", async () => {
    const q = { city: "brampton", minPrice: 800_000, maxPrice: 1_500_000, minBeds: 3, minBaths: 2, types: ["detached" as const], maxDaysOnMarket: 30 };
    const { listings, total } = await provider.search({ ...q, limit: 1000 });
    expect(total).toBeGreaterThan(0);
    expect(listings).toHaveLength(total);
    for (const l of listings) {
      expect(l.address.citySlug).toBe("brampton");
      expect(l.listPrice).toBeGreaterThanOrEqual(800_000);
      expect(l.listPrice).toBeLessThanOrEqual(1_500_000);
      expect(l.bedrooms).toBeGreaterThanOrEqual(3);
      expect(l.bathrooms).toBeGreaterThanOrEqual(2);
      expect(l.propertyType).toBe("detached");
      expect(l.daysOnMarket).toBeLessThanOrEqual(30);
    }
  });

  it("filters by bounding box and paginates", async () => {
    const bbox: [number, number, number, number] = [-79.8, 43.68, -79.7, 43.76];
    const all = await provider.mapPoints({ bbox });
    expect(all.every((p) => p.lng >= -79.8 && p.lng <= -79.7 && p.lat >= 43.68 && p.lat <= 43.76)).toBe(true);
    const page1 = await provider.search({ bbox, limit: 5 });
    const page2 = await provider.search({ bbox, limit: 5, offset: 5 });
    expect(page1.total).toBe(all.length);
    expect(page1.listings.map((l) => l.id)).not.toEqual(page2.listings.map((l) => l.id));
  });

  it("sorts by price", async () => {
    const { listings } = await provider.search({ sort: "price-asc", limit: 50 });
    expect(listings.map((l) => l.listPrice)).toEqual([...listings.map((l) => l.listPrice)].sort((a, b) => a - b));
  });

  it("suggests cities, neighbourhoods and addresses", async () => {
    expect((await provider.suggest("bram"))[0]).toMatchObject({ kind: "city", label: "Brampton" });
    expect((await provider.suggest("port credit")).some((s) => s.label === "Port Credit")).toBe(true);
    const listing = SAMPLE_LISTINGS[10];
    const byMls = await provider.suggest(listing.mlsNumber);
    expect(byMls.some((s) => s.href === listingPath(listing))).toBe(true);
    expect(await provider.suggest("x")).toEqual([]);
  });
});

describe("median", () => {
  it("handles odd, even and empty inputs", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(3);
    expect(median([])).toBeNull();
  });
});
