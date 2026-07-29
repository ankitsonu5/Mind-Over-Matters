import { apiGet } from "@/lib/api";

// Server component - injects the code of every ACTIVE plugin at the end of
// <body>. JS/HTML plugins render as-is (server-rendered scripts execute on
// load); CSS plugins render inside a <style> tag.
export default async function PluginInjector() {
  const plugins = (await apiGet("/api/public/plugins", [])) || [];
  if (plugins.length === 0) return null;

  const html = plugins
    .map((p) =>
      p.kind === "css"
        ? `<style data-plugin="${p.slug}">${p.code.replace(/<\/style>/gi, "")}</style>`
        : `<!-- plugin: ${p.slug} -->\n${p.code}`
    )
    .join("\n");

  return <div id="mom-plugins" dangerouslySetInnerHTML={{ __html: html }} />;
}
