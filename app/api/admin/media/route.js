import { NextResponse } from "next/server";
import { fail, getAll, insert, requireUser } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BYTES = 4 * 1024 * 1024; // ~4MB — DB-stored media limit

export async function GET(req) {
  const { error } = await requireUser(req, "media");
  if (error) return error;
  const media = await getAll("media");
  // don't ship the base64 payloads in the list — sirf metadata
  return NextResponse.json(
    media
      .map(({ data, ...m }) => ({ ...m, url: `/api/media/${m.id}` }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  );
}

export async function POST(req) {
  const { error } = await requireUser(req, "media");
  if (error) return error;
  try {
    const body = await req.json();
    const { filename, mime, data } = body; // data = base64 (no data: prefix)
    if (!filename || !mime || !data) {
      return NextResponse.json({ error: "filename, mime, data required" }, { status: 400 });
    }
    const bytes = Math.ceil((data.length * 3) / 4);
    if (bytes > MAX_BYTES) {
      return NextResponse.json({ error: "File exceeds 4MB — use a smaller image or an external URL." }, { status: 400 });
    }
    const item = await insert("media", {
      filename: String(filename).slice(0, 200),
      mime: String(mime).slice(0, 100),
      size: bytes,
      data,
    });
    const { data: _d, ...meta } = item;
    return NextResponse.json({ ...meta, url: `/api/media/${item.id}` }, { status: 201 });
  } catch (e) { return fail(e); }
}
