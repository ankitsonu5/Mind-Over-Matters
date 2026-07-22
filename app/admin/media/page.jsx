"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Head } from "@/components/wpadmin/ui";

function fmtSize(b) {
  if (b > 1048576) return (b / 1048576).toFixed(1) + " MB";
  if (b > 1024) return Math.round(b / 1024) + " KB";
  return b + " B";
}

export default function MediaLibrary() {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const fileRef = useRef(null);

  function load() {
    fetch("/api/admin/media").then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setItems(d) : setErr(d.error)))
      .catch(() => setErr("Load failed"));
  }
  useEffect(load, []);

  async function uploadFiles(files) {
    setErr(""); setOk(""); setBusy(true);
    try {
      for (const file of files) {
        const base64 = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result).split(",")[1]);
          r.onerror = reject;
          r.readAsDataURL(file);
        });
        const res = await fetch("/api/admin/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, mime: file.type || "application/octet-stream", data: base64 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
      }
      setOk("Uploaded ✓");
      load();
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function del(item) {
    if (!window.confirm(`"${item.filename}" will be deleted. Anywhere it's used, the image will break. Continue?`)) return;
    const res = await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" });
    if (res.ok) load(); else setErr((await res.json()).error);
  }

  function copyUrl(item) {
    navigator.clipboard?.writeText(window.location.origin + item.url);
    setOk(`URL copied: ${item.url}`);
  }

  return (
    <div>
      <Head title="Media Library" eyebrow="Uploads · Images"
        action={<button className="btn btn-p" disabled={busy} onClick={() => fileRef.current?.click()}>{busy ? "Uploading…" : "+ Upload"}</button>} />
      <Alert>{err}</Alert>
      <Alert kind="ok">{ok}</Alert>

      <input ref={fileRef} type="file" accept="image/*" multiple hidden
        onChange={(e) => { if (e.target.files?.length) uploadFiles([...e.target.files]); e.target.value = ""; }} />

      <div className={`drop ${over ? "over" : ""}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); if (e.dataTransfer.files?.length) uploadFiles([...e.dataTransfer.files]); }}>
        Drag & drop images here, or click to choose · max 4MB per file
      </div>

      {items === null && <div className="empty">Loading…</div>}
      {items?.length === 0 && <div className="empty">No media yet — upload your first image. After uploading, click "Copy URL" and paste it into any image field.</div>}
      <div className="media-grid">
        {(items || []).map((m) => (
          <div key={m.id} className="media-item">
            {m.mime?.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.url} alt={m.filename} loading="lazy" />
            ) : (
              <div style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", color: "#4d5f80" }}>FILE</div>
            )}
            <div className="media-meta">
              <div className="nm" title={m.filename}>{m.filename}</div>
              <div>{fmtSize(m.size || 0)}</div>
            </div>
            <div className="media-acts">
              <button style={{ color: "#61dafb" }} onClick={() => copyUrl(m)}>Copy URL</button>
              <button style={{ color: "#ff8b8bcc" }} onClick={() => del(m)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
