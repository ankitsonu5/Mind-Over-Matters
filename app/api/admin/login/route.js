import { NextResponse } from "next/server";
import { AUTH_COOKIE, cookieOptions, createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { ensureAdminUser, getAll } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const { username, password } = await req.json().catch(() => ({}));
  try {
    await ensureAdminUser(hashPassword);
    const users = await getAll("users");
    const user = users.find((u) => u.username === username);
    if (!user || !(await verifyPassword(password || "", user.passwordHash))) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, role: user.role } });
    res.cookies.set(AUTH_COOKIE, await createSession(user), cookieOptions());
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Login failed: " + e.message }, { status: 500 });
  }
}
