import SiteHome from "@/components/SiteHome";
import { getAllPosts } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/episodes";
import { getInstagram } from "@/lib/instagram";
import { SITE_URL, SITE_NAME, OG_IMAGE, SITE_DESCRIPTION, PODCAST_NAME } from "@/lib/seo";
import { platforms } from "@/data/platforms";

// The root layout's title.template does NOT apply to this file (same route
// segment), so the homepage title is written out in full here.
export const metadata = {
  title: "Mind Over Matter Podcast | Hosted by Ashwin Gane",
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
};

export const dynamic = "force-dynamic";

// Card gradients for the hero deck, reused in order as episodes come in.
const DECK_GRADIENTS = [
  ["#0a4aaa", "#050a14"],
  ["#073175", "#0a0f1f"],
  ["#1d2b55", "#050a14"],
  ["#0c2a5e", "#08101f"],
  ["#102a4d", "#050a14"],
];

/* Show-level structured data. Episode pages carry their own PodcastEpisode
   markup; this describes the series itself and points Google at every
   platform the show is published on. */
const podcastJsonLd = {
  "@context": "https://schema.org",
  "@type": "PodcastSeries",
  name: PODCAST_NAME,
  alternateName: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  image: OG_IMAGE,
  inLanguage: "en-US",
  author: { "@type": "Person", name: "Ashwin Gane", url: `${SITE_URL}/about` },
  creator: { "@type": "Person", name: "Ashwin Gane", url: `${SITE_URL}/about` },
  publisher: {
    "@type": "Organization",
    name: PODCAST_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` },
  },
  sameAs: platforms.map((p) => p.href),
};

export default async function Page() {
  // Journal deck + Instagram feed come from the CMS, read on the server
  const articles = (await getAllPosts()).map((p) => ({
    category: p.category,
    title: p.titleHtml,
    excerpt: p.excerpt,
    date: p.date,
    bg: p.bg,
    img: p.img,
    slug: p.slug,
    num: p.num,
  }));
  // Hero deck, newest episode first (getAllEpisodes already sorts by number desc)
  const episodes = (await getAllEpisodes()).map((e, i) => {
    const num = String(e.number).padStart(2, "0");
    return {
      ep: `EP ${num}${e.live ? " \u00b7 Featured" : ""}`,
      big: num,
      title: e.title,
      guest: [e.guest, e.role].filter(Boolean).join(" \u00b7 "),
      meta: e.live ? "Now Live" : e.duration || "",
      live: !!e.live,
      grad: DECK_GRADIENTS[i % DECK_GRADIENTS.length],
      url: e.youtube,
    };
  });
  const ig = getInstagram();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(podcastJsonLd) }}
      />
      <SiteHome articles={articles} ig={ig} episodes={episodes} />
    </>
  );
}
