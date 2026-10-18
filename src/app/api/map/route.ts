import type { NextRequest } from "next/server";
import { getMapPoints, searchListings } from "@/lib/listings";
import { parseSearchQuery } from "@/lib/search-params";

// Map viewport query: every matching point (clustered client-side) plus the
// first page of full listings for the side panel.
export async function GET(request: NextRequest) {
  const query = parseSearchQuery(request.nextUrl.searchParams);
  const [points, page] = await Promise.all([
    getMapPoints({ ...query, limit: undefined, offset: undefined }),
    searchListings({ ...query, limit: query.limit ?? 20 }),
  ]);
  return Response.json({ total: page.total, points, listings: page.listings });
}
