import { NextResponse } from "next/server";
import { getAll, requireUser } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const { error } = await requireUser(req, "submissions");
  if (error) return error;
  const subs = await getAll("submissions");
  subs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return NextResponse.json(subs);
}
