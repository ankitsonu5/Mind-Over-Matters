// Rank Math-style SEO analyzer — pure functions, same code runs live in the
// editor (browser) and on the server when a post is saved.

export function stripHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(html = "") {
  const text = stripHtml(html);
  return text ? text.split(/\s+/).length : 0;
}

export function countLinks(html = "") {
  const hrefs = [...(html || "").matchAll(/<a\s[^>]*href=["']([^"']+)["']/gi)].map(
    (m) => m[1]
  );
  let internal = 0;
  let external = 0;
  for (const h of hrefs) {
    if (/^https?:\/\//i.test(h)) external++;
    else if (!h.startsWith("#") && !h.startsWith("mailto:")) internal++;
  }
  return { internal, external, total: hrefs.length };
}

function norm(s = "") {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function includesKw(haystack, kw) {
  return !!kw && norm(haystack).includes(norm(kw));
}

export function getEffectiveSeoTitle(post) {
  return post.seo?.title?.trim() || `${post.title || ""} — Mind Over Matter`;
}
export function getEffectiveMetaDesc(post) {
  return post.seo?.description?.trim() || post.excerpt?.trim() || "";
}

// Extract <h3>Question</h3><p>Answer</p> pairs for FAQ schema
export function extractFaqs(html = "") {
  const faqs = [];
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(html))) {
    const q = stripHtml(m[1]);
    const a = stripHtml(m[2]);
    if (q && a) faqs.push({ q, a });
  }
  // also match already-rendered accordion items
  const re2 = /<summary[^>]*>([\s\S]*?)<\/summary>\s*<div[^>]*>([\s\S]*?)<\/div>/gi;
  while ((m = re2.exec(html))) {
    const q = stripHtml(m[1]);
    const a = stripHtml(m[2]);
    if (q && a && !faqs.some((f) => f.q === q)) faqs.push({ q, a });
  }
  return faqs;
}

/**
 * Main analyzer. Returns { score, tests: { basic:[], additional:[], titleReadability:[] }, meta }
 * Each test: { id, label, pass, weight, hint }
 */
export function analyzeSeo({ title = "", slug = "", content = "", excerpt = "", seo = {} }) {
  const kw = (seo.focusKeyword || "").trim();
  const seoTitle = seo.title?.trim() || `${title} — Mind Over Matter`;
  const metaDesc = seo.description?.trim() || excerpt?.trim() || "";
  const text = stripHtml(content);
  const words = text ? text.split(/\s+/) : [];
  const wc = words.length;
  const links = countLinks(content);

  // keyword occurrences in content
  let kwCount = 0;
  if (kw) {
    const re = new RegExp(norm(kw).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    kwCount = (norm(text).match(re) || []).length;
  }
  const density = wc > 0 && kw ? (kwCount * kw.split(/\s+/).length * 100) / wc : 0;

  const first10 = words.slice(0, Math.max(50, Math.ceil(wc * 0.1))).join(" ");
  const subheadings = [...content.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)]
    .map((m) => stripHtml(m[1]))
    .join(" | ");
  const imgs = [...content.matchAll(/<img\s[^>]*>/gi)].map((m) => m[0]);
  const imgAltHasKw = imgs.some((tag) => {
    const alt = (tag.match(/alt=["']([^"']*)["']/i) || [])[1] || "";
    return includesKw(alt, kw);
  });

  // Content length tier (Rank Math style)
  let lenScore = 0;
  if (wc >= 2000) lenScore = 22;
  else if (wc >= 1500) lenScore = 18;
  else if (wc >= 1000) lenScore = 14;
  else if (wc >= 600) lenScore = 8;

  const basic = [
    t("kw-title", "Focus Keyword used in the SEO title", includesKw(seoTitle, kw), 10,
      "Add the focus keyword to your SEO title."),
    t("kw-desc", "Focus Keyword used in the meta description", includesKw(metaDesc, kw), 8,
      "Add the focus keyword to the meta description."),
    t("kw-url", "Focus Keyword used in the URL", includesKw(slug.replace(/-/g, " "), kw), 6,
      "Use the focus keyword in the post slug."),
    t("kw-first10", "Focus Keyword appears in the first 10% of content", includesKw(first10, kw), 8,
      "Use the keyword within the opening paragraph."),
    t("kw-content", "Focus Keyword found in the content", kwCount > 0, 6,
      "Use the keyword at least once in the content."),
    {
      id: "content-length",
      label: `Content length: ${wc} words`,
      pass: wc >= 600,
      weight: 22,
      earned: lenScore,
      hint: wc >= 2000 ? "Excellent content length." : "Aim for 600+ words minimum; 2000+ words scores full points.",
    },
  ];

  const additional = [
    t("kw-subheading", "Focus Keyword used in an H2/H3 subheading", includesKw(subheadings, kw), 6,
      "Add the keyword to at least one H2/H3 subheading."),
    t("img-alt", "Image with Focus Keyword in alt text",
      imgs.length > 0 && imgAltHasKw, 4,
      imgs.length === 0 ? "Add an image with descriptive alt text." : "Add the focus keyword to an image alt text."),
    t("density", `Keyword density: ${density.toFixed(2)}%`,
      kw ? density >= 0.5 && density <= 2.5 : false, 6,
      "Keep keyword density between 0.5% and 2.5%."),
    t("url-length", `URL length: ${slug.length} characters`, slug.length > 0 && slug.length <= 75, 4,
      "Keep the slug under 75 characters."),
    t("ext-links", `External links: ${links.external}`, links.external > 0, 4,
      "Link out to at least one authoritative external source."),
    t("int-links", `Internal links: ${links.internal}`, links.internal > 0, 5,
      "Add internal links to your other posts or pages."),
    t("kw-start-title", "Focus Keyword at the beginning of the SEO title",
      !!kw && norm(seoTitle).startsWith(norm(kw)), 3,
      "Start the SEO title with the focus keyword for best results."),
  ];

  const titleReadability = [
    t("title-length", `SEO title length: ${seoTitle.length} characters`,
      seoTitle.length > 0 && seoTitle.length <= 60, 4,
      "Keep the SEO title within 60 characters so it displays fully on Google."),
    t("desc-length", `Meta description length: ${metaDesc.length} characters`,
      metaDesc.length >= 80 && metaDesc.length <= 160, 4,
      "Keep the meta description between 80 and 160 characters."),
  ];

  const all = [...basic, ...additional, ...titleReadability];
  const score = Math.round(
    all.reduce((sum, x) => sum + (x.earned ?? (x.pass ? x.weight : 0)), 0)
  );

  return {
    score: Math.min(100, score),
    tests: { basic, additional, titleReadability },
    meta: { wordCount: wc, density: +density.toFixed(2), links, kwCount, seoTitle, metaDesc },
  };
}

function t(id, label, pass, weight, hint) {
  return { id, label, pass: !!pass, weight, hint };
}

export function scoreColor(score) {
  if (score >= 80) return "green";
  if (score >= 51) return "yellow";
  return "red";
}
