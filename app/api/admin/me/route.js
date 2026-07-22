import { NextResponse } from "next/server";
import { requireUser, getById } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const { session, error } = await requireUser(req);
  if (error) return error;
  const user = await getById("users", session.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });
  const { passwordHash, ...safe } = user;
  return NextResponse.json(safe);
}
