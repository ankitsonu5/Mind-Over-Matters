import { NextResponse } from "next/server";
import { fail, getById, remove, requireUser, uniqueSlug, update } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { error } = await requireUser(req, "forms");
  if (error) return error;
  const form = await getById("forms", params.id);
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(form);
}

export async function PUT(req, { params }) {
  const { error } = await requireUser(req, "forms");
  if (error) return error;
  try {
    const form = await getById("forms", params.id);
    if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await req.json();
    const slug = await uniqueSlug("forms", body.slug || body.name || form.name, params.id);
    return NextResponse.json(await update("forms", params.id, {
      name: body.name ?? form.name,
      slug,
      html: body.html ?? form.html,
      css: body.css ?? form.css,
      successMessage: body.successMessage ?? form.successMessage,
      active: body.active ?? form.active,
    }));
  } catch (e) { return fail(e); }
}

export async function DELETE(req, { params }) {
  const { error } = await requireUser(req, "forms");
  if (error) return error;
  try { await remove("forms", params.id); return NextResponse.json({ ok: true }); }
  catch (e) { return fail(e); }
}
