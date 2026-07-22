import { NextResponse } from "next/server";
import { AUTH_COOKIE, verifySession } from "@/lib/auth";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin/login") || pathname.startsWith("/api/admin/login")) {
    return NextResponse.next();
  }
  const needsAuth = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!needsAuth) return NextResponse.next();

  // Existing /api/admin/submissions route keeps its own x-admin-key auth too;
  // a valid session cookie also passes.
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const session = await verifySession(token);
  if (session) return NextResponse.next();

  if (pathname === "/api/admin/submissions" && req.headers.get("x-admin-key")) {
    return NextResponse.next(); // legacy panel key flow — route validates it
  }
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL("/admin/login", req.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
