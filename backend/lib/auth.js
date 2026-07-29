// =====================================================================
//  AUTH - users + roles (admin / editor / author).
//  A session is a signed string: "<userId>.<role>.<expiry>.<hmac>"
//  It is returned to the client in TWO ways so both styles work:
//    1. an httpOnly cookie  (used when the frontend proxies /api)
//    2. a token in the JSON body (used as "Authorization: Bearer ...")
// =====================================================================
import crypto from "crypto";

export const AUTH_COOKIE = "mom_session";
const DAYS = 7;

function secret() {
  return process.env.AUTH_SECRET || "mom-secret::" + (process.env.ADMIN_PASSWORD || "admin123");
}

function hmacHex(msg) {
  return crypto.createHmac("sha256", secret()).update(msg).digest("hex");
}

export function hashPassword(password) {
  return hmacHex("pw::" + password);
}

export function verifyPassword(password, hash) {
  const a = Buffer.from(hashPassword(password));
  const b = Buffer.from(String(hash || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function createSession(user) {
  const exp = Date.now() + DAYS * 864e5;
  const payload = `${user.id}.${user.role}.${exp}`;
  return `${payload}.${hmacHex("sess::" + payload)}`;
}

export function verifySession(token) {
  if (!token) return null;
  const parts = String(token).split(".");
  if (parts.length !== 4) return null;
  const [id, role, expStr, sig] = parts;
  if (Date.now() > Number(expStr)) return null;
  const payload = `${id}.${role}.${expStr}`;
  if (hmacHex("sess::" + payload) !== sig) return null;
  return { id, role };
}

export function cookieOptions() {
  const crossSite = process.env.COOKIE_SAMESITE === "none";
  return {
    httpOnly: true,
    sameSite: crossSite ? "none" : "lax",
    secure: crossSite || process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DAYS * 86400 * 1000, // express expects milliseconds
  };
}

export const ROLES = ["admin", "editor", "author"];

export function canAccess(role, section) {
  const map = {
    admin: ["dashboard", "posts", "episodes", "pages", "media", "forms", "submissions", "users", "plugins", "settings"],
    editor: ["dashboard", "posts", "episodes", "pages", "media", "forms", "submissions"],
    author: ["dashboard", "posts", "media"],
  };
  return (map[role] || []).includes(section);
}

/* Reads the session from either the cookie or the Authorization header. */
export function sessionFromRequest(req) {
  const bearer = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const token = bearer || req.cookies?.[AUTH_COOKIE] || "";
  return verifySession(token);
}
