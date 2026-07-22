// Imports the original markdown blog posts into the admin so every existing
// blog can be edited and SEO-optimized. Same-slug admin posts override the
// markdown versions on the site, so nothing is lost or duplicated.
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { NextResponse } from "next/server";
import { fail, getAll, insert, requireUser } from "@/lib/admin-api";
import { analyzeSeo } from "@/lib/seo-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const { session, error } = await requireUser(req, "posts");
  if (error) return error;
  try {
    const dir = path.join(process.cwd(), "content/blog");
    if (!fs.existsSync(dir)) return NextResponse.json({ imported: 0 });
    const existing = new Set((await getAll("posts")).map((p) => p.slug));
    let imported = 0;

    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const slug = file.replace(/\.md$/, "");
      if (existing.has(slug)) continue;
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      const contentHtml = marked.parse(content || "");
      const seo = { focusKeyword: "", title: "", description: "", schemaType: "BlogPosting", faqSchema: false };
      const analysis = analyzeSeo({ title: data.title || slug, slug, content: contentHtml, excerpt: data.excerpt || "", seo });
      await insert("posts", {
        title: data.title || slug,
        slug,
        highlight: data.highlight || "",
        category: data.category || "",
        tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
        excerpt: data.excerpt || "",
        coverImage: data.image || "",
        readTime: data.readTime || "5 min",
        relatedEpisode: data.relatedEpisode || "",
        bg: data.bg || "#06080f",
        contentHtml,
        authorId: session.id,
        authorName: "Ashwin Gane",
        status: "published",
        publishedAt: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        seo: { ...seo, score: analysis.score, links: analysis.meta.links, wordCount: analysis.meta.wordCount },
      });
      imported++;
    }
    return NextResponse.json({ imported });
  } catch (e) { return fail(e); }
}
