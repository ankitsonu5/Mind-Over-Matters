import Link from "next/link";
import { notFound } from "next/navigation";
import s from "./ep-detail.module.css";
import { getAllEpisodes, getEpisode, ytId } from "@/lib/episodes";
import { getAllPosts } from "@/lib/blog";
import { platforms } from "@/data/platforms";
import { SITE_URL, SITE_NAME, PODCAST_NAME } from "@/lib/seo";


export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const ep = await getEpisode(params.slug);
  if (!ep) return { title: "Episode" };
  const url = `${SITE_URL}/episodes/${ep.slug}`;
  const id = ytId(ep.youtube);
  const ogImg = id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : ep.image;
  const title = `EP ${String(ep.number).padStart(2, "0")} — ${ep.title}`;
  return {
    title,
    description: ep.tagline,
    alternates: { canonical: url },
    openGraph: {
      type: "video.episode",
      url,
      title: `${title} — ${SITE_NAME}`,
      description: ep.tagline,
      images: ogImg ? [{ url: ogImg, alt: ep.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${SITE_NAME}`,
      description: ep.tagline,
      images: ogImg ? [ogImg] : [],
    },
  };
}

export default async function EpisodeDetail({ params }) {
  const all = (await getAllEpisodes());
  const ep = await getEpisode(params.slug);
  if (!ep) return notFound();

  const id = ytId(ep.youtube);
  const pad = (x) => String(x).padStart(2, "0");
  const relatedPost = (await getAllPosts()).find((p) => p.relatedEpisode === ep.slug);
  const idx = all.findIndex((x) => x.slug === ep.slug);
  const prev = all[idx + 1] || null; // earlier episode
  const next = all[idx - 1] || null; // later episode
  const more = all.filter((x) => x.slug !== ep.slug).slice(0, 3);

  const url = `${SITE_URL}/episodes/${ep.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "PodcastEpisode",
        url,
        name: ep.title,
        episodeNumber: ep.number,
        datePublished: ep.rawDate,
        description: ep.tagline,
        timeRequired: ep.duration,
        associatedMedia: id
          ? { "@type": "VideoObject", name: ep.title, description: ep.tagline,
              uploadDate: ep.rawDate, thumbnailUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
              embedUrl: `https://www.youtube-nocookie.com/embed/${id}` }
          : undefined,
        partOfSeries: { "@type": "PodcastSeries", name: PODCAST_NAME, url: SITE_URL },
        actor: ep.guest ? { "@type": "Person", name: ep.guest } : undefined,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Episodes", item: `${SITE_URL}/episodes` },
          { "@type": "ListItem", position: 3, name: ep.title, item: url },
        ],
      },
    ],
  };

  return (
    <div className={s.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* breadcrumb */}
      <div role="navigation" className={s.crumbs} aria-label="Breadcrumb" data-aos="fade-down-right">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/episodes">Episodes</Link>
        <span>/</span>
        <em>{ep.title}</em>
      </div>

      {/* header */}
      <header className={s.head}>
        <span className={s.ghost} aria-hidden="true">{pad(ep.number)}</span>
        <span className={s.eyebrow} data-aos="fade-up-right">
          Episode {pad(ep.number)}
          {ep.live && <i className={s.liveDot} aria-hidden="true" />}
          {ep.live ? " Now Live" : ""}
        </span>
        <h1 className={s.title} data-aos="fade-up">{ep.title}</h1>
        <div className={s.metaRow} data-aos="fade-up" data-aos-delay="120">
          {ep.guest && <span className={s.chip}>{ep.guest}</span>}
          {ep.role && <span className={s.chipGhost}>{ep.role}</span>}
          <span className={s.metaDot} />
          <time dateTime={ep.rawDate}>{ep.date}</time>
          {ep.duration && (<><span className={s.metaDot} /><span>{ep.duration}</span></>)}
        </div>
      </header>

      {/* player */}
      <div className={s.player}>
        {id ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`}
            title={ep.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <img src={ep.image} alt={ep.title} className={s.playerImg} />
        )}
      </div>

      {/* body + rail */}
      <div className={s.grid}>
        <div className={s.main}>
          {ep.tagline && (
            <blockquote className={s.pullQuote}>
              {ep.tagline}
              <cite>— Episode {pad(ep.number)}</cite>
            </blockquote>
          )}
          <h2 className={s.h2}>In This Episode</h2>
          <div className="prose" dangerouslySetInnerHTML={{ __html: ep.bodyHtml }} />
          <div className={s.cta}>
            <a href={ep.youtube} target="_blank" rel="noopener noreferrer" className="pill">
              Watch on YouTube ↗
            </a>
            {relatedPost && (
              <Link href={`/blog/${relatedPost.slug}`} className="pill ghost">
                Read the Journal Entry
              </Link>
            )}
          </div>
        </div>

        <aside className={s.rail} data-aos="fade-up-left" data-aos-delay="150">
          {ep.guest && (
            <div className={s.guestCard}>
              <span className={s.railLabel}>The Guest</span>
              <strong>{ep.guest}</strong>
              {ep.role && <span className={s.guestRole}>{ep.role}</span>}
            </div>
          )}
          <div className={s.platBox}>
            <span className={s.railLabel}>Listen On</span>
            <div className={s.platList}>
              {platforms.slice(0, 6).map((pl) => (
                <a key={pl.slug} href={pl.href} target="_blank" rel="noopener noreferrer" className={s.plat} title={pl.name}>
                  <img src={pl.logo} alt={pl.name} loading="lazy" />
                  <span>{pl.name}</span>
                </a>
              ))}
            </div>
            <Link href="/listen" className={s.allPlat}>All platforms →</Link>
          </div>
          <div className={s.guestCta}>
            <span className={s.railLabel}>Your Turn</span>
          </div>
        </aside>
      </div>

      {/* prev / next */}
      <div role="navigation" className={s.pn} aria-label="More episodes">
        {prev ? (
          <Link href={`/episodes/${prev.slug}`} className={s.pnItem} data-aos="fade-up-right">
            <span>← EP {pad(prev.number)}</span>
            <strong>{prev.title}</strong>
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/episodes/${next.slug}`} className={`${s.pnItem} ${s.pnNext}`} data-aos="fade-up-left">
            <span>EP {pad(next.number)} →</span>
            <strong>{next.title}</strong>
          </Link>
        ) : <span />}
      </div>

      {/* more episodes */}
      {more.length > 0 && (
        <section className={s.more} aria-label="More episodes">
          <div className={s.moreHead} data-aos="fade-up">
            <span className={s.moreEyebrow}>Keep Watching</span>
            <h2>More Episodes</h2>
          </div>
          <div className={s.moreGrid}>
            {more.map((m, i) => {
              const mid = ytId(m.youtube);
              return (
                <Link
                  key={m.slug}
                  href={`/episodes/${m.slug}`}
                  className={s.moreCard}
                  data-aos={i % 2 === 0 ? "fade-up-right" : "fade-up-left"}
                  data-aos-delay={String(i * 100)}
                >
                  <span className={s.moreThumb}>
                    <img
                      src={mid ? `https://img.youtube.com/vi/${mid}/hqdefault.jpg` : m.image}
                      alt={m.title}
                      loading="lazy"
                    />
                    <em>EP {pad(m.number)}</em>
                  </span>
                  <strong>{m.title}</strong>
                  <span className={s.moreGuest}>{m.guest}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
