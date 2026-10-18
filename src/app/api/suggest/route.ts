import type { NextRequest } from "next/server";
import { suggest } from "@/lib/listings";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 100);
  return Response.json({ suggestions: await suggest(q) });
}
