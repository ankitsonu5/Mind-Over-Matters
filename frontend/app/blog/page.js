import BlogList from "@/components/BlogList";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";

export const metadata = {
  title: "Journal — Mind Over Matter",
  alternates: { canonical: `${SITE_URL}/blog` },
};

export const dynamic = "force-dynamic";

export default async function BlogIndex() {
  return <BlogList posts={(await getAllPosts())} />;
}
