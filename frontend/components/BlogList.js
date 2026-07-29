"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import s from "@/app/blog/blog-list.module.css";

export default function BlogList({ posts = [] }) {
  const root = useRef(null);
  const [filter, setFilter] = useState("all");

  // Featured = the most recent post (posts arrive sorted newest-first).
  const featured = posts[0] || null;
  const rest = useMemo(
    () => (featured ? posts.filter((p) => p.slug !== featured.slug) : posts),
    [posts, featured]
  );

  // Build the filter list: All + every distinct tag, with counts.
  const filters = useMemo(() => {
    const map = new Map();
    rest.forEach((p) => (p.tags || []).forEach((t) => map.set(t, (map.get(t) || 0) + 1)));
    return [
      { id: "all", label: "All", count: rest.length },
      ...[...map.entries()].map(([t, count]) => ({ id: t, label: t, count })),
    ];
  }, [rest]);

  const filtered = useMemo(() => {
    if (filter === "all") return rest;
    return rest.filter((p) => (p.tags || []).includes(filter));
  }, [rest, filter]);

  // Cards "unfold" one by one as they enter view; re-run when the set changes.
  useEffect(() => {
    if (!root.current) return;
    const els = [...root.current.querySelectorAll("[data-open]")];
    const io = new IntersectionObserver(
      (ents) =>
        ents.forEach((e) => {
          if (e.isIntersecting) {
            const idx = els.indexOf(e.target);
            setTimeout(() => e.target.classList.add(s.in), (idx % 3) * 110);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.18 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filtered]);

  return (
    <div className={s.wrap} ref={root}>
      <Link href="/" className={s.back}>← Home</Link>
      <span className={s.eyebrow}>The Journal</span>
      <h1 className={s.h1}>From The <span>Journal</span></h1>
      <p className={s.sub}>Raw thoughts, unfiltered takes, and deep dives from the studio.</p>

      {/* ---------- Featured post ---------- */}
      {featured && (
        <Link href={`/blog/${featured.slug}`} className={s.featured}>
          <div className={s.featMedia}>
            <img src={featured.img} alt={featured.titlePlain} />
            <span className={s.featVeil} />
          </div>
          <div className={s.featBody}>
            <span className={s.featKicker}>Latest · {featured.category}</span>
            <h2 className={s.featTitle}>{featured.titlePlain}</h2>
            <p className={s.featExcerpt}>{featured.excerpt}</p>
            {featured.tags?.length > 0 && (
              <div className={s.featTags}>
                {featured.tags.map((t) => (
                  <span key={t} className={s.chip}>{t}</span>
                ))}
              </div>
            )}
            <div className={s.featMeta}>
              <span>{featured.date}</span>
              <span className={s.read}>Read the entry →</span>
            </div>
          </div>
        </Link>
      )}

      {/* ---------- Filter bar ---------- */}
      <div className={s.filters} role="tablist" aria-label="Filter journal entries">
        {filters.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={`${s.fbtn} ${filter === f.id ? s.fbtnOn : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label} <span className={s.fcount}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* ---------- Grid ---------- */}
      <div className={s.grid}>
        {filtered.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} data-open className={s.card}>
            <div className={s.media}>
              <img src={p.img} alt={p.titlePlain} />
              <div className={s.ghost}>{String(p.num || 0).padStart(2, "0")}</div>
            </div>
            <div className={s.body}>
              <div className={s.cat}>{p.category}</div>
              <h3 className={s.title}>{p.titlePlain}</h3>
              <p className={s.excerpt}>{p.excerpt}</p>
              {p.tags?.length > 0 && (
                <div className={s.cardTags}>
                  {p.tags.map((t) => (
                    <span key={t} className={s.chipSm}>{t}</span>
                  ))}
                </div>
              )}
              <div className={s.meta}><span>{p.date}</span><span className={s.read}>Read →</span></div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && <p className={s.empty}>No entries under this topic yet.</p>}
    </div>
  );
}
