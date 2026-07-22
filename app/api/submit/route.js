// =====================================================================
//  PUBLIC SUBMIT API  (Vercel-native)
//  POST here from every site form. It does two things:
//    1) saves the submission to MongoDB     -> read by /panel
//    2) emails a notification via Resend     -> inbox copy
//  Both are best-effort & independent: if one is not configured the
//  other still works, so the form never silently breaks.
//
//  Required env vars (Vercel -> Project -> Settings -> Environment Variables):
//    MONGODB_URI               — MongoDB Atlas connection string
//    MONGODB_DB                — db name (optional, default "mom")
//  Optional (email notifications):
//    RESEND_API_KEY            — Resend API key
//    NOTIFY_EMAIL_TO           — where notifications are sent
//    NOTIFY_EMAIL_FROM         — verified sender (default onboarding@resend.dev)
// =====================================================================
import { submissionsCollection } from "@/lib/mongo";
import { getSettings, insert } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---- email via Resend REST (no SDK needed) ----
const FRIENDLY = {
  contact: "Contact List",
  "guest-application": "Guest List",
  "guest-contact": "Guest Contact List",
};

async function sendEmail(formName, data, toOverride) {
  const key = process.env.RESEND_API_KEY;
  const to = toOverride || process.env.NOTIFY_EMAIL_TO;
  if (!key || !to) return false; // email simply disabled
  const from = process.env.NOTIFY_EMAIL_FROM || "Mind Over Matter <onboarding@resend.dev>";

  const esc = (v) =>
    String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const rows = Object.entries(data)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 10px;border:1px solid #e3d7ba;background:#faf6ec;font-weight:bold;text-transform:capitalize">${esc(
          k
        )}</td><td style="padding:6px 10px;border:1px solid #e3d7ba">${esc(v)}</td></tr>`
    )
    .join("");
  const html = `<div style="font-family:Georgia,serif;color:#1c1814">
    <h2 style="margin:0 0 4px">New ${esc(formName)} submission</h2>
    <p style="color:#8a7a5c;font-size:12px;margin:0 0 16px">Mind Over Matter · ${esc(
      new Date().toLocaleString()
    )}</p>
    <table style="border-collapse:collapse;font-size:14px">${rows}</table>
  </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to.split(",").map((s) => s.trim()),
      subject: `New ${FRIENDLY[formName] || formName} entry — Mind Over Matter`,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);
  return true;
}

export async function POST(req) {
  // accept JSON or urlencoded/multipart form posts
  let fields = {};
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      fields = await req.json();
    } else {
      const fd = await req.formData();
      fd.forEach((v, k) => (fields[k] = typeof v === "string" ? v : v.name));
    }
  } catch {
    return Response.json({ error: "Bad request body." }, { status: 400 });
  }

  // honeypot — silently accept & drop bot spam
  if (fields["bot-field"]) return Response.json({ ok: true });

  const formName = (fields["form-name"] || "contact").toString();
  // strip control keys; keep only real fields for storage/display
  const { ["form-name"]: _f, ["bot-field"]: _b, ...data } = fields;

  if (!Object.keys(data).length) {
    return Response.json({ error: "Empty submission." }, { status: 400 });
  }

  const record = {
    id:
      (globalThis.crypto && crypto.randomUUID && crypto.randomUUID()) ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    formName,
    created_at: new Date(),
    data,
  };

  let stored = false;
  let emailed = false;
  const errors = [];

  // 1) store for the admin panel — unified store layer:
  //    MongoDB when MONGODB_URI is set, local data-store/*.json otherwise
  try {
    await insert("submissions", {
      formName,
      data,
      read: false,
    });
    stored = true;
  } catch (e) {
    errors.push("store: " + e.message);
  }

  // 2) email notification — recipient from admin Settings, else NOTIFY_EMAIL_TO env
  try {
    let notifyTo = "";
    try { notifyTo = (await getSettings()).notifyEmail || ""; } catch {}
    emailed = await sendEmail(formName, data, notifyTo);
  } catch (e) {
    errors.push("email: " + e.message);
  }

  if (!stored && !emailed) {
    return Response.json(
      { error: "Could not save submission.", detail: errors.join(" | ") },
      { status: 500 }
    );
  }
  return Response.json({ ok: true, stored, emailed });
}
