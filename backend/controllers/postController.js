import { getAll, getById, insert, remove, update, uniqueSlug } from "../lib/store.js";
import { analyzeSeo } from "../lib/seo-tools.js";
import { readBlogMarkdownFiles } from "../lib/content.js";

/* Authors may only see and edit their own posts. */
async function loadOwned(req, res) {
  const post = await getById("posts", req.params.id);
  if (!post) {
    res.status(404).json({ error: "Not found" });
    return null;
  }
  if (req.user.role === "author" && post.authorId !== req.user.id) {
    res.status(403).json({ error: "You can only edit your own posts." });
    return null;
  }
  return post;
}

function buildSeo(seoInput, analysis) {
  return {
    focusKeyword: seoInput.focusKeyword || "",
    title: seoInput.title || "",
    description: seoInput.description || "",
    schemaType: seoInput.schemaType || "BlogPosting",
    faqSchema: !!seoInput.faqSchema,
    score: analysis.score,
    links: analysis.meta.links,
    wordCount: analysis.meta.wordCount,
  };
}

/* GET /api/admin/posts */
export async function list(req, res) {
  let posts = await getAll("posts");
  if (req.user.role === "author") posts = posts.filter((p) => p.authorId === req.user.id);
  posts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(posts);
}

/* GET /api/admin/posts/:id */
export async function getOne(req, res) {
  const post = await loadOwned(req, res);
  if (post) res.json(post);
}

/* POST /api/admin/posts */
export async function create(req, res) {
  const body = req.body || {};
  if (!body.title?.trim()) return res.status(400).json({ error: "Title required" });

  let authorId = body.authorId || req.user.id;
  if (req.user.role === "author") authorId = req.user.id;
  const author = (await getById("users", authorId)) || (await getById("users", req.user.id));

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
    authorId: author?.id || req.user.id,
    authorName: author?.name || author?.username || "Ashwin Gane",
    status: body.status === "published" ? "published" : "draft",
    publishedAt: body.status === "published" ? new Date().toISOString() : null,
    seo: buildSeo(seoInput, analysis),
  });
  res.status(201).json(post);
}

/* PUT /api/admin/posts/:id */
export async function updateOne(req, res) {
  const post = await loadOwned(req, res);
  if (!post) return;

  const body = req.body || {};
  const slug = await uniqueSlug("posts", body.slug || body.title || post.title, req.params.id);

  let authorId = body.authorId ?? post.authorId;
  if (req.user.role === "author") authorId = post.authorId; // cannot reassign
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
  patch.seo = buildSeo(seoInput, analysis);

  res.json(await update("posts", req.params.id, patch));
}

/* DELETE /api/admin/posts/:id */
export async function removeOne(req, res) {
  const post = await loadOwned(req, res);
  if (!post) return;
  await remove("posts", req.params.id);
  res.json({ ok: true });
}

/* POST /api/admin/import-posts
   Pulls the seed markdown blogs into the admin so they become editable.
   Slugs that already exist are skipped, so it is safe to run twice.      */
export async function importMarkdownPosts(req, res) {
  const existing = new Set((await getAll("posts")).map((p) => p.slug));
  let imported = 0;

  for (const { slug, data, contentHtml } of readBlogMarkdownFiles()) {
    if (existing.has(slug)) continue;
    const seo = {
      focusKeyword: "", title: "", description: "",
      schemaType: "BlogPosting", faqSchema: false,
    };
    const analysis = analyzeSeo({
      title: data.title || slug, slug, content: contentHtml,
      excerpt: data.excerpt || "", seo,
    });
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
      authorId: req.user.id,
      authorName: "Ashwin Gane",
      status: "published",
      publishedAt: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      seo: { ...seo, score: analysis.score, links: analysis.meta.links, wordCount: analysis.meta.wordCount },
    });
    imported++;
  }
  res.json({ imported });
}
