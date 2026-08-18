"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichEditor from "@/components/wpadmin/RichEditor";
import { uploadMedia } from "@/components/wpadmin/uploadMedia";
import MediaPicker from "@/components/wpadmin/MediaPicker";
import { Alert, Head, slugifyClient } from "@/components/wpadmin/ui";

import { apiFetch } from "@/lib/api";
import Icon from "@/components/Icon";
export default function EpisodeEditor({ id }) {
  const router = useRouter();
  const isNew = !id;
  const [doc, setDoc] = useState({
    title: "", slug: "", number: "", guest: "", role: "", image: "", youtube: "",
    date: new Date().toISOString().slice(0, 10), duration: "", live: false,
    tagline: "", contentHtml: "", status: "draft",
  });
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
    try { set("image", await uploadMedia(file)); }
    catch (er) { setErr(er.message); }
    finally { setCoverBusy(false); }
  }

  useEffect(() => {
    if (isNew) return;
    apiFetch(`/api/admin/episodes/${id}`).then((r) => r.json())
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
      const res = await apiFetch(isNew ? "/api/admin/episodes" : `/api/admin/episodes/${id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...doc, slug: effectiveSlug, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setOk(status === "published" ? "Published ✓" : "Draft saved ✓");
      if (isNew) router.replace(`/admin/episodes/${data.id}`); else setDoc(data);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="empty">Loading…</div>;

  return (
    <div>
      <Head title={isNew ? "Add New Episode" : "Edit Episode"} eyebrow={<Link href="/admin/episodes">← All Episodes</Link>}
        action={
          <div style={{ display: "flex", gap: 9 }}>
            {doc.status === "published" && !isNew && (
              <a className="btn btn-g" href={`/episodes/${effectiveSlug}`} target="_blank" rel="noreferrer"><Icon name="view" /> View</a>
            )}
            <button className="btn btn-g" disabled={busy} onClick={() => save("draft")}>Save Draft</button>
            <button className="btn btn-p" disabled={busy} onClick={() => save("published")}>{busy ? "Saving…" : doc.status === "published" ? "Update" : "Publish"}</button>
          </div>
        } />
      <Alert>{err}</Alert>
      <Alert kind="ok">{ok}</Alert>

      <div className="ed-grid">
        <div className="ed-main">
          <input className="f-title" placeholder="Episode title…" value={doc.title} onChange={(e) => set("title", e.target.value)} />
          <div className="permalink">
            <span>Permalink:</span> <span style={{ color: "#4d5f80" }}>/episodes/</span>
            <input value={effectiveSlug} onChange={(e) => { setSlugTouched(true); set("slug", slugifyClient(e.target.value)); }} />
          </div>
          <div className="f-row">
            <label className="f-label">Tagline (large quote on the episode page)</label>
            <input className="f-in" value={doc.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="One line that defines the episode" />
          </div>
          <RichEditor value={doc.contentHtml} onChange={(v) => set("contentHtml", v)} placeholder="Episode description / show notes…" minHeight={260} />
        </div>

        <div className="ed-side">
          <div className="box">
            <div className="box-h">Episode Details</div>
            <div className="box-b">
              <div className="f-grid2">
                <div className="f-row"><label className="f-label">Number</label>
                  <input className="f-in" type="number" value={doc.number} onChange={(e) => set("number", e.target.value)} placeholder="06" /></div>
                <div className="f-row"><label className="f-label">Duration</label>
                  <input className="f-in" value={doc.duration} onChange={(e) => set("duration", e.target.value)} placeholder="58 min" /></div>
              </div>
              <div className="f-row"><label className="f-label">Guest name</label>
                <input className="f-in" value={doc.guest} onChange={(e) => set("guest", e.target.value)} /></div>
              <div className="f-row"><label className="f-label">Guest role</label>
                <input className="f-in" value={doc.role} onChange={(e) => set("role", e.target.value)} placeholder="Artist · Producer" /></div>
              <div className="f-row"><label className="f-label">Date</label>
                <input className="f-in" type="date" value={doc.date} onChange={(e) => set("date", e.target.value)} /></div>
              <div className="f-row"><label className="f-label">YouTube URL</label>
                <input className="f-in" value={doc.youtube} onChange={(e) => set("youtube", e.target.value)} placeholder="https://youtu.be/…" /></div>
              <label className="f-check"><input type="checkbox" checked={!!doc.live} onChange={(e) => set("live", e.target.checked)} /> Live / Latest badge</label>
            </div>
          </div>
          <div className="box">
            <div className="box-h">Cover Image</div>
            <div className="box-b">
              <input ref={coverRef} type="file" accept="image/*" hidden onChange={onCoverFile} />
              <button className="btn btn-p btn-sm" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }} onClick={() => setPickerOpen(true)}>
                <Icon name="media" /> Choose from Library / Upload
              </button>
              <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} withAlt={false}
                onSelect={({ url }) => set("image", url)} />
              <input className="f-in" value={doc.image} onChange={(e) => set("image", e.target.value)} placeholder="…or paste an image URL" />
              {doc.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={doc.image} alt="" style={{ width: "100%", borderRadius: 8, marginTop: 10 }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
