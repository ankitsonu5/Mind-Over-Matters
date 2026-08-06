"use client";

// Rank Math-style SEO metabox — live score, snippet preview, checklist.
import { useMemo, useState } from "react";
import { analyzeSeo, extractFaqs, scoreColor } from "@/lib/seo-tools";

const RING = { green: "#10b981", yellow: "#f5c842", red: "#ef4444" };

function Group({ title, tests, open, onToggle }) {
  const passed = tests.filter((t) => t.pass).length;
  return (
    <>
      <button type="button" className="seo-group-h" onClick={onToggle}>
        <span>{title}</span>
        <span>{passed}/{tests.length} passed {open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <ul className="seo-tests">
          {tests.map((t) => (
            <li key={t.id}>
              <span className={`tick ${t.pass ? "ok" : "no"}`}>{t.pass ? "✓" : "✗"}</span>
              <span className={t.pass ? "" : "fail-txt"}>
                {t.label}
                {!t.pass && t.hint && <span className="hint">→ {t.hint}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function SeoPanel({ doc, seo, onChange, siteUrl = "mindovermatterpodcasts.com" }) {
  const [open, setOpen] = useState("basic");
  const analysis = useMemo(
    () => analyzeSeo({ title: doc.title, slug: doc.slug, content: doc.contentHtml, excerpt: doc.excerpt, seo }),
    [doc.title, doc.slug, doc.contentHtml, doc.excerpt, seo]
  );
  const color = scoreColor(analysis.score);
  const faqs = useMemo(() => extractFaqs(doc.contentHtml || ""), [doc.contentHtml]);
  const set = (k, v) => onChange({ ...seo, [k]: v });

  return (
    <div className="box seo-panel">
      <div className="box-h">
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: ".05em", color: "#fff", textTransform: "none" }}>
          SEO <span style={{ color: "#61dafb" }}>/ Rank Math Style</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className={`seo-b seo-${color}`}>{analysis.score} / 100</span>
          <span className="seo-score-ring" style={{ borderColor: RING[color], color: RING[color] }}>
            {analysis.score}
          </span>
        </span>
      </div>

      <div className="box-b" style={{ display: "grid", gap: 15 }}>
        <div>
          <label className="f-label">Google Snippet Preview</label>
          <div className="snippet">
            <div className="sn-url">{siteUrl} › blog › {doc.slug || "post-slug"}</div>
            <div className="sn-title">{analysis.meta.seoTitle || "Your SEO title will appear here"}</div>
            <div className="sn-desc">{analysis.meta.metaDesc || "Your meta description will appear here — write it below."}</div>
          </div>
        </div>

        <div>
          <label className="f-label">Focus Keyword — the search term you want this post to rank for</label>
          <input className="f-in" value={seo.focusKeyword || ""} onChange={(e) => set("focusKeyword", e.target.value)} placeholder="e.g. detroit podcast mindset" />
        </div>

        <div>
          <label className="f-label">
            SEO Title ({(seo.title || analysis.meta.seoTitle).length}/60)
          </label>
          <input className="f-in" value={seo.title || ""} onChange={(e) => set("title", e.target.value)}
            placeholder={`Default: ${doc.title ? doc.title + " — Mind Over Matter" : "Post title — Mind Over Matter"}`} />
        </div>

        <div>
          <label className="f-label">Meta Description ({analysis.meta.metaDesc.length}/160)</label>
          <textarea className="f-in" rows={2} value={seo.description || ""} onChange={(e) => set("description", e.target.value)}
            placeholder="Leave empty to use the excerpt. 80–160 characters is ideal." />
        </div>

        <div className="f-grid2">
          <div>
            <label className="f-label">Schema Type</label>
            <select className="f-in" value={seo.schemaType || "BlogPosting"} onChange={(e) => set("schemaType", e.target.value)}>
              <option value="BlogPosting">Article (BlogPosting)</option>
              <option value="Article">Article</option>
              <option value="NewsArticle">NewsArticle</option>
            </select>
          </div>
          <div>
            <label className="f-label">FAQ Schema ({faqs.length} Q&A detected)</label>
            <label className="f-check" style={{ border: "1px solid #1a2942", borderRadius: 7, padding: "10px 13px" }}>
              <input type="checkbox" checked={!!seo.faqSchema} onChange={(e) => set("faqSchema", e.target.checked)} />
              FAQPage schema on
            </label>
          </div>
        </div>

        <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
          Target <b style={{ color: "#4ade80" }}>90+</b>: set a focus keyword, use it in the title/description/slug/first
          paragraph/an H2, write 1000+ words (2000+ for full marks), add 1 internal + 1 external link, and upload an
          image whose alt text contains the keyword. Every check below tells you exactly what is missing.
        </div>
        <div className="seo-stats">
          <span>Words: <b>{analysis.meta.wordCount}</b></span>
          <span>Keyword used: <b>{analysis.meta.kwCount}×</b></span>
          <span>Density: <b>{analysis.meta.density}%</b></span>
          <span>Internal links: <b>{analysis.meta.links.internal}</b></span>
          <span>External links: <b>{analysis.meta.links.external}</b></span>
        </div>
      </div>

      <Group title="Basic SEO" tests={analysis.tests.basic} open={open === "basic"} onToggle={() => setOpen(open === "basic" ? "" : "basic")} />
      <Group title="Additional" tests={analysis.tests.additional} open={open === "add"} onToggle={() => setOpen(open === "add" ? "" : "add")} />
      <Group title="Title & Description Readability" tests={analysis.tests.titleReadability} open={open === "title"} onToggle={() => setOpen(open === "title" ? "" : "title")} />
    </div>
  );
}
