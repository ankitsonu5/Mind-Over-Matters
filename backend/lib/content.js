// =====================================================================
//  CONTENT - builds the public blog + episode lists.
//  Two sources are merged into one array with an identical shape:
//    1. admin-panel entries (MongoDB / data-store) with status "published"
//    2. seed markdown files in ./content/blog and ./content/episodes
//  An admin entry always wins over a markdown file with the same slug,
//  so nothing is ever shown twice.
// =====================================================================
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { fileURLToPath } from "url";
import { linkifyExternal } from "./seo.js";
import { getPublished } from "./store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, "..", "content", "blog");
const EP_DIR = path.join(__dirname, "..", "content", "episodes");

function fmtDate(iso, readTime) {
  try {
    const s = new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
    return readTime ? `${s} · ${readTime}` : s;
  } catch {
    return iso;
  }
}

function lazifyImages(html = "") {
  return html.replace(/<img\s(?![^>]*loading=)/gi, '<img loading="lazy" decoding="async" ');
}

function withHighlight(title, highlight) {
  return highlight && title.includes(highlight)
    ? title.replace(highlight, `<span>${highlight}</span>`)
    : title;
}

/* ------------------------------ blog posts -------------------------------- */
function buildPostFromMd(file) {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(fs.readFileSync(path.join(BLOG_DIR, file), "utf8"));
  const title = data.title || slug;
  const num = Number((String(data.category || "").match(/\d+/) || [])[0]) || 0;
  return {
    slug,
    source: "file",
    title,
    titlePlain: title,
    titleHtml: withHighlight(title, data.highlight || ""),
    highlight: data.highlight || "",
    category: data.category || "",
    tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
    num,
    excerpt: data.excerpt || "",
    img: data.image || "",
    image: data.image || "",
    imageAlt: data.imageAlt || "",
    author: "Ashwin Gane",
    rawDate: data.date || "",
    date: fmtDate(data.date, data.readTime),
    readTime: data.readTime || "",
    bg: data.bg || "#06080f",
    relatedEpisode: data.relatedEpisode || "",
    gallery: Array.isArray(data.gallery) ? data.gallery.filter((g) => g && g.image) : [],
    seo: null,
    bodyHtml: lazifyImages(linkifyExternal(marked.parse(content || ""))),
  };
}

function buildPostFromDb(p) {
  const title = p.title || p.slug;
  const num = Number((String(p.category || "").match(/\d+/) || [])[0]) || 0;
  return {
    slug: p.slug,
    source: "admin",
    title,
    titlePlain: title,
    titleHtml: withHighlight(title, p.highlight || ""),
    highlight: p.highlight || "",
    category: p.category || "",
    tags: Array.isArray(p.tags) ? p.tags : [],
    num,
    excerpt: p.excerpt || "",
    img: p.coverImage || "",
    image: p.coverImage || "",
    imageAlt: p.coverImageAlt || "",
    author: p.authorName || "Ashwin Gane",
    rawDate: p.publishedAt || p.createdAt || "",
    date: fmtDate(p.publishedAt || p.createdAt, p.readTime),
    readTime: p.readTime || "",
    bg: p.bg || "#06080f",
    relatedEpisode: p.relatedEpisode || "",
    gallery: [],
    seo: p.seo || null,
    bodyHtml: lazifyImages(linkifyExternal(p.contentHtml || "")),
  };
}

export async function getAllPosts() {
  let dbPosts = [];
  try {
    dbPosts = (await getPublished("posts")).map(buildPostFromDb);
  } catch {
    dbPosts = [];
  }
  return dbPosts.sort(
    (a, b) => new Date(b.rawDate) - new Date(a.rawDate)
  );
}

export async function getPost(slug) {
  return (await getAllPosts()).find((p) => p.slug === slug) || null;
}

/* ------------------------------- episodes --------------------------------- */
function buildEpisodeFromMd(file) {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(fs.readFileSync(path.join(EP_DIR, file), "utf8"));
  return {
    slug,
    source: "file",
    number: Number(data.number) || 0,
    title: data.title || slug,
    guest: data.guest || "",
    role: data.role || "",
    image: data.image || "",
    youtube: data.youtube || "",
    rawDate: data.date || "",
    date: fmtDate(data.date),
    duration: data.duration || "",
    live: data.live === true || data.live === "true",
    tagline: data.tagline || "",
    bodyHtml: linkifyExternal(marked.parse(content || "")),
  };
}

function buildEpisodeFromDb(e) {
  return {
    slug: e.slug,
    source: "admin",
    number: Number(e.number) || 0,
    title: e.title || e.slug,
    guest: e.guest || "",
    role: e.role || "",
    image: e.image || "",
    youtube: e.youtube || "",
    rawDate: e.date || e.createdAt || "",
    date: fmtDate(e.date || e.createdAt),
    duration: e.duration || "",
    live: !!e.live,
    tagline: e.tagline || "",
    bodyHtml: linkifyExternal(e.contentHtml || ""),
  };
}

export async function getAllEpisodes() {
  let dbEps = [];
  try {
    dbEps = (await getPublished("episodes")).map(buildEpisodeFromDb);
  } catch {
    dbEps = [];
  }
  return dbEps.sort((a, b) => b.number - a.number);
}

export async function getEpisode(slug) {
  return (await getAllEpisodes()).find((e) => e.slug === slug) || null;
}

/* Used by the "import markdown posts" admin action. */
export function readBlogMarkdownFiles() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(BLOG_DIR, file), "utf8"));
      return { slug: file.replace(/\.md$/, ""), data, contentHtml: marked.parse(content || "") };
    });
}
