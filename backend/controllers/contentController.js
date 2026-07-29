// =====================================================================
//  Episodes, pages, forms and plugins all follow the same CRUD shape,
//  so they share one controller. The only thing that differs per type
//  is which fields are accepted - that lives in the `shape` functions
//  below, which keeps unknown keys from ever reaching the database.
// =====================================================================
import { getAll, getById, insert, remove, update, uniqueSlug } from "../lib/store.js";

const SHAPES = {
  episodes: {
    titleField: "title",
    sort: (a, b) => (b.number || 0) - (a.number || 0),
    shape: (body, prev = {}) => ({
      title: body.title ?? prev.title,
      number: Number(body.number ?? prev.number) || 0,
      guest: body.guest ?? prev.guest ?? "",
      role: body.role ?? prev.role ?? "",
      image: body.image ?? prev.image ?? "",
      youtube: body.youtube ?? prev.youtube ?? "",
      date: body.date ?? prev.date ?? new Date().toISOString().slice(0, 10),
      duration: body.duration ?? prev.duration ?? "",
      live: body.live ?? prev.live ?? false,
      tagline: body.tagline ?? prev.tagline ?? "",
      contentHtml: body.contentHtml ?? prev.contentHtml ?? "",
      status: body.status === "published" ? "published" : "draft",
    }),
  },

  pages: {
    titleField: "title",
    sort: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    shape: (body, prev = {}) => ({
      title: body.title ?? prev.title,
      coverImage: body.coverImage ?? prev.coverImage ?? "",
      contentHtml: body.contentHtml ?? prev.contentHtml ?? "",
      status: body.status === "published" ? "published" : "draft",
    }),
  },

  forms: {
    titleField: "name",
    sort: null,
    shape: (body, prev = {}) => ({
      name: body.name ?? prev.name,
      html: body.html ?? prev.html ?? "",
      css: body.css ?? prev.css ?? "",
      successMessage: body.successMessage ?? prev.successMessage ?? "Thanks! Your message was sent.",
      active: body.active ?? prev.active ?? true,
    }),
  },

  plugins: {
    titleField: "name",
    sort: null,
    shape: (body, prev = {}) => ({
      name: body.name ?? prev.name,
      description: body.description ?? prev.description ?? "",
      version: body.version ?? prev.version ?? "1.0.0",
      author: body.author ?? prev.author ?? "",
      kind: ["js", "css", "html"].includes(body.kind) ? body.kind : prev.kind || "js",
      code: body.code ?? prev.code ?? "",
      active: body.active ?? prev.active ?? true,
    }),
  },
};

/* Builds the five handlers for one collection. */
export function crudFor(col) {
  const cfg = SHAPES[col];
  if (!cfg) throw new Error("No CRUD shape defined for: " + col);

  return {
    async list(_req, res) {
      const rows = await getAll(col);
      if (cfg.sort) rows.sort(cfg.sort);
      res.json(rows);
    },

    async getOne(req, res) {
      const doc = await getById(col, req.params.id);
      if (!doc) return res.status(404).json({ error: "Not found" });
      res.json(doc);
    },

    async create(req, res) {
      const body = req.body || {};
      const label = body[cfg.titleField];
      if (!label?.trim()) {
        return res.status(400).json({ error: `${cfg.titleField} is required` });
      }
      const slug = await uniqueSlug(col, body.slug || label);
      const doc = await insert(col, { ...cfg.shape(body), [cfg.titleField]: label.trim(), slug });
      res.status(201).json(doc);
    },

    async updateOne(req, res) {
      const prev = await getById(col, req.params.id);
      if (!prev) return res.status(404).json({ error: "Not found" });
      const body = req.body || {};
      const slug = await uniqueSlug(
        col,
        body.slug || body[cfg.titleField] || prev[cfg.titleField],
        req.params.id
      );
      res.json(await update(col, req.params.id, { ...cfg.shape(body, prev), slug }));
    },

    async removeOne(req, res) {
      await remove(col, req.params.id);
      res.json({ ok: true });
    },
  };
}

export const episodes = crudFor("episodes");
export const pages = crudFor("pages");
export const forms = crudFor("forms");
export const plugins = crudFor("plugins");
