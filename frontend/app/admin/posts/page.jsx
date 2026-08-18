"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Head, SeoBadge, Status, fmtDate } from "@/components/wpadmin/ui";

import { apiFetch } from "@/lib/api";
import Icon from "@/components/Icon";
export default function PostsList() {
  const router = useRouter();
  const [items, setItems] = useState(null);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  function load() {
    apiFetch("/api/admin/posts")
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setItems(d) : setErr(d.error)))
      .catch(() => setErr("Load failed"));
  }
  useEffect(load, []);

  async function importSeeds() {
    if (!window.confirm("Import the original site blog posts into the admin so you can edit and SEO-optimize them?")) return;
    setErr("");
    const res = await apiFetch("/api/admin/import-posts", { method: "POST" });
    const data = await res.json();
    if (!res.ok) setErr(data.error || "Import failed");
    else if (data.imported === 0) window.alert("Nothing to import — all site posts are already in the admin.");
    load();
  }

  async function del(item) {
    if (!window.confirm(`"${item.title}" will be permanently deleted. Continue?`)) return;
    const res = await apiFetch(`/api/admin/posts/${item.id}`, { method: "DELETE" });
    if (res.ok) load();
    else setErr((await res.json()).error || "Delete failed");
  }

  const list = (items || []).filter((p) => {
    if (tab !== "all" && p.status !== tab) return false;
    if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const counts = {
    all: items?.length || 0,
    published: (items || []).filter((p) => p.status === "published").length,
    draft: (items || []).filter((p) => p.status === "draft").length,
  };

  return (
    <div>
      <Head
        title="Posts"
        eyebrow="Content · Journal"
        action={
          <div style={{ display: "flex", gap: 9 }}>
            <button className="btn btn-g" onClick={importSeeds}><Icon name="import" /> Import Site Posts</button>
            <Link href="/admin/posts/new" className="btn btn-p">+ Add New Post</Link>
          </div>
        }
      />
      <Alert>{err}</Alert>
      <div className="filters">
        <div className="filter-tabs">
          {["all", "published", "draft"].map((t) => (
            <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
              {t} ({counts[t]})
            </button>
          ))}
        </div>
        <input className="f-in" style={{ maxWidth: 220 }} placeholder="Search posts…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="box" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: "34%" }}>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ color: "#61dafb" }}>SEO Details <Icon name="edit" /></th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items === null && (
              <tr><td colSpan={7} className="muted" style={{ textAlign: "center", padding: 30 }}>Loading…</td></tr>
            )}
            {items !== null && list.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 0 }}>
                <div className="empty">No posts found. <Link href="/admin/posts/new">Write your first post →</Link></div>
              </td></tr>
            )}
            {list.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/posts/${p.id}`} className="t-title" style={{ color: "#fff" }}>{p.title}</Link>
                  <div className="t-sub">/blog/{p.slug}</div>
                </td>
                <td style={{ color: "#93a5c6" }}>{p.authorName || "—"}</td>
                <td style={{ color: "#93a5c6" }}>{p.category || "—"}</td>
                <td><Status status={p.status} /></td>
                <td style={{ color: "#7285a8", whiteSpace: "nowrap" }}>{fmtDate(p.publishedAt || p.updatedAt)}</td>
                <td>
                  <SeoBadge score={p.seo?.score} />
                  <div className="seo-cell">
                    <div><span className="k">Keyword:</span> {p.seo?.focusKeyword || "not set"}</div>
                    <div>
                      <span className="k">Schema:</span>{" "}
                      {(!p.seo?.schemaType || p.seo?.schemaType === "BlogPosting") ? "Article (BlogPosting)" : p.seo.schemaType}
                      {p.seo?.faqSchema ? ", FAQPage" : ""}
                    </div>
                    <div><span className="k">Links:</span> <Icon name="link" /> {p.seo?.links?.internal ?? 0} in · <Icon name="external" /> {p.seo?.links?.external ?? 0} out</div>
                  </div>
                </td>
                <td>
                  <div className="row-acts">
                    <button className="a-e" onClick={() => router.push(`/admin/posts/${p.id}`)}>Edit</button>
                    {p.status === "published" && (
                      <a className="a-v" href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">View</a>
                    )}
                    <button className="a-d" onClick={() => del(p)}>Trash</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
