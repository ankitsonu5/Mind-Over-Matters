// =====================================================================
//  The single place the frontend talks to the backend.
//
//  There are two callers with different needs:
//
//    - Server components (blog pages, sitemap, plugin injector) run
//      inside Node, so they must use the backend's absolute URL. They
//      also opt out of caching, because the admin panel edits content
//      and the site should reflect that immediately.
//
//    - Browser code (the whole admin panel) uses plain "/api/..." and
//      lets the Next.js rewrite forward it. That keeps everything on one
//      origin, so the session cookie just works with no CORS dance.
// =====================================================================

const SERVER_BASE = (process.env.BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "");
const isServer = typeof window === "undefined";

export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return isServer ? `${SERVER_BASE}${p}` : p;
}

/* ------------------------------------------------------------------
   Server-side read. Returns `fallback` instead of throwing, because a
   backend hiccup should degrade a section of the page, not crash the
   whole render.
------------------------------------------------------------------ */
export async function apiGet(path, fallback = null) {
  try {
    const res = await fetch(apiUrl(path), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

/* ------------------------------------------------------------------
   Browser-side call for the admin panel. Sends the session cookie and,
   if one was stored at login, the bearer token as well — so the panel
   still works when it is hosted on a different domain than the API.
------------------------------------------------------------------ */
export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(apiUrl(path), { credentials: "include", ...options, headers });
}

/* ----------------------------- token store ----------------------------- */
const TOKEN_KEY = "mom_token";

export function getToken() {
  if (isServer) return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  if (isServer) return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch { /* private mode — the cookie still carries the session */ }
}

export function clearToken() {
  setToken(null);
}
