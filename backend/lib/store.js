// =====================================================================
//  STORE - the single data layer for the whole API.
//  Mode is picked automatically:
//    MONGODB_URI set -> MongoDB (production, data persists)
//    otherwise       -> JSON files in ./data-store (local dev)
//  Collections: users, posts, episodes, pages, forms, plugins, media,
//               submissions, settings
// =====================================================================
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { getDb, hasMongo } from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data-store");

export const COLLECTIONS = [
  "users", "posts", "episodes", "pages", "forms",
  "plugins", "media", "submissions", "settings",
];

export function newId() {
  return crypto.randomBytes(8).toString("hex");
}

export function slugify(str = "") {
  return (
    String(str).toLowerCase().trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9\u0900-\u097F]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item-" + Date.now()
  );
}

/* ------------------------------- Mongo mode ------------------------------- */
async function mongoDb() {
  if (!hasMongo()) return null;
  return getDb();
}

/* ----------------------------- JSON file mode ------------------------------ */
async function readFileCol(name) {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf8"));
  } catch {
    return [];
  }
}

async function writeFileCol(name, docs) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, `${name}.json`), JSON.stringify(docs, null, 2));
}

/* --------------------------------- CRUD API -------------------------------- */
export async function getAll(col) {
  if (!COLLECTIONS.includes(col)) throw new Error("Unknown collection: " + col);
  const db = await mongoDb();
  if (db) {
    const docs = await db.collection("adm_" + col).find({}).toArray();
    return docs.map(({ _id, ...rest }) => rest);
  }
  return readFileCol(col);
}

export async function getById(col, id) {
  const db = await mongoDb();
  if (db) {
    const doc = await db.collection("adm_" + col).findOne({ id });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest;
  }
  return (await readFileCol(col)).find((d) => d.id === id) || null;
}

export async function getBySlug(col, slug) {
  const db = await mongoDb();
  if (db) {
    const doc = await db.collection("adm_" + col).findOne({ slug });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest;
  }
  return (await readFileCol(col)).find((d) => d.slug === slug) || null;
}

export async function insert(col, doc) {
  const now = new Date().toISOString();
  const rec = { id: newId(), createdAt: now, updatedAt: now, ...doc };
  const db = await mongoDb();
  if (db) {
    await db.collection("adm_" + col).insertOne({ ...rec });
    return rec;
  }
  const all = await readFileCol(col);
  all.unshift(rec);
  await writeFileCol(col, all);
  return rec;
}

export async function update(col, id, patch) {
  const now = new Date().toISOString();
  const db = await mongoDb();
  if (db) {
    await db.collection("adm_" + col).updateOne({ id }, { $set: { ...patch, updatedAt: now } });
    return getById(col, id);
  }
  const all = await readFileCol(col);
  const i = all.findIndex((d) => d.id === id);
  if (i === -1) return null;
  all[i] = { ...all[i], ...patch, updatedAt: now };
  await writeFileCol(col, all);
  return all[i];
}

export async function remove(col, id) {
  const db = await mongoDb();
  if (db) {
    await db.collection("adm_" + col).deleteOne({ id });
    return true;
  }
  await writeFileCol(col, (await readFileCol(col)).filter((d) => d.id !== id));
  return true;
}

/* -------------------------------- Settings --------------------------------- */
export async function getSettings() {
  const rows = await getAll("settings");
  const s = rows[0] || {};
  return {
    siteTitle: "Mind Over Matter",
    tagline: "See Past The Surface",
    siteUrl: "",
    contactEmail: "",
    notifyEmail: "",
    ...s,
  };
}

export async function saveSettings(patch) {
  const rows = await getAll("settings");
  if (rows[0]?.id) return update("settings", rows[0].id, patch);
  return insert("settings", patch);
}

/* ------------------------------- Published --------------------------------- */
export async function getPublished(col) {
  return (await getAll(col)).filter((d) => d.status === "published");
}

/* --------------------------- Slug uniqueness ------------------------------- */
export async function uniqueSlug(col, wanted, excludeId = null) {
  let slug = slugify(wanted);
  const clash = await getBySlug(col, slug);
  if (clash && clash.id !== excludeId) slug = `${slug}-${Date.now().toString(36)}`;
  return slug;
}

/* -------------------------- Default admin seeding --------------------------
   In Mongo mode the seed JSON files are not used, so make sure at least one
   admin user exists (env ADMIN_USER / ADMIN_PASSWORD, else admin/admin123). */
export async function ensureAdminUser(hashPassword) {
  const users = await getAll("users");
  if (users.length > 0) return;
  const username = process.env.ADMIN_USER || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  await insert("users", {
    username,
    name: "Administrator",
    email: "",
    role: "admin",
    passwordHash: await hashPassword(password),
  });
}
