import {
  AUTH_COOKIE, cookieOptions, createSession, hashPassword, verifyPassword,
} from "../lib/auth.js";
import { ensureAdminUser, getAll, getById } from "../lib/store.js";

/* POST /api/admin/login */
export async function login(req, res) {
  const { username, password } = req.body || {};

  await ensureAdminUser(hashPassword);
  const users = await getAll("users");
  const user = users.find((u) => u.username === username);

  if (!user || !verifyPassword(password || "", user.passwordHash)) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const token = createSession(user);
  res.cookie(AUTH_COOKIE, token, cookieOptions());
  res.json({
    ok: true,
    token, // for clients that prefer "Authorization: Bearer <token>"
    user: { id: user.id, name: user.name, role: user.role },
  });
}

/* POST /api/admin/logout */
export async function logout(_req, res) {
  res.clearCookie(AUTH_COOKIE, { path: "/" });
  res.json({ ok: true });
}

/* GET /api/admin/me */
export async function me(req, res) {
  const user = await getById("users", req.user.id);
  if (!user) return res.status(401).json({ error: "User not found" });
  const { passwordHash, ...safe } = user;
  res.json(safe);
}
