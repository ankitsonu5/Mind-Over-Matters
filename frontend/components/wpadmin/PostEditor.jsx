"use client";

// Shared post editor (new + edit) — WP-style two-column layout.
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichEditor from "@/components/wpadmin/RichEditor";
import SeoPanel from "@/components/wpadmin/SeoPanel";
import { uploadMedia } from "@/components/wpadmin/uploadMedia";
import MediaPicker from "@/components/wpadmin/MediaPicker";
import { Alert, Head, slugifyClient } from "@/components/wpadmin/ui";

import { apiFetch } from "@/lib/api";
const EMPTY_SEO = { focusKeyword: "", title: "", description: "", schemaType: "BlogPosting", faqSchema: false };

export default function PostEditor({ id }) {
  const router = useRouter();
  const isNew = !id;
  const [doc, setDoc] = useState({
    title: "", slug: "", highlight: "", category: "", excerpt: "",
    coverImage: "", coverImageAlt: "", readTime: "5 min", relatedEpisode: "", bg: "#06080f",
    contentHtml: "", authorId: "", status: "draft", tags: [], seo: { ...EMPTY_SEO },
  });
  const [tagsText, setTagsText] = useState("");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
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
    apiFetch("/api/admin/me").then((r) => r.json()).then(setMe).catch(() => {});
    apiFetch("/api/admin/users").then((r) => (r.ok ? r.json() : [])).then((u) => Array.isArray(u) && setUsers(u)).catch(() => {});
    if (!isNew) {
      apiFetch(`/api/admin/posts/${id}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.error) setErr(d.error);
          else {
            setDoc({ ...d, seo: { ...EMPTY_SEO, ...(d.seo || {}) } });
            setTagsText((d.tags || []).join(", "));
          }
        })
        .catch(() => setErr("Could not load the post"))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const set = (k, v) => setDoc((d) => ({ ...d, [k]: v }));

  const effectiveSlug = useMemo(
    () => (slugTouched && doc.slug ? doc.slug : slugifyClient(doc.title)),
    [doc.slug, doc.title, slugTouched]
  );

  async function save(status) {
    setBusy(true); setErr(""); setOk("");
    try {
      const payload = {
        ...doc,
        slug: effectiveSlug,
        status,
        tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      };
      const res = await apiFetch(isNew ? "/api/admin/posts" : `/api/admin/posts/${id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setOk(status === "published" ? `Published ✓ — SEO score ${data.seo?.score}/100` : "Draft saved ✓");
      if (isNew) router.replace(`/admin/posts/${data.id}`);
      else {
        setDoc({ ...data, seo: { ...EMPTY_SEO, ...(data.seo || {}) } });
        setTagsText((data.tags || []).join(", "));
      }
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="empty">Loading…</div>;
  const canAssign = me && me.role !== "author" && users.length > 0;

  return (
    <div>
      <Head
        title={isNew ? "Add New Post" : "Edit Post"}
        eyebrow={<Link href="/admin/posts">← All Posts</Link>}
        action={
          <div style={{ display: "flex", gap: 9 }}>
            {doc.status === "published" && !isNew && (
              <a className="btn btn-g" href={`/blog/${effectiveSlug}`} target="_blank" rel="noreferrer">👁 View</a>
            )}
            <button className="btn btn-g" disabled={busy} onClick={() => save("draft")}>Save Draft</button>
            <button className="btn btn-p" disabled={busy} onClick={() => save("published")}>
              {busy ? "Saving…" : doc.status === "published" ? "Update" : "Publish"}
            </button>
          </div>
        }
      />
      <Alert>{err}</Alert>
      <Alert kind="ok">{ok}</Alert>

      <div className="ed-grid">
        <div className="ed-main">
          <input className="f-title" placeholder="Enter post title…" value={doc.title} onChange={(e) => set("title", e.target.value)} />
          <div className="permalink">
            <span>Permalink:</span> <span style={{ color: "#4d5f80" }}>/blog/</span>
            <input value={effectiveSlug} onChange={(e) => { setSlugTouched(true); set("slug", slugifyClient(e.target.value)); }} />
          </div>

          <RichEditor value={doc.contentHtml} onChange={(v) => set("contentHtml", v)} />

          <div className="box">
            <div className="box-h">Excerpt — short summary shown on cards</div>
            <div className="box-b">
              <textarea className="f-in" rows={2} value={doc.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="A 1–2 line summary…" />
            </div>
          </div>

          <SeoPanel doc={{ ...doc, slug: effectiveSlug }} seo={doc.seo} onChange={(seo) => set("seo", seo)} />
        </div>

        <div className="ed-side">
          <div className="box">
            <div className="box-h">Publish</div>
            <div className="box-b">
              <div className="f-row">
                <label className="f-label">Status</label>
                <select className="f-in" value={doc.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              {canAssign && (
                <div className="f-row" style={{ marginBottom: 0 }}>
                  <label className="f-label">Author (assign user)</label>
                  <select className="f-in" value={doc.authorId || me?.id || ""} onChange={(e) => set("authorId", e.target.value)}>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name || u.username} ({u.role})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="box">
            <div className="box-h">Post Settings</div>
            <div className="box-b">
              <div className="f-row">
                <label className="f-label">Category (e.g. Episode 06)</label>
                <input className="f-in" value={doc.category} onChange={(e) => set("category", e.target.value)} placeholder="Episode 06" />
                <div className="muted" style={{ marginTop: 4 }}>The number becomes the large ghost numeral on the card.</div>
              </div>
              <div className="f-row">
                <label className="f-label">Highlight word (cyan on home deck)</label>
                <input className="f-in" value={doc.highlight} onChange={(e) => set("highlight", e.target.value)} placeholder="One word from the title" />
              </div>
              <div className="f-row">
                <label className="f-label">Tags (comma separated)</label>
                <input className="f-in" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="Mindset, Culture" />
              </div>
              <div className="f-row">
                <label className="f-label">Read time</label>
                <input className="f-in" value={doc.readTime} onChange={(e) => set("readTime", e.target.value)} placeholder="5 min" />
              </div>
              <div className="f-row">
                <label className="f-label">Related episode slug (optional)</label>
                <input className="f-in" value={doc.relatedEpisode} onChange={(e) => set("relatedEpisode", e.target.value)} placeholder="the-power-of-perception" />
              </div>
              <div className="f-row" style={{ marginBottom: 0 }}>
                <label className="f-label">Card background color</label>
                <input className="f-in" value={doc.bg} onChange={(e) => set("bg", e.target.value)} placeholder="#06080f" />
              </div>
            </div>
          </div>

          <div className="box">
            <div className="box-h">Cover Image</div>
            <div className="box-b">
              <input ref={coverRef} type="file" accept="image/*" hidden onChange={onCoverFile} />
              <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
                <button className="btn btn-p btn-sm" style={{ justifyContent: "center" }} onClick={() => setPickerOpen(true)}>
                  🖼 Choose from Library / Upload
                </button>
                <button className="btn btn-g btn-sm" style={{ justifyContent: "center" }} disabled={coverBusy} onClick={() => coverRef.current?.click()}>
                  {coverBusy ? "Uploading…" : "⬆ Quick Upload"}
                </button>
              </div>
              <MediaPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={({ url, alt }) => { set("coverImage", url); if (alt) set("coverImageAlt", alt); }}
              />
              <input className="f-in" value={doc.coverImage} onChange={(e) => set("coverImage", e.target.value)} placeholder="…or paste an image URL" />
              <div style={{ marginTop: 10 }}>
                <label className="f-label">Alt text (describe the image; include the focus keyword for SEO)</label>
                <input className="f-in" value={doc.coverImageAlt || ""} onChange={(e) => set("coverImageAlt", e.target.value)} placeholder="e.g. Ashwin Gane interviewing a guest in the studio" />
              </div>
              {doc.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={doc.coverImage} alt="" style={{ width: "100%", borderRadius: 8, marginTop: 10 }} />
              )}
              <div className="muted" style={{ marginTop: 8 }}>
                <Link href="/admin/media" target="_blank">Media Library</Link>, then use Copy URL.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
