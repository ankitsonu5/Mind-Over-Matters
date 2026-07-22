import { NextResponse } from "next/server";
import { fail, remove, requireUser } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req, { params }) {
  const { error } = await requireUser(req, "media");
  if (error) return error;
  try { await remove("media", params.id); return NextResponse.json({ ok: true }); }
  catch (e) { return fail(e); }
}
