import EpisodesList from "@/components/EpisodesList";
import { getAllEpisodes } from "@/lib/episodes";
import { trailers } from "@/data/content";

export const metadata = {
  title: "All Episodes — Mind Over Matter",
  description: "Every episode of Mind Over Matter with Ashwin Gane — raw, unfiltered conversations.",
};

export const dynamic = "force-dynamic";

export default async function EpisodesPage() {
  return <EpisodesList episodes={(await getAllEpisodes())} trailers={trailers} />;
}
