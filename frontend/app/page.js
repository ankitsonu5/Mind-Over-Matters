import SiteHome from "@/components/SiteHome";
import { getAllPosts } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/episodes";
import { getInstagram } from "@/lib/instagram";
import { SITE_URL } from "@/lib/seo";

export const metadata = {
  title: "Mind Over Matter — Official Podcast by Ashwin Gane",
  description: "Official podcast by Ashwin Gane. A 3D audio-visual journey into the mind.",
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
  return <SiteHome articles={articles} ig={ig} episodes={episodes} />;
}
