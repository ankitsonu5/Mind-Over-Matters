"use client";

export function Head({ title, eyebrow, action }) {
  return (
    <div className="wpadm-head">
      <div>
        <div className="wpadm-eyebrow">{eyebrow}</div>
        <h1 className="wpadm-h1">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Status({ status }) {
  const pub = status === "published";
  return <span className={`bdg ${pub ? "bdg-pub" : "bdg-draft"}`}>{pub ? "Published" : "Draft"}</span>;
}

export function Alert({ kind = "err", children }) {
  if (!children) return null;
  return <div className={`al ${kind === "err" ? "al-err" : "al-ok"}`}>{children}</div>;
}

export function SeoBadge({ score }) {
  if (score == null) return <span className="muted">—</span>;
  const c = score >= 80 ? "seo-green" : score >= 51 ? "seo-yellow" : "seo-red";
  return <span className={`seo-b ${c}`}>{score} / 100</span>;
}

export function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return iso; }
}

export function slugifyClient(str = "") {
  return String(str).toLowerCase().trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u0900-\u097F]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
