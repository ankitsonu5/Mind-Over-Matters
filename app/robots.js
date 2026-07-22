import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function robots() {
  const settings = await getSettings();
  const base = (settings.siteUrl || "https://mindovermatterpodcast.com").replace(/\/+$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/panel"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
