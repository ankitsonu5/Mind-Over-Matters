import { NextResponse } from "next/server";
import { fail, getAll, insert, requireUser } from "@/lib/admin-api";
import { ROLES, hashPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  // any logged-in user can list users (needed for author-assign dropdown);
  // password hashes are stripped
  const { error } = await requireUser(req);
  if (error) return error;
  const users = await getAll("users");
  return NextResponse.json(users.map(({ passwordHash, ...u }) => u));
}

export async function POST(req) {
  const { error } = await requireUser(req, "users");
  if (error) return error;
  try {
    const body = await req.json();
    const username = (body.username || "").trim().toLowerCase();
    if (!username || !body.password) {
      return NextResponse.json({ error: "Username aur password required." }, { status: 400 });
    }
    const users = await getAll("users");
    if (users.some((u) => u.username === username)) {
      return NextResponse.json({ error: "This username is already taken." }, { status: 400 });
    }
    const user = await insert("users", {
      username,
      name: body.name || username,
      email: body.email || "",
      role: ROLES.includes(body.role) ? body.role : "author",
      passwordHash: await hashPassword(body.password),
    });
    const { passwordHash, ...safe } = user;
    return NextResponse.json(safe, { status: 201 });
  } catch (e) { return fail(e); }
}
