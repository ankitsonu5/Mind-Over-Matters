// =====================================================================
//  Admin API helpers — session guard + role checks + shared CRUD logic.
// =====================================================================
import { NextResponse } from "next/server";
import { canAccess, getSessionFromRequest } from "@/lib/auth";
import { getAll, getById, getBySlug, insert, remove, slugify, update } from "@/lib/store";

export async function requireUser(req, section) {
  const session = await getSessionFromRequest(req);
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (section && !canAccess(session.role, section)) {
    return { error: NextResponse.json({ error: "Permission denied (role: " + session.role + ")" }, { status: 403 }) };
  }
  return { session };
}

export function fail(e, extra = "") {
  return NextResponse.json(
    { error: "Save failed: " + e.message + (extra ? " — " + extra : "") + " (on Vercel, MONGODB_URI must be configured)" },
    { status: 500 }
  );
}

export async function uniqueSlug(col, wanted, excludeId = null) {
  let slug = slugify(wanted);
  const clash = await getBySlug(col, slug);
  if (clash && clash.id !== excludeId) slug = `${slug}-${Date.now().toString(36)}`;
  return slug;
}

export { getAll, getById, getBySlug, insert, remove, update, slugify };
