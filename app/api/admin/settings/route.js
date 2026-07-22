import { NextResponse } from "next/server";
import { requireUser } from "@/lib/admin-api";
import { getSettings, saveSettings } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const { error } = await requireUser(req);
  if (error) return error;
  return NextResponse.json(await getSettings());
}

export async function PUT(req) {
  const { error } = await requireUser(req, "settings");
  if (error) return error;
  try {
    const body = await req.json();
    await saveSettings({
      siteTitle: body.siteTitle || "Mind Over Matter",
      tagline: body.tagline || "",
      siteUrl: (body.siteUrl || "").replace(/\/+$/, ""),
      contactEmail: body.contactEmail || "",
      notifyEmail: (body.notifyEmail || "").trim(),
    });
    return NextResponse.json(await getSettings());
  } catch (e) {
    return NextResponse.json({ error: "Save failed: " + e.message }, { status: 500 });
  }
}
