// Shared SEO helpers for detail pages.
export const SITE_URL = "https://mindovermatterpodcast.com";
export const SITE_NAME = "Mind Over Matter";

// Internal hosts: links to these stay normal (good for internal linking /
// crawl flow). Everything else opens in a new tab with safe rel attributes.
const INTERNAL_HOSTS = ["mindovermatterpodcast.com", "www.mindovermatterpodcast.com"];

export function linkifyExternal(html) {
  if (!html) return html;
  return html.replace(/<a\s+([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/gi, (m, pre, url, post) => {
    try {
      const host = new URL(url).hostname;
      if (INTERNAL_HOSTS.includes(host)) {
        // absolute internal link -> keep as-is (still crawlable)
        return m;
      }
    } catch {
      return m;
    }
    if (/target=/.test(m)) return m; // already handled
    return `<a ${pre}href="${url}"${post} target="_blank" rel="noopener noreferrer">`;
  });
}
