// =====================================================================
//  BLOG — merges two sources into one list (same shape as before):
//    1. Admin panel posts (MongoDB / data-store) — status "published"
//    2. Seed markdown files in content/blog/*.md (used only when no
//       admin post has the same slug)
//  NOTE: functions are async now (admin data is async).
// =====================================================================
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { linkifyExternal } from "@/lib/seo";
import { getPublished } from "@/lib/store";
import { renderFaqAccordions, replaceFormShortcodes } from "@/lib/forms";

const DIR = path.join(process.cwd(), "content/blog");

function fmtDate(iso, readTime) {
  try {
    const d = new Date(iso);
    const s = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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

function buildMd(file) {
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
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

function buildDb(p) {
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
    dbPosts = (await getPublished("posts")).map(buildDb);
  } catch { dbPosts = []; }

  const dbSlugs = new Set(dbPosts.map((p) => p.slug));
  let filePosts = [];
  if (fs.existsSync(DIR)) {
    filePosts = fs.readdirSync(DIR)
      .filter((f) => f.endsWith(".md"))
      .map(buildMd)
      .filter((p) => !dbSlugs.has(p.slug));
  }
  return [...dbPosts, ...filePosts].sort(
    (a, b) => new Date(b.rawDate) - new Date(a.rawDate)
  );
}

export async function getPost(slug) {
  const post = (await getAllPosts()).find((p) => p.slug === slug);
  if (!post) return null;
  // render [form xyz] shortcodes into working forms
  return { ...post, bodyHtml: renderFaqAccordions(await replaceFormShortcodes(post.bodyHtml)) };
}
