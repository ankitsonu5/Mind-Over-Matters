import { NextResponse } from "next/server";
import { fail, getById, remove, requireUser, uniqueSlug, update } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { error } = await requireUser(req, "episodes");
  if (error) return error;
  const ep = await getById("episodes", params.id);
  if (!ep) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(ep);
}

export async function PUT(req, { params }) {
  const { error } = await requireUser(req, "episodes");
  if (error) return error;
  try {
    const ep = await getById("episodes", params.id);
    if (!ep) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await req.json();
    const slug = await uniqueSlug("episodes", body.slug || body.title || ep.title, params.id);
    return NextResponse.json(await update("episodes", params.id, {
      title: body.title ?? ep.title,
      slug,
      number: Number(body.number ?? ep.number) || 0,
      guest: body.guest ?? ep.guest,
      role: body.role ?? ep.role,
      image: body.image ?? ep.image,
      youtube: body.youtube ?? ep.youtube,
      date: body.date ?? ep.date,
      duration: body.duration ?? ep.duration,
      live: body.live ?? ep.live,
      tagline: body.tagline ?? ep.tagline,
      contentHtml: body.contentHtml ?? ep.contentHtml,
      status: body.status === "published" ? "published" : "draft",
    }));
  } catch (e) { return fail(e); }
}

export async function DELETE(req, { params }) {
  const { error } = await requireUser(req, "episodes");
  if (error) return error;
  try { await remove("episodes", params.id); return NextResponse.json({ ok: true }); }
  catch (e) { return fail(e); }
}
