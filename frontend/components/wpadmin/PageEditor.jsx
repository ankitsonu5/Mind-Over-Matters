"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichEditor from "@/components/wpadmin/RichEditor";
import { uploadMedia } from "@/components/wpadmin/uploadMedia";
import MediaPicker from "@/components/wpadmin/MediaPicker";
import { Alert, Head, slugifyClient } from "@/components/wpadmin/ui";

import { apiFetch } from "@/lib/api";
export default function PageEditor({ id }) {
  const router = useRouter();
  const isNew = !id;
  const [doc, setDoc] = useState({ title: "", slug: "", coverImage: "", contentHtml: "", status: "draft" });
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [coverBusy, setCoverBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const coverRef = useRef(null);

  async function onCoverFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCoverBusy(true); setErr("");
    try { set("coverImage", await uploadMedia(file)); }
    catch (er) { setErr(er.message); }
    finally { setCoverBusy(false); }
  }

  useEffect(() => {
    if (isNew) return;
    apiFetch(`/api/admin/pages/${id}`).then((r) => r.json())
      .then((d) => (d.error ? setErr(d.error) : setDoc(d)))
      .catch(() => setErr("Load failed"))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const set = (k, v) => setDoc((d) => ({ ...d, [k]: v }));
  const effectiveSlug = useMemo(
    () => (slugTouched && doc.slug ? doc.slug : slugifyClient(doc.title)),
    [doc.slug, doc.title, slugTouched]
  );

  async function save(status) {
    setBusy(true); setErr(""); setOk("");
    try {
      const res = await apiFetch(isNew ? "/api/admin/pages" : `/api/admin/pages/${id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...doc, slug: effectiveSlug, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setOk(status === "published" ? `Published ✓ — /p/${data.slug}` : "Draft saved ✓");
      if (isNew) router.replace(`/admin/pages/${data.id}`); else setDoc(data);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="empty">Loading…</div>;

  return (
    <div>
      <Head title={isNew ? "Add New Page" : "Edit Page"} eyebrow={<Link href="/admin/pages">← All Pages</Link>}
        action={
          <div style={{ display: "flex", gap: 9 }}>
            {doc.status === "published" && !isNew && (
              <a className="btn btn-g" href={`/p/${effectiveSlug}`} target="_blank" rel="noreferrer">👁 View</a>
            )}
            <button className="btn btn-g" disabled={busy} onClick={() => save("draft")}>Save Draft</button>
            <button className="btn btn-p" disabled={busy} onClick={() => save("published")}>{busy ? "Saving…" : doc.status === "published" ? "Update" : "Publish"}</button>
          </div>
        } />
      <Alert>{err}</Alert>
      <Alert kind="ok">{ok}</Alert>
      <div className="ed-main" style={{ maxWidth: 840 }}>
        <input className="f-title" placeholder="Page title…" value={doc.title} onChange={(e) => set("title", e.target.value)} />
        <div className="permalink">
          <span>Permalink:</span> <span style={{ color: "#4d5f80" }}>/p/</span>
          <input value={effectiveSlug} onChange={(e) => { setSlugTouched(true); set("slug", slugifyClient(e.target.value)); }} />
        </div>
        <div className="f-row">
          <label className="f-label">Hero image (optional)</label>
          <input ref={coverRef} type="file" accept="image/*" hidden onChange={onCoverFile} />
          <div style={{ display: "flex", gap: 9 }}>
            <button className="btn btn-p btn-sm" onClick={() => setPickerOpen(true)}>🖼 Library</button>
            <button className="btn btn-g btn-sm" disabled={coverBusy} onClick={() => coverRef.current?.click()}>
              {coverBusy ? "Uploading…" : "⬆ Upload"}
            </button>
            <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} withAlt={false}
              onSelect={({ url }) => set("coverImage", url)} />
            <input className="f-in" value={doc.coverImage} onChange={(e) => set("coverImage", e.target.value)} placeholder="…or paste an image URL" />
          </div>
        </div>
        <RichEditor value={doc.contentHtml} onChange={(v) => set("contentHtml", v)} placeholder="Page content… To embed a form, type: [form contact]" />
      </div>
    </div>
  );
}
