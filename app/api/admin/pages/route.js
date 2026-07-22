import { NextResponse } from "next/server";
import { fail, getAll, insert, requireUser, uniqueSlug } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const { error } = await requireUser(req, "pages");
  if (error) return error;
  const pages = await getAll("pages");
  pages.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return NextResponse.json(pages);
}

export async function POST(req) {
  const { error } = await requireUser(req, "pages");
  if (error) return error;
  try {
    const body = await req.json();
    if (!body.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
    const slug = await uniqueSlug("pages", body.slug || body.title);
    const page = await insert("pages", {
      title: body.title.trim(),
      slug,
      coverImage: body.coverImage || "",
      contentHtml: body.contentHtml || "",
      status: body.status === "published" ? "published" : "draft",
    });
    return NextResponse.json(page, { status: 201 });
  } catch (e) { return fail(e); }
}
