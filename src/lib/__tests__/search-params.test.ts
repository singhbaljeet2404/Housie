import { describe, expect, it } from "vitest";
import { parseSearchQuery, toSearchParams } from "../search-params";

describe("search params", () => {
  it("round-trips a query", () => {
    const query = { city: "mississauga", minPrice: 500000, maxPrice: 900000, minBeds: 2, minBaths: 1, types: ["condo" as const, "townhouse" as const], maxDaysOnMarket: 7, sort: "price-asc" as const };
    expect(parseSearchQuery(toSearchParams(query))).toEqual(query);
  });

  it("drops invalid values", () => {
    const q = parseSearchQuery(new URLSearchParams("minPrice=abc&type=castle,condo&sort=random&bbox=1,2,3&beds=99&city=../etc"));
    expect(q).toEqual({ types: ["condo"], minBeds: 10 });
  });

  it("accepts Next.js searchParams records", () => {
    expect(parseSearchQuery({ beds: ["3", "4"], bbox: "-80,43,-79,44" })).toEqual({ minBeds: 3, bbox: [-80, 43, -79, 44] });
  });
});
