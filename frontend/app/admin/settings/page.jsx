"use client";
import { useEffect, useState } from "react";
import { Alert, Head } from "@/components/wpadmin/ui";

import { apiFetch } from "@/lib/api";
export default function SettingsAdmin() {
  const [s, setS] = useState(null);
  const [me, setMe] = useState(null);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    apiFetch("/api/admin/settings").then((r) => r.json()).then(setS).catch(() => setErr("Load failed"));
    apiFetch("/api/admin/me").then((r) => r.json()).then(setMe).catch(() => {});
  }, []);

  const set = (k, v) => setS((x) => ({ ...x, [k]: v }));

  async function save() {
    setBusy(true); setErr(""); setOk("");
    try {
      const res = await apiFetch("/api/admin/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setS(data); setOk("Settings saved ✓");
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function changePw() {
    if (!pw || !me) return;
    setBusy(true); setErr(""); setOk("");
    try {
      const res = await apiFetch(`/api/admin/users/${me.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setPw(""); setOk("Password updated ✓");
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  if (!s) return <div className="empty">Loading…</div>;

  return (
    <div>
      <Head title="Settings" eyebrow="Site · General" />
      <Alert>{err}</Alert>
      <Alert kind="ok">{ok}</Alert>
      <div className="box" style={{ maxWidth: 640 }}>
        <div className="box-h">General</div>
        <div className="box-b">
          <div className="f-row"><label className="f-label">Site title</label>
            <input className="f-in" value={s.siteTitle || ""} onChange={(e) => set("siteTitle", e.target.value)} /></div>
          <div className="f-row"><label className="f-label">Tagline</label>
            <input className="f-in" value={s.tagline || ""} onChange={(e) => set("tagline", e.target.value)} /></div>
          <div className="f-row"><label className="f-label">Site URL (used for the sitemap and canonical URLs)</label>
            <input className="f-in" value={s.siteUrl || ""} onChange={(e) => set("siteUrl", e.target.value)} placeholder="https://mindovermatterpodcasts.com" /></div>
          <div className="f-row"><label className="f-label">Contact email</label>
            <input className="f-in" value={s.contactEmail || ""} onChange={(e) => set("contactEmail", e.target.value)} /></div>
          <div className="f-row" style={{ marginBottom: 0 }}>
            <label className="f-label">Notification email — every form entry is sent here</label>
            <input className="f-in" value={s.notifyEmail || ""} onChange={(e) => set("notifyEmail", e.target.value)} placeholder="you@example.com" />
            <div className="muted" style={{ marginTop: 5 }}>
              Requires the RESEND_API_KEY environment variable (free at resend.com). Applies to the contact page, guest page and every form built in the Forms section. Leave empty to use the NOTIFY_EMAIL_TO env variable.
            </div>
          </div>
          <button className="btn btn-p" style={{ marginTop: 16 }} disabled={busy} onClick={save}>{busy ? "Saving…" : "Save Settings"}</button>
        </div>
      </div>

      <div className="spacer" />
      <div className="box" style={{ maxWidth: 640 }}>
        <div className="box-h">Change my password{me ? ` — @${me.username}` : ""}</div>
        <div className="box-b">
          <div className="f-row"><label className="f-label">New password</label>
            <input className="f-in" type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
          <button className="btn btn-g" disabled={busy || !pw} onClick={changePw}>Update Password</button>
        </div>
      </div>
    </div>
  );
}
