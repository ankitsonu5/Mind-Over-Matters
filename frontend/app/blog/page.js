import BlogList from "@/components/BlogList";
import { getAllPosts } from "@/lib/blog";

export const metadata = { title: "Journal — Mind Over Matter" };

export const dynamic = "force-dynamic";

export default async function BlogIndex() {
  return <BlogList posts={(await getAllPosts())} />;
}
