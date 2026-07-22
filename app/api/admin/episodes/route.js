import { NextResponse } from "next/server";
import { fail, getAll, insert, requireUser, uniqueSlug } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const { error } = await requireUser(req, "episodes");
  if (error) return error;
  const eps = await getAll("episodes");
  eps.sort((a, b) => (b.number || 0) - (a.number || 0));
  return NextResponse.json(eps);
}

export async function POST(req) {
  const { error } = await requireUser(req, "episodes");
  if (error) return error;
  try {
    const body = await req.json();
    if (!body.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
    const slug = await uniqueSlug("episodes", body.slug || body.title);
    const ep = await insert("episodes", {
      title: body.title.trim(),
      slug,
      number: Number(body.number) || 0,
      guest: body.guest || "",
      role: body.role || "",
      image: body.image || "",
      youtube: body.youtube || "",
      date: body.date || new Date().toISOString().slice(0, 10),
      duration: body.duration || "",
      live: !!body.live,
      tagline: body.tagline || "",
      contentHtml: body.contentHtml || "",
      status: body.status === "published" ? "published" : "draft",
    });
    return NextResponse.json(ep, { status: 201 });
  } catch (e) { return fail(e); }
}
