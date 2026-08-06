"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Head, Status, fmtDate } from "@/components/wpadmin/ui";

import { apiFetch } from "@/lib/api";
export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [d, setD] = useState({});

  useEffect(() => {
    /* Guard on r.ok: a 401 still returns JSON ({error:"Unauthorized"}), and
       storing that as `me` renders "Welcome, undefined". */
    apiFetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => {});
    const load = (key, url) =>
      apiFetch(url)
        .then((r) => (r.ok ? r.json() : []))
        .then((v) => setD((x) => ({ ...x, [key]: v })))
        .catch(() => {});
    load("posts", "/api/admin/posts");
    load("episodes", "/api/admin/episodes");
    load("pages", "/api/admin/pages");
    load("forms", "/api/admin/forms");
    load("subs", "/api/admin/subs");
    load("users", "/api/admin/users");
    load("plugins", "/api/admin/plugins");
  }, []);

  const role = me?.role || "admin";
  const n = (k) => (Array.isArray(d[k]) ? d[k].length : "…");
  const cards = [
    { k: "posts", label: "Posts", href: "/admin/posts", show: true },
    {
      k: "episodes",
      label: "Episodes",
      href: "/admin/episodes",
      show: role !== "author",
    },
    {
      k: "pages",
      label: "Pages",
      href: "/admin/pages",
      show: role !== "author",
    },
    {
      k: "forms",
      label: "Forms",
      href: "/admin/forms",
      show: role !== "author",
    },
    {
      k: "subs",
      label: "Submissions",
      href: "/admin/submissions",
      show: role !== "author",
    },
    {
      k: "users",
      label: "Users",
      href: "/admin/users",
      show: role === "admin",
    },
    {
      k: "plugins",
      label: "Plugins",
      href: "/admin/plugins",
      show: role === "admin",
    },
  ].filter((c) => c.show);

  return (
    <div>
      <Head
        title={`Welcome${me ? ", " + (me.name || me.username) : ""}`}
        eyebrow="Dashboard · At a Glance"
        action={
          <Link href="/admin/posts/new" className="btn btn-p">
            + New Post
          </Link>
        }
      />
      <div className="dash-grid">
        {cards.map((c) => (
          <Link key={c.k} href={c.href} className="dash-card">
            <div className="dash-num">{n(c.k)}</div>
            <div className="dash-lbl">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="dash-2col">
        <div className="box">
          <div className="box-h">
            <span>Recent Posts</span>
            <Link href="/admin/posts">View all →</Link>
          </div>
          {(d.posts || []).slice(0, 5).map((p) => (
            <Link
              key={p.id}
              href={`/admin/posts/${p.id}`}
              className="dash-row"
              style={{
                display: "flex",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <span>
                <span
                  className="t-title"
                  style={{ color: "#fff", fontWeight: 600 }}
                >
                  {p.title}
                </span>
                <span className="t-sub" style={{ display: "block" }}>
                  {fmtDate(p.updatedAt)} · {p.authorName}
                </span>
              </span>
              <Status status={p.status} />
            </Link>
          ))}
          {d.posts?.length === 0 && (
            <div className="box-b muted">
              No posts yet — write your first one!
            </div>
          )}
        </div>

        {role !== "author" && (
          <div className="box">
            <div className="box-h">
              <span>Recent Submissions</span>
              <Link href="/admin/submissions">View all →</Link>
            </div>
            {(d.subs || []).slice(0, 5).map((s) => (
              <div key={s.id} className="dash-row">
                <span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>
                    {!s.read && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "#61dafb",
                          marginRight: 7,
                        }}
                      />
                    )}
                    {s.data?.name || s.data?.email || "Submission"}
                  </span>
                  <span className="t-sub" style={{ display: "block" }}>
                    {s.formName} · {fmtDate(s.createdAt)}
                  </span>
                </span>
              </div>
            ))}
            {d.subs?.length === 0 && (
              <div className="box-b muted">
                Form submissions will appear here.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
