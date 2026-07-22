import { NextResponse } from "next/server";
import { fail, getById, remove, requireUser, uniqueSlug, update } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { error } = await requireUser(req, "pages");
  if (error) return error;
  const page = await getById("pages", params.id);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PUT(req, { params }) {
  const { error } = await requireUser(req, "pages");
  if (error) return error;
  try {
    const page = await getById("pages", params.id);
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await req.json();
    const slug = await uniqueSlug("pages", body.slug || body.title || page.title, params.id);
    return NextResponse.json(await update("pages", params.id, {
      title: body.title ?? page.title,
      slug,
      coverImage: body.coverImage ?? page.coverImage,
      contentHtml: body.contentHtml ?? page.contentHtml,
      status: body.status === "published" ? "published" : "draft",
    }));
  } catch (e) { return fail(e); }
}

export async function DELETE(req, { params }) {
  const { error } = await requireUser(req, "pages");
  if (error) return error;
  try { await remove("pages", params.id); return NextResponse.json({ ok: true }); }
  catch (e) { return fail(e); }
}
