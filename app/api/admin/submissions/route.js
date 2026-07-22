// Legacy endpoint kept for compatibility — now reads the unified store and
// accepts EITHER a logged-in admin session (middleware lets it through) OR
// the old x-admin-key header (ADMIN_PANEL_PASSWORD).
import { getAll } from "@/lib/store";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    const pass = process.env.ADMIN_PANEL_PASSWORD;
    const key = req.headers.get("x-admin-key") || "";
    if (!pass || key !== pass) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  try {
    const subs = await getAll("submissions");
    const byForm = {};
    for (const s of subs) {
      (byForm[s.formName || "contact"] ||= []).push({
        id: s.id, created_at: s.createdAt, data: s.data || {},
      });
    }
    const forms = Object.entries(byForm).map(([name, submissions]) => ({
      id: name, name, submissionCount: submissions.length, submissions,
    }));
    return Response.json({ forms });
  } catch (err) {
    return Response.json({ error: "Could not read submissions: " + err.message }, { status: 502 });
  }
}
