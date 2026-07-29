// =====================================================================
//  SUBMISSIONS
//    POST /api/submit  - public. Every form on the site posts here.
//                        It does two independent, best-effort things:
//                          1. saves the entry to the store
//                          2. emails a copy through Resend
//                        If one is not configured the other still runs,
//                        so a form never silently breaks.
//    Admin endpoints read, mark-as-read and delete those entries.
// =====================================================================
import { getAll, getSettings, insert, remove, update } from "../lib/store.js";
import { sessionFromRequest } from "../lib/auth.js";

const FRIENDLY = {
  contact: "Contact List",
  "guest-application": "Guest List",
  "guest-contact": "Guest Contact List",
};

const esc = (v) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function sendEmail(formName, data, toOverride) {
  const key = process.env.RESEND_API_KEY;
  const to = toOverride || process.env.NOTIFY_EMAIL_TO;
  if (!key || !to) return false; // email simply disabled
  const from = process.env.NOTIFY_EMAIL_FROM || "Mind Over Matter <onboarding@resend.dev>";

  const rows = Object.entries(data)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 10px;border:1px solid #e3d7ba;background:#faf6ec;font-weight:bold;text-transform:capitalize">${esc(k)}</td>` +
        `<td style="padding:6px 10px;border:1px solid #e3d7ba">${esc(v)}</td></tr>`
    )
    .join("");

  const html = `<div style="font-family:Georgia,serif;color:#1c1814">
    <h2 style="margin:0 0 4px">New ${esc(formName)} submission</h2>
    <p style="color:#8a7a5c;font-size:12px;margin:0 0 16px">Mind Over Matter · ${esc(new Date().toLocaleString())}</p>
    <table style="border-collapse:collapse;font-size:14px">${rows}</table>
  </div>`;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to.split(",").map((s) => s.trim()),
      subject: `New ${FRIENDLY[formName] || formName} entry — Mind Over Matter`,
      html,
    }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}`);
  return true;
}

/* POST /api/submit - public */
export async function submit(req, res) {
  const fields = req.body || {};

  // honeypot: silently accept and drop bot spam
  if (fields["bot-field"]) return res.json({ ok: true });

  const formName = (fields["form-name"] || "contact").toString();
  const { ["form-name"]: _f, ["bot-field"]: _b, ...data } = fields;

  if (!Object.keys(data).length) {
    return res.status(400).json({ error: "Empty submission." });
  }

  let stored = false;
  let emailed = false;
  const errors = [];

  try {
    await insert("submissions", { formName, data, read: false });
    stored = true;
  } catch (e) {
    errors.push("store: " + e.message);
  }

  try {
    let notifyTo = "";
    try { notifyTo = (await getSettings()).notifyEmail || ""; } catch { /* ignore */ }
    emailed = await sendEmail(formName, data, notifyTo);
  } catch (e) {
    errors.push("email: " + e.message);
  }

  if (!stored && !emailed) {
    return res.status(500).json({
      error: "Could not save submission.",
      detail: errors.join(" | "),
    });
  }
  res.json({ ok: true, stored, emailed });
}

/* GET /api/admin/subs */
export async function list(_req, res) {
  const subs = await getAll("submissions");
  subs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(subs);
}

/* PUT /api/admin/subs/:id  body: { read: bool } */
export async function markRead(req, res) {
  res.json(await update("submissions", req.params.id, { read: !!req.body?.read }));
}

/* DELETE /api/admin/subs/:id */
export async function removeOne(req, res) {
  await remove("submissions", req.params.id);
  res.json({ ok: true });
}

/* GET /api/admin/submissions
   Legacy endpoint for the standalone /panel page. Accepts either a normal
   session OR the old x-admin-key header (ADMIN_PANEL_PASSWORD), so the
   existing panel keeps working untouched. */
export async function legacyPanel(req, res) {
  const session = sessionFromRequest(req);
  if (!session) {
    const pass = process.env.ADMIN_PANEL_PASSWORD;
    const key = req.headers["x-admin-key"] || "";
    if (!pass || key !== pass) return res.status(401).json({ error: "Unauthorized" });
  }

  const subs = await getAll("submissions");
  const byForm = {};
  for (const s of subs) {
    (byForm[s.formName || "contact"] ||= []).push({
      id: s.id,
      created_at: s.createdAt,
      data: s.data || {},
    });
  }
  const forms = Object.entries(byForm).map(([name, submissions]) => ({
    id: name, name, submissionCount: submissions.length, submissions,
  }));
  res.json({ forms });
}
