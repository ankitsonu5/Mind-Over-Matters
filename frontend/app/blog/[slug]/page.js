import Link from "next/link";
import { notFound } from "next/navigation";
import s from "./blog.module.css";
import { getAllPosts, getPost } from "@/lib/blog";
import { getEpisode, ytId } from "@/lib/episodes";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { extractFaqs } from "@/lib/seo-tools";


export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const p = await getPost(params.slug);
  if (!p) return { title: "Journal" };
  const url = `${SITE_URL}/blog/${p.slug}`;
  const seoTitle = p.seo?.title?.trim() || p.titlePlain;
  const seoDesc = p.seo?.description?.trim() || p.excerpt;
  return {
    title: seoTitle,
    description: seoDesc,
    keywords: p.tags,
    authors: [{ name: "Ashwin Gane", url: `${SITE_URL}/about` }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: seoTitle,
      description: seoDesc,
      publishedTime: p.rawDate,
      authors: ["Ashwin Gane"],
      tags: p.tags,
      images: p.image ? [{ url: p.image.startsWith("http") ? p.image : `${SITE_URL}${p.image}`, alt: p.titlePlain }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDesc,
      images: p.image ? [p.image.startsWith("http") ? p.image : `${SITE_URL}${p.image}`] : [],
    },
  };
}

export default async function BlogPost({ params }) {
  const all = (await getAllPosts());
  const p = await getPost(params.slug);
  if (!p) return notFound();

  const ep = p.relatedEpisode ? await getEpisode(p.relatedEpisode) : null;
  const idx = all.findIndex((x) => x.slug === p.slug);
  const prev = all[idx + 1] || null; // older
  const next = all[idx - 1] || null; // newer
  // related: shared tag first, then recent others
  const related = [
    ...all.filter((x) => x.slug !== p.slug && x.tags.some((t) => p.tags.includes(t))),
    ...all.filter((x) => x.slug !== p.slug && !x.tags.some((t) => p.tags.includes(t))),
  ].slice(0, 3);

  const url = `${SITE_URL}/blog/${p.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": p.seo?.schemaType || "BlogPosting",
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        headline: p.seo?.title?.trim() || p.titlePlain,
        description: p.seo?.description?.trim() || p.excerpt,
        image: p.image ? [p.image.startsWith("http") ? p.image : `${SITE_URL}${p.image}`] : undefined,
        datePublished: p.rawDate,
        dateModified: p.rawDate,
        author: { "@type": "Person", name: "Ashwin Gane", url: `${SITE_URL}/about` },
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        keywords: [p.seo?.focusKeyword, ...p.tags].filter(Boolean).join(", "),
        articleSection: p.category,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Journal", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: p.titlePlain, item: url },
        ],
      },
    ],
  };
  if (p.seo?.faqSchema) {
    const faqs = extractFaqs(p.bodyHtml || "");
    if (faqs.length > 0) {
      jsonLd["@graph"].push({
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      });
    }
  }

  return (
    <article className={s.post}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={s.inner}>
        {/* breadcrumb (internal links) */}
        <div role="navigation" className={s.crumbs} aria-label="Breadcrumb" data-aos="fade-down-right">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/blog">Journal</Link>
          <span>/</span>
          <em>{p.titlePlain}</em>
        </div>

        {/* header */}
        <header className={s.head}>
          <div className={s.cat} data-aos="fade-up-right">{p.category}</div>
          <h1 className={s.title} data-aos="fade-up">{p.titlePlain}</h1>
          {p.excerpt && (
            <p className={s.standfirst} data-aos="fade-up" data-aos-delay="120">
              {p.excerpt}
            </p>
          )}
          <div className={s.metaRow} data-aos="fade-up" data-aos-delay="200">
            <span className={s.byline}>
              By <Link href="/about">Ashwin Gane</Link>
            </span>
            <span className={s.dot} />
            <time dateTime={p.rawDate}>{p.date}</time>
          </div>
        </header>

        {/* hero image */}
        {p.image && (
          <figure className={s.heroImg}>
            <img src={p.image} alt={p.imageAlt || p.titlePlain} />
            <figcaption>{p.category} · {SITE_NAME}</figcaption>
          </figure>
        )}

        {/* body + side rail */}
        <div className={s.grid}>
        <div className={s.main}>
          <div
            className={`prose proseDrop ${s.body}`}
            dangerouslySetInnerHTML={{ __html: p.bodyHtml }}
          />

          {p.tags.length > 0 && (
            <div className={s.tags} style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 34, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,.12)" }}>
              {p.tags.map((t) => (
                <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className={s.tag}>
                  #{t}
                </Link>
              ))}
            </div>
          )}

          {p.gallery.length > 0 && (
            <div className={s.gallery}>
              {p.gallery.map((g, i) => (
                <figure
                  key={i}
                  className={s.galItem}
                  data-aos={i % 2 === 0 ? "fade-up-right" : "fade-up-left"}
                  data-aos-delay={String((i % 3) * 100)}
                >
                  <img src={g.image} alt={g.caption || p.titlePlain} loading="lazy" />
                  {g.caption && <figcaption>{g.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
        </div>

          <aside className={s.rail} data-aos="fade-up-left" data-aos-delay="150">
            {ep && (
              <Link href={`/episodes/${ep.slug}`} className={s.epCard}>
                <span className={s.epEyebrow}>From this piece</span>
                <span className={s.epThumb}>
                  {ytId(ep.youtube) ? (
                    <img
                      src={`https://img.youtube.com/vi/${ytId(ep.youtube)}/hqdefault.jpg`}
                      alt={ep.title}
                      loading="lazy"
                    />
                  ) : (
                    ep.image && <img src={ep.image} alt={ep.title} loading="lazy" />
                  )}
                  <i className={s.epPlay} aria-hidden="true" />
                </span>
                <strong>EP {String(ep.number).padStart(2, "0")} — {ep.title}</strong>
                <span className={s.epGuest}>{ep.guest}{ep.role ? ` · ${ep.role}` : ""}</span>
                <span className={s.epCta}>Watch the Episode →</span>
              </Link>
            )}
            <div className={s.railBox}>
              <span className={s.railLabel}>Listen Anywhere</span>
              <p>
                Mind Over Matter streams on{" "}
                <a href="https://open.spotify.com/show/1gjHxeDVFhwJLNc4j3TRIX" target="_blank" rel="noopener noreferrer">Spotify</a>,{" "}
                <a href="https://podcasts.apple.com/us/podcast/mind-over-matter/id1891023935" target="_blank" rel="noopener noreferrer">Apple Podcasts</a>{" "}
                and more — <Link href="/listen">all platforms</Link>.
              </p>
            </div>
            <div className={s.railBox}>
              <span className={s.railLabel}>Be a Guest</span>
              <p>
                Have a story worth telling? <Link href="/guest">Apply to join Ashwin on the show</Link>.
              </p>
            </div>
          </aside>
        </div>

        {/* prev / next */}
        <div role="navigation" className={s.pn} aria-label="More journal entries">
          {prev ? (
            <Link href={`/blog/${prev.slug}`} className={s.pnItem} data-aos="fade-up-right">
              <span>← Older</span>
              <strong>{prev.titlePlain}</strong>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/blog/${next.slug}`} className={`${s.pnItem} ${s.pnNext}`} data-aos="fade-up-left">
              <span>Newer →</span>
              <strong>{next.titlePlain}</strong>
            </Link>
          ) : <span />}
        </div>

        {/* related posts */}
        {related.length > 0 && (
          <section className={s.related} aria-label="Continue reading">
            <div className={s.relHead} data-aos="fade-up">
              <span className={s.relEyebrow}>Continue Reading</span>
              <h2>More from the Journal</h2>
            </div>
            <div className={s.relGrid}>
              {related.map((r, i) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className={s.relCard}
                  data-aos={i % 2 === 0 ? "fade-up-right" : "fade-up-left"}
                  data-aos-delay={String(i * 100)}
                >
                  <span className={s.relThumb}>
                    {r.image && <img src={r.image} alt={r.titlePlain} loading="lazy" />}
                  </span>
                  <span className={s.relCat}>{r.category}</span>
                  <strong>{r.titlePlain}</strong>
                  <span className={s.relDate}>{r.date}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
