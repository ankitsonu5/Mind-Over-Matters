// =====================================================================
//  EPISODES - reads from the backend API instead of the database.
//  ytId is still re-exported here because several pages import it from
//  this module.
// =====================================================================
import { apiGet } from "@/lib/api";
import { ytId } from "@/data/episodes";

export async function getAllEpisodes() {
  return (await apiGet("/api/public/episodes", [])) || [];
}

export async function getEpisode(slug) {
  return apiGet(`/api/public/episodes/${encodeURIComponent(slug)}`, null);
}

export { ytId };
