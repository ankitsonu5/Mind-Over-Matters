import { getAll, getById, insert, remove, update } from "../lib/store.js";
import { ROLES, hashPassword } from "../lib/auth.js";

/* GET /api/admin/users
   Any logged-in user may list users (the editor needs it for the
   "assign author" dropdown) - password hashes are always stripped. */
export async function list(_req, res) {
  const users = await getAll("users");
  res.json(users.map(({ passwordHash, ...u }) => u));
}

/* POST /api/admin/users - admin only */
export async function create(req, res) {
  const body = req.body || {};
  const username = (body.username || "").trim().toLowerCase();
  if (!username || !body.password) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  const users = await getAll("users");
  if (users.some((u) => u.username === username)) {
    return res.status(400).json({ error: "This username is already taken." });
  }
  const user = await insert("users", {
    username,
    name: body.name || username,
    email: body.email || "",
    role: ROLES.includes(body.role) ? body.role : "author",
    passwordHash: hashPassword(body.password),
  });
  const { passwordHash, ...safe } = user;
  res.status(201).json(safe);
}

/* PUT /api/admin/users/:id
   Admins may edit anyone; everyone else only their own profile. */
export async function updateOne(req, res) {
  if (req.user.role !== "admin" && req.user.id !== req.params.id) {
    return res.status(403).json({ error: "Permission denied." });
  }
  const user = await getById("users", req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });

  const body = req.body || {};
  const patch = {
    name: body.name ?? user.name,
    email: body.email ?? user.email,
  };
  if (req.user.role === "admin" && body.role && ROLES.includes(body.role)) {
    patch.role = body.role; // only admins may change roles
  }
  if (body.password) patch.passwordHash = hashPassword(body.password);

  const updated = await update("users", req.params.id, patch);
  const { passwordHash, ...safe } = updated;
  res.json(safe);
}

/* DELETE /api/admin/users/:id - admin only */
export async function removeOne(req, res) {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ error: "You cannot delete your own account." });
  }
  const users = await getAll("users");
  const target = users.find((u) => u.id === req.params.id);
  if (target?.role === "admin" && users.filter((u) => u.role === "admin").length <= 1) {
    return res.status(400).json({ error: "The last admin cannot be deleted." });
  }
  await remove("users", req.params.id);
  res.json({ ok: true });
}
