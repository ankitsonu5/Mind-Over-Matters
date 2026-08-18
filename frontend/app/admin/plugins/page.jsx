"use client";

// WP-style Plugins screen — custom plugins (JS / CSS / HTML snippets) that get
// injected into the live site. Create in-panel or upload a .js/.css/.html file.
import { useEffect, useRef, useState } from "react";
import { Alert, Head, slugifyClient } from "@/components/wpadmin/ui";

import { apiFetch } from "@/lib/api";
import Icon from "@/components/Icon";
const EMPTY = { name: "", description: "", version: "1.0.0", author: "", kind: "js", code: "", active: true };

const KIND_HINT = {
  js: "Paste a full <script>…</script> tag — e.g. Google Analytics, Facebook Pixel, a chat widget.",
  css: "Write plain CSS rules — injected on the site inside a <style> tag. E.g. custom colors, fonts, animations.",
  html: "Any HTML block — banner, badge, widget — injected at the end of the body.",
};

export default function PluginsAdmin() {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const fileRef = useRef(null);

  function load() {
    apiFetch("/api/admin/plugins").then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setItems(d) : setErr(d.error)))
      .catch(() => setErr("Load failed"));
  }
  useEffect(load, []);

  const set = (k, v) => setForm((f) => ({ ...f, data: { ...f.data, [k]: v } }));

  async function save() {
    setBusy(true); setErr(""); setOk("");
    try {
      const isNew = form.mode === "new";
      const res = await apiFetch(isNew ? "/api/admin/plugins" : `/api/admin/plugins/${form.data.id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form.data),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setOk(`Plugin "${data.name}" saved ✓${data.active ? " — now live on the site" : ""}`);
      setForm(null);
      load();
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function toggle(p) {
    await apiFetch(`/api/admin/plugins/${p.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    setOk(!p.active ? `"${p.name}" activated ✓` : `"${p.name}" deactivated`);
    load();
  }

  async function del(p) {
    if (!window.confirm(`Plugin "${p.name}" will be deleted. Continue?`)) return;
    const res = await apiFetch(`/api/admin/plugins/${p.id}`, { method: "DELETE" });
    if (res.ok) load(); else setErr((await res.json()).error);
  }

  // ---- upload a .js / .css / .html file as a plugin ----
  async function uploadFile(file) {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const kind = ext === "css" ? "css" : ext === "html" || ext === "htm" ? "html" : "js";
    const text = await file.text();
    const code = kind === "js" && !text.includes("<script") ? `<script>\n${text}\n</script>` : text;
    setForm({
      mode: "new",
      data: {
        ...EMPTY,
        name: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        kind, code,
        description: `Uploaded from ${file.name}`,
      },
    });
    setOk(`"${file.name}" loaded — review below and Save.`);
  }

  const active = (items || []).filter((p) => p.active).length;

  return (
    <div>
      <Head title="Plugins" eyebrow={`${active} Active · ${(items || []).length} Installed`}
        action={
          <div style={{ display: "flex", gap: 9 }}>
            <button className="btn btn-g" onClick={() => fileRef.current?.click()}><Icon name="upload" /> Upload Plugin</button>
            <button className="btn btn-p" onClick={() => { setForm({ mode: "new", data: { ...EMPTY } }); setErr(""); setOk(""); }}>+ Add New Plugin</button>
          </div>
        } />
      <input ref={fileRef} type="file" accept=".js,.css,.html,.htm,.txt" hidden
        onChange={(e) => { if (e.target.files?.[0]) uploadFile(e.target.files[0]); e.target.value = ""; }} />
      <Alert>{err}</Alert>
      <Alert kind="ok">{ok}</Alert>

      {form && (
        <div className="box" style={{ marginBottom: 18 }}>
          <div className="box-h">{form.mode === "new" ? "Add New Plugin" : `Edit: ${form.data.name}`}</div>
          <div className="box-b">
            <div className="f-grid3">
              <div className="f-row">
                <label className="f-label">Plugin name</label>
                <input className="f-in" value={form.data.name} onChange={(e) => set("name", e.target.value)} placeholder="Google Analytics" />
              </div>
              <div className="f-row">
                <label className="f-label">Version</label>
                <input className="f-in" value={form.data.version} onChange={(e) => set("version", e.target.value)} />
              </div>
              <div className="f-row">
                <label className="f-label">Type</label>
                <select className="f-in" value={form.data.kind} onChange={(e) => set("kind", e.target.value)}>
                  <option value="js">JavaScript / Script tag</option>
                  <option value="css">CSS (styles)</option>
                  <option value="html">HTML block</option>
                </select>
              </div>
            </div>
            <div className="f-row">
              <label className="f-label">Description</label>
              <input className="f-in" value={form.data.description} onChange={(e) => set("description", e.target.value)} placeholder="What this plugin does" />
            </div>
            <div className="f-row">
              <label className="f-label">Code</label>
              <textarea className="f-in mono" rows={9} spellCheck={false} value={form.data.code} onChange={(e) => set("code", e.target.value)}
                placeholder={form.data.kind === "js" ? '<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>\n<script>…</script>' : form.data.kind === "css" ? "body { … }" : "<div>…</div>"} />
              <div className="muted" style={{ marginTop: 6 }}>{KIND_HINT[form.data.kind]}</div>
            </div>
            <label className="f-check" style={{ marginBottom: 14 }}>
              <input type="checkbox" checked={!!form.data.active} onChange={(e) => set("active", e.target.checked)} />
              Activate on save
            </label>
            <div style={{ display: "flex", gap: 9 }}>
              <button className="btn btn-p" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save Plugin"}</button>
              <button className="btn btn-g" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="box">
        <div className="box-h">Plugin / Description</div>
        {items === null && <div className="box-b muted">Loading…</div>}
        {items?.length === 0 && !form && (
          <div className="empty" style={{ border: 0 }}>
            No plugins yet. Create one with "+ Add New Plugin" (Analytics, Pixel, custom CSS…) or upload a .js/.css/.html file.
          </div>
        )}
        {(items || []).map((p) => (
          <div key={p.id} className="plg-row" style={{ opacity: p.active ? 1 : 0.65 }}>
            <span className={`plg-dot ${p.active ? "on" : "off"}`} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <span className="plg-name">{p.name}</span>
              <span className="plg-meta">v{p.version} · {p.kind.toUpperCase()}{p.author ? ` · By ${p.author}` : ""}</span>
              <div className="plg-desc">{p.description || "—"}</div>
              <div className="plg-acts">
                <button style={{ color: p.active ? "#ff8b8bcc" : "#61dafb" }} onClick={() => toggle(p)}>
                  {p.active ? "Deactivate" : "Activate"}
                </button>
                <button style={{ color: "#61dafb" }} onClick={() => { setForm({ mode: "edit", data: { ...p } }); setErr(""); setOk(""); }}>Edit</button>
                <button style={{ color: "#ff8b8bcc" }} onClick={() => del(p)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="muted" style={{ marginTop: 14, maxWidth: 680 }}>
        Note: This is a Next.js site, so WordPress.org plugins can't be installed directly. Here a plugin is any JS/CSS/HTML code injected into the live site — Analytics, Search Console verification, Facebook Pixel, chat widgets, custom styling and more. Activate to go live instantly; deactivate to remove. The SEO suite, Form builder and Media library are built into the core.
      </p>
    </div>
  );
}
