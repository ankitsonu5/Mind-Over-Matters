"use client";

import "./admin.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { apiFetch, clearToken } from "@/lib/api";

const MENU = [
  { href: "/admin", label: "Dashboard", ic: "◆", exact: true, section: "dashboard" },
  { href: "/admin/posts", label: "Posts", ic: "✎", section: "posts" },
  { href: "/admin/episodes", label: "Episodes", ic: "▶", section: "episodes" },
  { href: "/admin/media", label: "Media", ic: "🖼", section: "media" },
  { href: "/admin/pages", label: "Pages", ic: "▤", section: "pages" },
  { href: "/admin/forms", label: "Forms", ic: "▦", section: "forms" },
  { href: "/admin/submissions", label: "Submissions", ic: "✉", section: "submissions" },
  { href: "/admin/users", label: "Users", ic: "👤", section: "users" },
  { href: "/admin/plugins", label: "Plugins", ic: "⚙", section: "plugins" },
  { href: "/admin/settings", label: "Settings", ic: "☰", section: "settings" },
];

const ROLE_SECTIONS = {
  admin: ["dashboard","posts","episodes","pages","media","forms","submissions","users","plugins","settings"],
  editor: ["dashboard","posts","episodes","pages","media","forms","submissions"],
  author: ["dashboard","posts","media"],
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState(null);
  const isLogin = pathname.startsWith("/admin/login");

  /* The old Edge middleware.js guarded /admin before the page rendered.
     With the API on its own server that check has to happen here: ask the
     backend who we are, and bounce to the login screen if it says nobody. */
  useEffect(() => {
    if (isLogin) return;
    let cancelled = false;

    apiFetch("/api/admin/me")
      .then(async (r) => {
        if (cancelled) return;
        if (r.status === 401 || r.status === 403) {
          clearToken();
          router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        if (r.ok) setMe(await r.json());
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [isLogin, pathname, router]);

  if (isLogin) return <>{children}</>;

  const allowed = ROLE_SECTIONS[me?.role] || ROLE_SECTIONS.admin;

  async function logout() {
    await apiFetch("/api/admin/logout", { method: "POST" });
    clearToken();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="wpadm">
      <aside className="wpadm-side">
        <Link href="/admin" className="wpadm-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="Mind Over Matter" />
          <small>Admin Panel</small>
        </Link>
        <div className="wpadm-nav">
          {MENU.filter((m) => allowed.includes(m.section)).map((m) => {
            const on = m.exact ? pathname === m.href : pathname.startsWith(m.href);
            return (
              <Link key={m.href} href={m.href} className={on ? "on" : ""}>
                <span className="ic">{m.ic}</span>
                <span className="lbl">{m.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="wpadm-side-foot">
          {me && (
            <div className="wpadm-me">
              <b>{me.name || me.username}</b> · {me.role}
            </div>
          )}
          <a href="/" target="_blank" rel="noreferrer">
            <span className="ic">↗</span> <span className="lbl">View Site</span>
          </a>
          <button onClick={logout}>
            <span className="ic">⏻</span> <span className="lbl">Log Out</span>
          </button>
        </div>
      </aside>
      <div className="wpadm-main">
        <div className="wpadm-wrap">{children}</div>
      </div>
    </div>
  );
}
