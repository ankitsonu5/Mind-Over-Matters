import { NextResponse } from "next/server";
import { fail, getById, remove, requireUser, uniqueSlug, update } from "@/lib/admin-api";
import { analyzeSeo } from "@/lib/seo-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function guard(req, id) {
  const { session, error } = await requireUser(req, "posts");
  if (error) return { error };
  const post = await getById("posts", id);
  if (!post) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  if (session.role === "author" && post.authorId !== session.id) {
    return { error: NextResponse.json({ error: "You can only edit your own posts." }, { status: 403 }) };
  }
  return { session, post };
}

export async function GET(req, { params }) {
  const { post, error } = await guard(req, params.id);
  if (error) return error;
  return NextResponse.json(post);
}

export async function PUT(req, { params }) {
  const { session, post, error } = await guard(req, params.id);
  if (error) return error;
  try {
    const body = await req.json();
    const slug = await uniqueSlug("posts", body.slug || body.title || post.title, params.id);

    let authorId = body.authorId ?? post.authorId;
    if (session.role === "author") authorId = post.authorId; // can't reassign
    let authorName = post.authorName;
    if (authorId !== post.authorId) {
      const u = await getById("users", authorId);
      authorName = u?.name || u?.username || authorName;
    }

    const patch = {
      title: body.title ?? post.title,
      slug,
      highlight: body.highlight ?? post.highlight,
      category: body.category ?? post.category,
      tags: Array.isArray(body.tags) ? body.tags : post.tags,
      excerpt: body.excerpt ?? post.excerpt,
      coverImage: body.coverImage ?? post.coverImage,
      coverImageAlt: body.coverImageAlt ?? post.coverImageAlt,
      readTime: body.readTime ?? post.readTime,
      relatedEpisode: body.relatedEpisode ?? post.relatedEpisode,
      bg: body.bg ?? post.bg,
      contentHtml: body.contentHtml ?? post.contentHtml,
      authorId,
      authorName,
      status: body.status === "published" ? "published" : "draft",
    };
    if (patch.status === "published" && !post.publishedAt) {
      patch.publishedAt = new Date().toISOString();
    }
    const seoInput = { ...(post.seo || {}), ...(body.seo || {}) };
    const analysis = analyzeSeo({
      title: patch.title, slug, content: patch.contentHtml,
      excerpt: patch.excerpt, seo: seoInput,
    });
    patch.seo = {
      focusKeyword: seoInput.focusKeyword || "",
      title: seoInput.title || "",
      description: seoInput.description || "",
      schemaType: seoInput.schemaType || "BlogPosting",
      faqSchema: !!seoInput.faqSchema,
      score: analysis.score,
      links: analysis.meta.links,
      wordCount: analysis.meta.wordCount,
    };
    return NextResponse.json(await update("posts", params.id, patch));
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req, { params }) {
  const { error } = await guard(req, params.id);
  if (error) return error;
  try {
    await remove("posts", params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
