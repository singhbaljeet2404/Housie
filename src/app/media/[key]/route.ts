import { getBinary } from "@/lib/storage";

// Serves images uploaded in the admin (e.g. the agent headshot). Keys include a
// timestamp, so each upload gets a new URL and can be cached forever.
export async function GET(_request: Request, { params }: RouteContext<"/media/[key]">) {
  const { key } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(key)) return new Response("Not found", { status: 404 });
  const file = await getBinary("media", key);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(file.data, {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
