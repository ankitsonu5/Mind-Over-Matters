"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Head, fmtDate } from "@/components/wpadmin/ui";

import { apiFetch } from "@/lib/api";
export default function FormsList() {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState("");

  function load() {
    apiFetch("/api/admin/forms").then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setItems(d) : setErr(d.error)))
      .catch(() => setErr("Load failed"));
  }
  useEffect(load, []);

  async function del(item) {
    if (!window.confirm(`Form "${item.name}" will be deleted. Continue?`)) return;
    const res = await apiFetch(`/api/admin/forms/${item.id}`, { method: "DELETE" });
    if (res.ok) load(); else setErr((await res.json()).error);
  }
  async function toggle(item) {
    await apiFetch(`/api/admin/forms/${item.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    load();
  }

  return (
    <div>
      <Head title="Forms" eyebrow="Contact Forms · Builder"
        action={<Link href="/admin/forms/new" className="btn btn-p">+ Add New Form</Link>} />
      <Alert>{err}</Alert>
      <div className="box" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr><th style={{ width: "30%" }}>Form</th><th>Shortcode / Embed</th><th>Status</th><th>Updated</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
          <tbody>
            {items === null && <tr><td colSpan={5} className="muted" style={{ textAlign: "center", padding: 30 }}>Loading…</td></tr>}
            {items?.length === 0 && <tr><td colSpan={5} style={{ padding: 0 }}><div className="empty">Build your own forms with HTML/CSS — embed them in any post or page with [form slug].</div></td></tr>}
            {(items || []).map((f) => (
              <tr key={f.id}>
                <td>
                  <Link href={`/admin/forms/${f.id}`} className="t-title" style={{ color: "#fff" }}>{f.name}</Link>
                  <div className="t-sub">standalone: /f/{f.slug}</div>
                </td>
                <td><code className="embed-code" style={{ padding: "4px 9px" }}>[form {f.slug}]</code></td>
                <td><span className={`bdg ${f.active ? "bdg-on" : "bdg-off"}`}>{f.active ? "Active" : "Inactive"}</span></td>
                <td style={{ color: "#7285a8" }}>{fmtDate(f.updatedAt)}</td>
                <td>
                  <div className="row-acts">
                    <Link className="a-e" href={`/admin/forms/${f.id}`}>Edit</Link>
                    <a className="a-v" href={`/f/${f.slug}`} target="_blank" rel="noreferrer">View</a>
                    <button className="a-v" onClick={() => toggle(f)}>{f.active ? "Deactivate" : "Activate"}</button>
                    <button className="a-d" onClick={() => del(f)}>Trash</button>
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
