// Shared SEO helpers for detail pages.
export const SITE_URL = "https://mindovermatterpodcasts.com";
export const SITE_NAME = "Mind Over Matter";

// One place for the strings that go into <title>, og: and twitter: tags,
// so the brand name never drifts between pages.
// Tel's 17 Aug direction: both "Mind Over Matter" and "Mind Over Matter
// Podcast" are valid singular brand forms. PODCAST_NAME is the one the
// branding audit standardised on for title suffixes, og:site_name and
// schema — SITE_NAME stays for in-copy/byline use.
export const PODCAST_NAME = "Mind Over Matter Podcast";
export const SITE_TITLE = `${PODCAST_NAME} | Hosted by Ashwin Gane`;
export const SITE_DESCRIPTION =
  "Official podcast by Ashwin Gane. A 3D audio-visual journey into the mind.";
export const OG_IMAGE = `${SITE_URL}/images/host.jpg`;

// Internal hosts: links to these stay normal (good for internal linking /
// crawl flow). Everything else opens in a new tab with safe rel attributes.
const INTERNAL_HOSTS = [
  "mindovermatterpodcasts.com",
  "www.mindovermatterpodcasts.com",
  "mindovermatterpodcast.com",
  "www.mindovermatterpodcast.com",
];

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
