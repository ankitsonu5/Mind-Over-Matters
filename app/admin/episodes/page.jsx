"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Head, Status, fmtDate } from "@/components/wpadmin/ui";

export default function EpisodesList() {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState("");

  function load() {
    fetch("/api/admin/episodes").then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setItems(d) : setErr(d.error)))
      .catch(() => setErr("Load failed"));
  }
  useEffect(load, []);

  async function del(item) {
    if (!window.confirm(`Episode "${item.title}" will be deleted. Continue?`)) return;
    const res = await fetch(`/api/admin/episodes/${item.id}`, { method: "DELETE" });
    if (res.ok) load(); else setErr((await res.json()).error);
  }

  return (
    <div>
      <Head title="Episodes" eyebrow="Content · Podcast"
        action={<Link href="/admin/episodes/new" className="btn btn-p">+ Add New Episode</Link>} />
      <Alert>{err}</Alert>
      <div className="box" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr><th>#</th><th style={{ width: "36%" }}>Title</th><th>Guest</th><th>Status</th><th>Date</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
          <tbody>
            {items === null && <tr><td colSpan={6} className="muted" style={{ textAlign: "center", padding: 30 }}>Loading…</td></tr>}
            {items?.length === 0 && <tr><td colSpan={6} style={{ padding: 0 }}><div className="empty">Episodes created here will appear on the site alongside the original markdown episodes.</div></td></tr>}
            {(items || []).map((e) => (
              <tr key={e.id}>
                <td style={{ color: "#61dafb", fontWeight: 700 }}>{String(e.number).padStart(2, "0")}</td>
                <td>
                  <Link href={`/admin/episodes/${e.id}`} className="t-title" style={{ color: "#fff" }}>{e.title}</Link>
                  <div className="t-sub">/episodes/{e.slug}</div>
                </td>
                <td style={{ color: "#93a5c6" }}>{e.guest || "—"}<div className="t-sub">{e.role}</div></td>
                <td><Status status={e.status} /></td>
                <td style={{ color: "#7285a8", whiteSpace: "nowrap" }}>{fmtDate(e.date)}</td>
                <td>
                  <div className="row-acts">
                    <Link className="a-e" href={`/admin/episodes/${e.id}`}>Edit</Link>
                    {e.status === "published" && <a className="a-v" href={`/episodes/${e.slug}`} target="_blank" rel="noreferrer">View</a>}
                    <button className="a-d" onClick={() => del(e)}>Trash</button>
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
