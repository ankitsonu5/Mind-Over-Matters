"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import s from "@/app/episodes/episodes.module.css";

export default function EpisodesList({ episodes = [] }) {
  const root = useRef(null);

  // Featured = the live episode, otherwise the latest one.
  const featured = useMemo(() => {
    if (!episodes.length) return null;
    return episodes.find((e) => e.live) || episodes[0];
  }, [episodes]);

  const items = useMemo(() => {
    return episodes
      .filter((e) => !featured || e.slug !== featured.slug)
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
        image: e.image,
        left: e.date,
        right: e.duration,
        cta: "Watch Episode →",
      }));
  }, [episodes, featured]);

  const filtered = items;

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

      {/* ---------- Grid ---------- */}
      <div className={s.grid}>
        {filtered.map((it, i) => {
          const flip = i % 3 === 0 ? s.left : i % 3 === 1 ? s.center : s.right;
          return (
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
        <div className={s.num}>{it.corner}</div>
        {it.badge && (
          <div className={`${s.badge} ${s.badgeLive}`}>
            {it.badge}
          </div>
        )}
      </div>
      <div className={s.body}>
        <div className={s.cat}>{it.cat}</div>
        <h2 className={s.title}>{it.title}</h2>
        <div className={s.guest}>{it.guest}{it.role ? ` · ${it.role}` : ""}</div>
        <div className={s.meta}><span>{it.left}</span><span>{it.right}</span></div>
        <span className={s.watch}>{it.cta}</span>
      </div>
    </>
  );
}
