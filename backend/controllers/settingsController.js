import { getSettings, saveSettings } from "../lib/store.js";

/* GET /api/admin/settings */
export async function get(_req, res) {
  res.json(await getSettings());
}

/* PUT /api/admin/settings - admin only */
export async function put(req, res) {
  const body = req.body || {};
  await saveSettings({
    siteTitle: body.siteTitle || "Mind Over Matter",
    tagline: body.tagline || "",
    siteUrl: (body.siteUrl || "").replace(/\/+$/, ""),
    contactEmail: body.contactEmail || "",
    notifyEmail: (body.notifyEmail || "").trim(),
  });
  res.json(await getSettings());
}
