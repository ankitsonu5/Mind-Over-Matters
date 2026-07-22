import { NextResponse } from "next/server";
import { fail, getAll, insert, requireUser, uniqueSlug } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const { error } = await requireUser(req, "forms");
  if (error) return error;
  return NextResponse.json(await getAll("forms"));
}

export async function POST(req) {
  const { error } = await requireUser(req, "forms");
  if (error) return error;
  try {
    const body = await req.json();
    if (!body.name?.trim()) return NextResponse.json({ error: "Form name required" }, { status: 400 });
    const slug = await uniqueSlug("forms", body.slug || body.name);
    const form = await insert("forms", {
      name: body.name.trim(),
      slug,
      html: body.html || "",
      css: body.css || "",
      successMessage: body.successMessage || "Thanks! Your message was sent.",
      active: body.active !== false,
    });
    return NextResponse.json(form, { status: 201 });
  } catch (e) { return fail(e); }
}
