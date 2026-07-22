import { NextResponse } from "next/server";
import { fail, getAll, getById, insert, requireUser, uniqueSlug } from "@/lib/admin-api";
import { analyzeSeo } from "@/lib/seo-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const { session, error } = await requireUser(req, "posts");
  if (error) return error;
  let posts = await getAll("posts");
  // authors only see their own posts
  if (session.role === "author") posts = posts.filter((p) => p.authorId === session.id);
  posts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return NextResponse.json(posts);
}

export async function POST(req) {
  const { session, error } = await requireUser(req, "posts");
  if (error) return error;
  try {
    const body = await req.json();
    if (!body.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

    // resolve author: admins/editors can assign, authors are always themselves
    let authorId = body.authorId || session.id;
    if (session.role === "author") authorId = session.id;
    const author = (await getById("users", authorId)) || (await getById("users", session.id));

    const slug = await uniqueSlug("posts", body.slug || body.title);
    const seoInput = body.seo || {};
    const analysis = analyzeSeo({
      title: body.title, slug, content: body.contentHtml || "",
      excerpt: body.excerpt || "", seo: seoInput,
    });

    const post = await insert("posts", {
      title: body.title.trim(),
      slug,
      highlight: body.highlight || "",
      category: body.category || "",
      tags: Array.isArray(body.tags) ? body.tags : [],
      excerpt: body.excerpt || "",
      coverImage: body.coverImage || "",
      coverImageAlt: body.coverImageAlt || "",
      readTime: body.readTime || "5 min",
      relatedEpisode: body.relatedEpisode || "",
      bg: body.bg || "#06080f",
      contentHtml: body.contentHtml || "",
      authorId: author?.id || session.id,
      authorName: author?.name || author?.username || "Ashwin Gane",
      status: body.status === "published" ? "published" : "draft",
      publishedAt: body.status === "published" ? new Date().toISOString() : null,
      seo: {
        focusKeyword: seoInput.focusKeyword || "",
        title: seoInput.title || "",
        description: seoInput.description || "",
        schemaType: seoInput.schemaType || "BlogPosting",
        faqSchema: !!seoInput.faqSchema,
        score: analysis.score,
        links: analysis.meta.links,
        wordCount: analysis.meta.wordCount,
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
