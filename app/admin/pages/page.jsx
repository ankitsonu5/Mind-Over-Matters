"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Head, Status, fmtDate } from "@/components/wpadmin/ui";

export default function PagesList() {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState("");

  function load() {
    fetch("/api/admin/pages").then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setItems(d) : setErr(d.error)))
      .catch(() => setErr("Load failed"));
  }
  useEffect(load, []);

  async function del(item) {
    if (!window.confirm(`Page "${item.title}" will be deleted. Continue?`)) return;
    const res = await fetch(`/api/admin/pages/${item.id}`, { method: "DELETE" });
    if (res.ok) load(); else setErr((await res.json()).error);
  }

  return (
    <div>
      <Head title="Pages" eyebrow="Content · Static Pages"
        action={<Link href="/admin/pages/new" className="btn btn-p">+ Add New Page</Link>} />
      <Alert>{err}</Alert>
      <div className="box" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr><th style={{ width: "44%" }}>Title</th><th>Status</th><th>Date</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
          <tbody>
            {items === null && <tr><td colSpan={4} className="muted" style={{ textAlign: "center", padding: 30 }}>Loading…</td></tr>}
            {items?.length === 0 && <tr><td colSpan={4} style={{ padding: 0 }}><div className="empty">Create custom pages — they go live at /p/slug. You can also embed forms: [form contact]</div></td></tr>}
            {(items || []).map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/pages/${p.id}`} className="t-title" style={{ color: "#fff" }}>{p.title}</Link>
                  <div className="t-sub">/p/{p.slug}</div>
                </td>
                <td><Status status={p.status} /></td>
                <td style={{ color: "#7285a8" }}>{fmtDate(p.updatedAt)}</td>
                <td>
                  <div className="row-acts">
                    <Link className="a-e" href={`/admin/pages/${p.id}`}>Edit</Link>
                    {p.status === "published" && <a className="a-v" href={`/p/${p.slug}`} target="_blank" rel="noreferrer">View</a>}
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
