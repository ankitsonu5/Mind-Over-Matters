import { getAllPosts } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/episodes";
import { getPublished, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const settings = await getSettings();
  const base = (settings.siteUrl || "https://mindovermatterpodcast.com").replace(/\/+$/, "");
  const posts = await getAllPosts();
  const episodes = await getAllEpisodes();
  let pages = [];
  try { pages = await getPublished("pages"); } catch {}

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/episodes`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/guest`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/listen`, changeFrequency: "monthly", priority: 0.5 },
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.rawDate ? new Date(p.rawDate) : undefined, changeFrequency: "weekly", priority: 0.8 })),
    ...episodes.map((e) => ({ url: `${base}/episodes/${e.slug}`, lastModified: e.rawDate ? new Date(e.rawDate) : undefined, changeFrequency: "weekly", priority: 0.8 })),
    ...pages.map((p) => ({ url: `${base}/p/${p.slug}`, changeFrequency: "monthly", priority: 0.6 })),
  ];
}
