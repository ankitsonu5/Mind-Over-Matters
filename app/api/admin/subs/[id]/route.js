import { NextResponse } from "next/server";
import { fail, remove, requireUser, update } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
  const { error } = await requireUser(req, "submissions");
  if (error) return error;
  try {
    const body = await req.json();
    return NextResponse.json(await update("submissions", params.id, { read: !!body.read }));
  } catch (e) { return fail(e); }
}

export async function DELETE(req, { params }) {
  const { error } = await requireUser(req, "submissions");
  if (error) return error;
  try { await remove("submissions", params.id); return NextResponse.json({ ok: true }); }
  catch (e) { return fail(e); }
}
