import { NextResponse } from "next/server";
import { fail, getById, remove, requireUser, uniqueSlug, update } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { error } = await requireUser(req, "plugins");
  if (error) return error;
  const p = await getById("plugins", params.id);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(p);
}

export async function PUT(req, { params }) {
  const { error } = await requireUser(req, "plugins");
  if (error) return error;
  try {
    const p = await getById("plugins", params.id);
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await req.json();
    const slug = await uniqueSlug("plugins", body.slug || body.name || p.name, params.id);
    return NextResponse.json(await update("plugins", params.id, {
      name: body.name ?? p.name,
      slug,
      description: body.description ?? p.description,
      version: body.version ?? p.version,
      author: body.author ?? p.author,
      kind: body.kind ?? p.kind,
      code: body.code ?? p.code,
      active: body.active ?? p.active,
    }));
  } catch (e) { return fail(e); }
}

export async function DELETE(req, { params }) {
  const { error } = await requireUser(req, "plugins");
  if (error) return error;
  try { await remove("plugins", params.id); return NextResponse.json({ ok: true }); }
  catch (e) { return fail(e); }
}
