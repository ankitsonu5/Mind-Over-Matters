"use client";

// WordPress-style "Select or Upload Media" modal — library grid + upload +
// alt text + URL paste, all in one popup.
import { useEffect, useRef, useState } from "react";
import { uploadMedia } from "./uploadMedia";

export default function MediaPicker({ open, onClose, onSelect, withAlt = true }) {
  const [items, setItems] = useState(null);
  const [selected, setSelected] = useState(null);
  const [alt, setAlt] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setSelected(null); setAlt(""); setUrl(""); setErr("");
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d.filter((m) => m.mime?.startsWith("image/")) : []))
      .catch(() => setItems([]));
  }, [open]);

  if (!open) return null;

  async function onFiles(files) {
    setBusy(true); setErr("");
    try {
      let lastUrl = "";
      for (const f of files) lastUrl = await uploadMedia(f);
      const r = await fetch("/api/admin/media");
      const d = await r.json();
      setItems(Array.isArray(d) ? d.filter((m) => m.mime?.startsWith("image/")) : []);
      setSelected(lastUrl);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  function confirm() {
    const chosen = url.trim() || selected;
    if (!chosen) return setErr("Choose an image, upload one, or paste a URL.");
    onSelect({ url: chosen, alt: alt.trim() });
    onClose();
  }

  return (
    <div className="mp-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="mp-modal">
        <div className="mp-head">
          <span>Select or Upload Media</span>
          <button className="mp-x" onClick={onClose}>✕</button>
        </div>

        {err && <div className="al al-err" style={{ margin: "12px 16px 0" }}>{err}</div>}

        <div className="mp-body">
          <div className="mp-grid-wrap">
            <input ref={fileRef} type="file" accept="image/*" multiple hidden
              onChange={(e) => { if (e.target.files?.length) onFiles([...e.target.files]); e.target.value = ""; }} />
            <button className="mp-upload" disabled={busy} onClick={() => fileRef.current?.click()}>
              {busy ? "Uploading…" : "⬆ Upload files"}
            </button>
            {items === null && <div className="muted" style={{ padding: 20 }}>Loading library…</div>}
            {items?.length === 0 && <div className="muted" style={{ padding: 20 }}>Library is empty — upload your first image.</div>}
            <div className="mp-grid">
              {(items || []).map((m) => (
                <button
                  key={m.id}
                  className={`mp-item ${selected === m.url ? "on" : ""}`}
                  onClick={() => { setSelected(m.url); setUrl(""); }}
                  title={m.filename}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.filename} loading="lazy" />
                  {selected === m.url && <span className="mp-check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="mp-side">
            {(selected || url) && (
              <div className="mp-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url.trim() || selected} alt="" />
              </div>
            )}
            {withAlt && (
              <div>
                <label className="f-label">Alt text (describe the image; include the focus keyword for SEO)</label>
                <textarea className="f-in" rows={3} value={alt} onChange={(e) => setAlt(e.target.value)}
                  placeholder="e.g. Ashwin Gane interviewing Brandon T. Jackson in the studio" />
              </div>
            )}
            <div>
              <label className="f-label">…or paste an image URL</label>
              <input className="f-in" value={url} onChange={(e) => { setUrl(e.target.value); setSelected(null); }} placeholder="https://…" />
            </div>
          </div>
        </div>

        <div className="mp-foot">
          <button className="btn btn-g" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={confirm}>Select</button>
        </div>
      </div>
    </div>
  );
}
