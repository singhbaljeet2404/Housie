import { getListing } from "@/lib/listings";
import { listingPath } from "@/lib/format";

// Short link used in lead emails: /l/<id> → canonical listing URL.
export async function GET(request: Request, { params }: RouteContext<"/l/[id]">) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return new Response("Listing not found", { status: 404 });
  return Response.redirect(new URL(listingPath(listing), request.url), 308);
}
