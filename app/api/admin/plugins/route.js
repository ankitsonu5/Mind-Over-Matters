import { NextResponse } from "next/server";
import { fail, getAll, insert, requireUser, uniqueSlug } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const { error } = await requireUser(req, "plugins");
  if (error) return error;
  return NextResponse.json(await getAll("plugins"));
}

export async function POST(req) {
  const { error } = await requireUser(req, "plugins");
  if (error) return error;
  try {
    const body = await req.json();
    if (!body.name?.trim()) return NextResponse.json({ error: "Plugin name required" }, { status: 400 });
    const slug = await uniqueSlug("plugins", body.slug || body.name);
    const plugin = await insert("plugins", {
      name: body.name.trim(),
      slug,
      description: body.description || "",
      version: body.version || "1.0.0",
      author: body.author || "",
      kind: ["js", "css", "html"].includes(body.kind) ? body.kind : "js",
      code: body.code || "",
      active: body.active !== false,
    });
    return NextResponse.json(plugin, { status: 201 });
  } catch (e) { return fail(e); }
}
