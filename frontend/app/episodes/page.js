import EpisodesList from "@/components/EpisodesList";
import { getAllEpisodes } from "@/lib/episodes";
import { SITE_URL } from "@/lib/seo";

export const metadata = {
  title: "All Episodes",
  description: "Every episode of Mind Over Matter with Ashwin Gane — raw, unfiltered conversations.",
  alternates: { canonical: `${SITE_URL}/episodes` },
};

export const dynamic = "force-dynamic";

export default async function EpisodesPage() {
  return <EpisodesList episodes={await getAllEpisodes()} />;
}
