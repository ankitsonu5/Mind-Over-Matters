// =====================================================================
//  EPISODES — merges admin-panel episodes (published) with the seed
//  markdown files in content/episodes/*.md. Async now.
// =====================================================================
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { linkifyExternal } from "@/lib/seo";
import { ytId } from "@/data/episodes";
import { getPublished } from "@/lib/store";

const DIR = path.join(process.cwd(), "content/episodes");

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

function buildMd(file) {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(fs.readFileSync(path.join(DIR, file), "utf8"));
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

function buildDb(e) {
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
    dbEps = (await getPublished("episodes")).map(buildDb);
  } catch { dbEps = []; }
  const dbSlugs = new Set(dbEps.map((e) => e.slug));

  let fileEps = [];
  if (fs.existsSync(DIR)) {
    fileEps = fs.readdirSync(DIR)
      .filter((f) => f.endsWith(".md"))
      .map(buildMd)
      .filter((e) => !dbSlugs.has(e.slug));
  }
  return [...dbEps, ...fileEps].sort((a, b) => b.number - a.number);
}

export async function getEpisode(slug) {
  return (await getAllEpisodes()).find((e) => e.slug === slug);
}

export { ytId };
