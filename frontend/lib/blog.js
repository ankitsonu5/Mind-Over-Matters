// =====================================================================
//  BLOG - reads from the backend API instead of the database.
//  The exported function signatures are unchanged, so every page that
//  already imported from here keeps working as-is.
// =====================================================================
import { apiGet } from "@/lib/api";

export async function getAllPosts() {
  return (await apiGet("/api/public/posts", [])) || [];
}

export async function getPost(slug) {
  return apiGet(`/api/public/posts/${encodeURIComponent(slug)}`, null);
}
