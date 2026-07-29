"use client";

// Contact-Form-7-style builder: form HTML + custom CSS + live preview.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Head, slugifyClient } from "@/components/wpadmin/ui";
import { DEFAULT_FORM_CSS, DEFAULT_FORM_HTML } from "@/lib/form-defaults";

import { apiFetch } from "@/lib/api";
export default function FormEditor({ id }) {
  const router = useRouter();
  const isNew = !id;
  const [doc, setDoc] = useState({
    name: "", slug: "", html: DEFAULT_FORM_HTML, css: DEFAULT_FORM_CSS,
    successMessage: "Thanks! Your message was sent.", active: true,
  });
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [tab, setTab] = useState("html");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    if (isNew) return;
    apiFetch(`/api/admin/forms/${id}`).then((r) => r.json())
      .then((d) => (d.error ? setErr(d.error) : setDoc(d)))
      .catch(() => setErr("Load failed"))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const set = (k, v) => setDoc((d) => ({ ...d, [k]: v }));
  const effectiveSlug = useMemo(
    () => (slugTouched && doc.slug ? doc.slug : slugifyClient(doc.name)),
    [doc.slug, doc.name, slugTouched]
  );

  const previewHtml = useMemo(
    () => `<style>${doc.css || ""}</style><form class="mom-form" onsubmit="return false">${doc.html || ""}<div class="mom-form-status"></div></form>`,
    [doc.html, doc.css]
  );

  async function save() {
    setBusy(true); setErr(""); setOk("");
    try {
      const res = await apiFetch(isNew ? "/api/admin/forms" : `/api/admin/forms/${id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...doc, slug: effectiveSlug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setOk("Form saved ✓");
      if (isNew) router.replace(`/admin/forms/${data.id}`); else setDoc(data);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="empty">Loading…</div>;

  return (
    <div>
      <Head title={isNew ? "Add New Form" : "Edit Form"} eyebrow={<Link href="/admin/forms">← All Forms</Link>}
        action={<button className="btn btn-p" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save Form"}</button>} />
      <Alert>{err}</Alert>
      <Alert kind="ok">{ok}</Alert>

      <div className="ed-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="ed-main">
          <div className="f-grid2">
            <div className="f-row">
              <label className="f-label">Form name</label>
              <input className="f-in" value={doc.name} onChange={(e) => set("name", e.target.value)} placeholder="Guest Booking Form" />
            </div>
            <div className="f-row">
              <label className="f-label">Slug</label>
              <input className="f-in" value={effectiveSlug} onChange={(e) => { setSlugTouched(true); set("slug", slugifyClient(e.target.value)); }} />
            </div>
          </div>

          <div className="box">
            <div className="box-h">
              <span>Form Code</span>
              <span className="filter-tabs">
                <button className={tab === "html" ? "on" : ""} onClick={() => setTab("html")}>HTML</button>
                <button className={tab === "css" ? "on" : ""} onClick={() => setTab("css")}>CSS</button>
              </span>
            </div>
            <div className="box-b">
              {tab === "html" ? (
                <>
                  <textarea className="f-in mono" rows={15} spellCheck={false} value={doc.html} onChange={(e) => set("html", e.target.value)} />
                  <div className="muted" style={{ marginTop: 8 }}>
                    Give every input/textarea/select a <b>name</b> attribute — that's what appears in submissions. Keep the submit button as type="submit". Edit the HTML to add or remove fields.
                  </div>
                </>
              ) : (
                <>
                  <textarea className="f-in mono" rows={15} spellCheck={false} value={doc.css} onChange={(e) => set("css", e.target.value)} />
                  <div className="muted" style={{ marginTop: 8 }}>This CSS loads only with this form — full styling control is yours.</div>
                </>
              )}
            </div>
          </div>

          <div className="f-row">
            <label className="f-label">Success message (shown after submit)</label>
            <input className="f-in" value={doc.successMessage} onChange={(e) => set("successMessage", e.target.value)} />
          </div>
          <label className="f-check">
            <input type="checkbox" checked={!!doc.active} onChange={(e) => set("active", e.target.checked)} />
            Form active (inactive forms will not render anywhere)
          </label>
        </div>

        <div className="ed-side">
          <div className="box">
            <div className="box-h">Live Preview</div>
            <div className="box-b">
              <div className="fb-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
          <div className="box">
            <div className="box-h">Embed / Use</div>
            <div className="box-b" style={{ display: "grid", gap: 10 }}>
              <div>
                <div className="f-label">Inside a post or page (shortcode)</div>
                <div className="embed-code">[form {effectiveSlug || "slug"}]</div>
              </div>
              <div>
                <div className="f-label">Standalone page</div>
                <div className="embed-code">/f/{effectiveSlug || "slug"}</div>
              </div>
              <div className="muted">
                Entries arrive in the <Link href="/admin/submissions">Submissions</Link> section (+ email if RESEND_API_KEY is configured).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
