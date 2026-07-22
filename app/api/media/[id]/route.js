import { getById } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const item = await getById("media", params.id);
  if (!item?.data) return new Response("Not found", { status: 404 });
  const buf = Buffer.from(item.data, "base64");
  return new Response(buf, {
    headers: {
      "Content-Type": item.mime || "application/octet-stream",
      "Content-Length": String(buf.length),
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
