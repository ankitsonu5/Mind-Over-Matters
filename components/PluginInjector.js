import { getAll } from "@/lib/store";

// Server component — injects code of every ACTIVE custom plugin at the end of
// <body>. JS/HTML plugins render as-is (server-rendered scripts execute on
// load); CSS plugins render inside a <style> tag.
export default async function PluginInjector() {
  let plugins = [];
  try {
    plugins = (await getAll("plugins")).filter((p) => p.active && p.code?.trim());
  } catch {
    return null;
  }
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
