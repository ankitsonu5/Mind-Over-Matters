"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import s from "@/app/episodes/episodes.module.css";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "episodes", label: "Episodes" },
  { id: "trailers", label: "Trailers" },
];

export default function EpisodesList({ episodes = [], trailers = [] }) {
  const root = useRef(null);
  const [filter, setFilter] = useState("all");

  // Featured = the live episode, otherwise the latest one.
  const featured = useMemo(() => {
    if (!episodes.length) return null;
    return episodes.find((e) => e.live) || episodes[0];
  }, [episodes]);

  // One unified list. Episodes link to their detail page; trailers open YouTube.
  const items = useMemo(() => {
    const eps = episodes
      .filter((e) => !featured || e.slug !== featured.slug) // don't repeat the featured one in the grid
      .map((e) => ({
        kind: "episode",
        key: `ep-${e.slug}`,
        href: `/episodes/${e.slug}`,
        external: false,
        badge: e.live ? "Now Streaming" : null,
        corner: String(e.number).padStart(2, "0"),
        cat: `Episode ${String(e.number).padStart(2, "0")}`,
        title: e.title,
        guest: e.guest,
        role: e.role,
        tagline: e.tagline,
        image: e.image,
        left: e.date,
        right: e.duration,
        cta: "Watch Episode →",
      }));

    const trs = trailers.map((t, i) => ({
      kind: "trailer",
      key: `tr-${i}`,
      href: t.youtube,
      external: true,
      badge: t.label || "Trailer",
      corner: "▶",
      cat: t.label || "Trailer",
      title: t.title,
      guest: t.guest,
      role: "",
      tagline: "",
      image: t.image,
      left: "Trailer",
      right: t.duration || "",
      cta: "Watch Trailer →",
    }));

    return [...eps, ...trs];
  }, [episodes, trailers, featured]);

  const filtered = useMemo(() => {
    if (filter === "episodes") return items.filter((i) => i.kind === "episode");
    if (filter === "trailers") return items.filter((i) => i.kind === "trailer");
    return items;
  }, [items, filter]);

  const counts = useMemo(
    () => ({
      all: items.length,
      episodes: items.filter((i) => i.kind === "episode").length,
      trailers: items.filter((i) => i.kind === "trailer").length,
    }),
    [items]
  );

  // Re-run the flip-in animation whenever the visible set changes.
  useEffect(() => {
    if (!root.current) return;
    const els = root.current.querySelectorAll("[data-flip]");
    const io = new IntersectionObserver(
      (ents) =>
        ents.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(s.in);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filtered]);

  return (
    <div className={s.wrap} ref={root}>
      <Link href="/" className={s.back}>← Home</Link>
      <span className={s.eyebrow}>Ashwin Gane Presents</span>
      <h1 className={s.h1}>All <span>Episodes</span></h1>
      <p className={s.sub}>Every conversation from the season — raw and unfiltered. Pick one and press play.</p>

      {/* ---------- Featured episode ---------- */}
      {featured && (
        <Link href={`/episodes/${featured.slug}`} className={s.featured}>
          <img className={s.featBg} src={featured.image} alt={featured.title} />
          <span className={s.featVeil} />
          <div className={s.featInner}>
            <span className={s.featTag}>
              Featured · Episode {String(featured.number).padStart(2, "0")}
              {featured.live ? " · Now Streaming" : ""}
            </span>
            <h2 className={s.featTitle}>{featured.title}</h2>
            <div className={s.featGuest}>{featured.guest} · {featured.role}</div>
            <p className={s.featTagline}>{featured.tagline}</p>
            <div className={s.featMeta}><span>{featured.date}</span><span>{featured.duration}</span></div>
            <span className={s.featBtn}>▶ Watch Now</span>
          </div>
        </Link>
      )}

      {/* ---------- Filter bar ---------- */}
      <div className={s.filters} role="tablist" aria-label="Filter episodes">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={`${s.fbtn} ${filter === f.id ? s.fbtnOn : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label} <span className={s.fcount}>{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {/* ---------- Grid ---------- */}
      <div className={s.grid}>
        {filtered.map((it, i) => {
          const flip = i % 3 === 0 ? s.left : i % 3 === 1 ? s.center : s.right;
          return it.external ? (
            <a
              key={it.key}
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              data-flip
              className={`${s.card} ${flip}`}
            >
              <Inner it={it} />
            </a>
          ) : (
            <Link
              key={it.key}
              href={it.href}
              data-flip
              className={`${s.card} ${flip}`}
            >
              <Inner it={it} />
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && <p className={s.empty}>Nothing here yet.</p>}
    </div>
  );
}

function Inner({ it }) {
  return (
    <>
      <div className={s.media}>
        <img src={it.image} alt={it.title} />
        <div className={`${s.num} ${it.kind === "trailer" ? s.numPlay : ""}`}>{it.corner}</div>
        {it.badge && (
          <div className={`${s.badge} ${it.kind === "trailer" ? s.badgeTrailer : s.badgeLive}`}>
            {it.badge}
          </div>
        )}
      </div>
      <div className={s.body}>
        <div className={s.cat}>{it.cat}</div>
        <h2 className={s.title}>{it.title}</h2>
        <div className={s.guest}>{it.guest}{it.role ? ` · ${it.role}` : ""}</div>
        {it.tagline && <p className={s.tag}>{it.tagline}</p>}
        <div className={s.meta}><span>{it.left}</span><span>{it.right}</span></div>
        <span className={s.watch}>{it.cta}</span>
      </div>
    </>
  );
}
