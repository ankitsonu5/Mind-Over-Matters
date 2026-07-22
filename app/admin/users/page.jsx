"use client";

import { useEffect, useState } from "react";
import { Alert, Head, fmtDate } from "@/components/wpadmin/ui";

const EMPTY = { username: "", name: "", email: "", role: "author", password: "" };

export default function UsersAdmin() {
  const [items, setItems] = useState(null);
  const [me, setMe] = useState(null);
  const [form, setForm] = useState(null); // null | {mode:'new'|'edit', data}
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  function load() {
    fetch("/api/admin/users").then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setItems(d) : setErr(d.error)))
      .catch(() => setErr("Load failed"));
    fetch("/api/admin/me").then((r) => r.json()).then(setMe).catch(() => {});
  }
  useEffect(load, []);

  const set = (k, v) => setForm((f) => ({ ...f, data: { ...f.data, [k]: v } }));

  async function save() {
    setBusy(true); setErr(""); setOk("");
    try {
      const isNew = form.mode === "new";
      const res = await fetch(isNew ? "/api/admin/users" : `/api/admin/users/${form.data.id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form.data),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setOk(isNew ? `User "${data.username}" created ✓` : "User updated ✓");
      setForm(null);
      load();
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function del(u) {
    if (!window.confirm(`User "${u.username}" will be deleted (their posts remain). Continue?`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    if (res.ok) load(); else setErr((await res.json()).error);
  }

  return (
    <div>
      <Head title="Users" eyebrow="Team · Roles & Access"
        action={<button className="btn btn-p" onClick={() => { setForm({ mode: "new", data: { ...EMPTY } }); setOk(""); setErr(""); }}>+ Add New User</button>} />
      <Alert>{err}</Alert>
      <Alert kind="ok">{ok}</Alert>

      {form && (
        <div className="box" style={{ marginBottom: 18 }}>
          <div className="box-h">{form.mode === "new" ? "Add New User" : `Edit: ${form.data.username}`}</div>
          <div className="box-b">
            <div className="f-grid2">
              <div className="f-row">
                <label className="f-label">Username (login)</label>
                <input className="f-in" value={form.data.username} disabled={form.mode === "edit"} onChange={(e) => set("username", e.target.value)} />
              </div>
              <div className="f-row">
                <label className="f-label">Display name</label>
                <input className="f-in" value={form.data.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="f-row">
                <label className="f-label">Email</label>
                <input className="f-in" value={form.data.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div className="f-row">
                <label className="f-label">Role</label>
                <select className="f-in" value={form.data.role} onChange={(e) => set("role", e.target.value)}>
                  <option value="admin">Admin — full access</option>
                  <option value="editor">Editor — content, forms & submissions</option>
                  <option value="author">Author — own posts only</option>
                </select>
              </div>
              <div className="f-row" style={{ marginBottom: 0 }}>
                <label className="f-label">{form.mode === "new" ? "Password" : "New password (leave empty to keep current)"}</label>
                <input className="f-in" type="password" value={form.data.password || ""} onChange={(e) => set("password", e.target.value)} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
              <button className="btn btn-p" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save User"}</button>
              <button className="btn btn-g" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="box" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr><th style={{ width: "28%" }}>User</th><th>Email</th><th>Role</th><th>Created</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
          <tbody>
            {items === null && <tr><td colSpan={5} className="muted" style={{ textAlign: "center", padding: 30 }}>Loading…</td></tr>}
            {(items || []).map((u) => (
              <tr key={u.id}>
                <td>
                  <span className="t-title">{u.name || u.username}</span>
                  {me?.id === u.id && <span className="muted"> (you)</span>}
                  <div className="t-sub">@{u.username}</div>
                </td>
                <td style={{ color: "#93a5c6" }}>{u.email || "—"}</td>
                <td><span className="bdg bdg-role">{u.role}</span></td>
                <td style={{ color: "#7285a8" }}>{fmtDate(u.createdAt)}</td>
                <td>
                  <div className="row-acts">
                    <button className="a-e" onClick={() => { setForm({ mode: "edit", data: { ...u, password: "" } }); setOk(""); setErr(""); }}>Edit</button>
                    {me?.id !== u.id && <button className="a-d" onClick={() => del(u)}>Delete</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ marginTop: 12 }}>
        Roles: <b>Admin</b> — full control · <b>Editor</b> — posts, episodes, pages, media, forms, submissions · <b>Author</b> — can write and edit only their own posts. Assign any user as the author from the post editor.
      </p>
    </div>
  );
}
