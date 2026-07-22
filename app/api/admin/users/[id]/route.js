import { NextResponse } from "next/server";
import { fail, getAll, getById, remove, requireUser, update } from "@/lib/admin-api";
import { ROLES, hashPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
  const { session, error } = await requireUser(req);
  if (error) return error;
  // admin can edit anyone; others can only edit their own profile/password
  if (session.role !== "admin" && session.id !== params.id) {
    return NextResponse.json({ error: "Permission denied." }, { status: 403 });
  }
  try {
    const user = await getById("users", params.id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await req.json();
    const patch = {
      name: body.name ?? user.name,
      email: body.email ?? user.email,
    };
    if (session.role === "admin" && body.role && ROLES.includes(body.role)) {
      // only admins may change roles
      patch.role = body.role;
    }
    if (body.password) patch.passwordHash = await hashPassword(body.password);
    const updated = await update("users", params.id, patch);
    const { passwordHash, ...safe } = updated;
    return NextResponse.json(safe);
  } catch (e) { return fail(e); }
}

export async function DELETE(req, { params }) {
  const { session, error } = await requireUser(req, "users");
  if (error) return error;
  if (session.id === params.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }
  try {
    const users = await getAll("users");
    const target = users.find((u) => u.id === params.id);
    if (target?.role === "admin" && users.filter((u) => u.role === "admin").length <= 1) {
      return NextResponse.json({ error: "The last admin cannot be deleted." }, { status: 400 });
    }
    await remove("users", params.id);
    return NextResponse.json({ ok: true });
  } catch (e) { return fail(e); }
}
