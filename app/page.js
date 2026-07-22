import SiteHome from "@/components/SiteHome";
import { getAllPosts } from "@/lib/blog";
import { getInstagram } from "@/lib/instagram";

export const dynamic = "force-dynamic";

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
  const ig = getInstagram();
  return <SiteHome articles={articles} ig={ig} />;
}
