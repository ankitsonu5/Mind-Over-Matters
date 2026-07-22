// =====================================================================
//  AUTH — users + roles (admin / editor / author), Web Crypto only so the
//  same verification runs in Edge middleware and Node API routes.
//  Session cookie: "<userId>.<role>.<exp>.<hmac>"
// =====================================================================

export const AUTH_COOKIE = "mom_session";
const DAYS = 7;

function secret() {
  return process.env.AUTH_SECRET || "mom-secret::" + (process.env.ADMIN_PASSWORD || "admin123");
}

async function hmacHex(msg) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password) {
  return hmacHex("pw::" + password);
}
export async function verifyPassword(password, hash) {
  return (await hashPassword(password)) === hash;
}

export async function createSession(user) {
  const exp = Date.now() + DAYS * 864e5;
  const payload = `${user.id}.${user.role}.${exp}`;
  return `${payload}.${await hmacHex("sess::" + payload)}`;
}

export async function verifySession(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [id, role, expStr, sig] = parts;
  if (Date.now() > Number(expStr)) return null;
  const payload = `${id}.${role}.${expStr}`;
  if ((await hmacHex("sess::" + payload)) !== sig) return null;
  return { id, role };
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DAYS * 86400,
  };
}

/* ------------- Node-side guard for admin API routes -------------
   usage: const user = await requireUser(req, ["admin","editor"]);
   throws Response-like object {status,error} via return null pattern  */
export async function getSessionFromRequest(req) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(new RegExp(`${AUTH_COOKIE}=([^;]+)`));
  return verifySession(m ? decodeURIComponent(m[1]) : null);
}

export const ROLES = ["admin", "editor", "author"];

export function canAccess(role, section) {
  const map = {
    admin: ["dashboard","posts","episodes","pages","media","forms","submissions","users","plugins","settings"],
    editor: ["dashboard","posts","episodes","pages","media","forms","submissions"],
    author: ["dashboard","posts","media"],
  };
  return (map[role] || []).includes(section);
}
