// =====================================================================
//  PUBLIC API - everything the website itself needs, with no auth.
//  The frontend never touches the database directly; it reads from here.
//  Shortcodes and FAQ accordions are expanded on this side so the
//  frontend only ever has to render a finished HTML string.
// =====================================================================
import { getAllEpisodes, getAllPosts, getEpisode, getPost } from "../lib/content.js";
import { getBySlug, getPublished, getAll, getSettings } from "../lib/store.js";
import { renderFaqAccordions, renderFormHtml, replaceFormShortcodes } from "../lib/forms.js";

/* GET /api/public/posts */
export async function posts(_req, res) {
  res.json(await getAllPosts());
}

/* GET /api/public/posts/:slug */
export async function post(req, res) {
  const found = await getPost(req.params.slug);
  if (!found) return res.status(404).json({ error: "Not found" });
  const bodyHtml = renderFaqAccordions(await replaceFormShortcodes(found.bodyHtml));
  res.json({ ...found, bodyHtml });
}

/* GET /api/public/episodes */
export async function episodes(_req, res) {
  res.json(await getAllEpisodes());
}

/* GET /api/public/episodes/:slug */
export async function episode(req, res) {
  const found = await getEpisode(req.params.slug);
  if (!found) return res.status(404).json({ error: "Not found" });
  res.json(found);
}

/* GET /api/public/pages/:slug - published custom pages only */
export async function page(req, res) {
  const found = await getBySlug("pages", req.params.slug);
  if (!found || found.status !== "published") {
    return res.status(404).json({ error: "Not found" });
  }
  const contentHtml = renderFaqAccordions(await replaceFormShortcodes(found.contentHtml || ""));
  res.json({ ...found, contentHtml });
}

/* GET /api/public/forms/:slug - returns the form plus its rendered markup */
export async function form(req, res) {
  const found = await getBySlug("forms", req.params.slug);
  if (!found || found.active === false) return res.status(404).json({ error: "Not found" });
  res.json({ ...found, renderedHtml: renderFormHtml(found) });
}

/* GET /api/public/plugins - active plugins injected into every page */
export async function plugins(_req, res) {
  const all = await getAll("plugins");
  res.json(all.filter((p) => p.active && p.code?.trim()));
}

/* GET /api/public/settings */
export async function settings(_req, res) {
  res.json(await getSettings());
}

/* GET /api/public/sitemap - everything sitemap.xml and robots.txt need */
export async function sitemap(_req, res) {
  const [cfg, allPosts, allEpisodes] = await Promise.all([
    getSettings(),
    getAllPosts(),
    getAllEpisodes(),
  ]);
  let pages = [];
  try {
    pages = await getPublished("pages");
  } catch { /* pages are optional */ }

  res.json({
    settings: cfg,
    posts: allPosts.map((p) => ({ slug: p.slug, rawDate: p.rawDate })),
    episodes: allEpisodes.map((e) => ({ slug: e.slug, rawDate: e.rawDate })),
    pages: pages.map((p) => ({ slug: p.slug })),
  });
}
