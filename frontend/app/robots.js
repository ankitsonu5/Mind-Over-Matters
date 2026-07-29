import { apiGet } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function robots() {
  const settings = (await apiGet("/api/public/settings", {})) || {};
  const base = (settings.siteUrl || "https://mindovermatterpodcast.com").replace(/\/+$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/panel"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
