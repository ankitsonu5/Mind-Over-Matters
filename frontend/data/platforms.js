// =====================================================================
//  LISTEN PLATFORMS — drives the /listen listing and /listen/<slug>
//  detail pages. (The homepage Listen section keeps its original design.)
// =====================================================================

export const platforms = [
  {
    slug: "apple-podcasts",
    name: "Apple Podcasts",
    href: "https://podcasts.apple.com/us/podcast/mind-over-matter/id1891023935",
    logo: "/images/Untitled design (3).png",
    blurb: "Stream every episode on Apple Podcasts and follow the show to get new drops automatically.",
  },
  {
    slug: "spotify",
    name: "Spotify",
    href: "https://open.spotify.com/show/1gjHxeDVFhwJLNc4j3TRIX",
    logo: "/images/Untitled design (5).png",
    blurb: "Save Mind Over Matter to your library on Spotify and listen on any device, online or off.",
  },
  {
    slug: "amazon-music",
    name: "Amazon Music",
    href: "https://music.amazon.com/podcasts/30217c2c-a27a-463c-9d08-b743a853a88a/mind-over-matter",
    logo: "/images/Untitled design (4).png",
    blurb: "Catch the full season on Amazon Music — ad-free with Prime and Unlimited.",
  },
  {
    slug: "iheart-radio",
    name: "iHeart Radio",
    href: "https://www.iheart.com/podcast/1323-mind-over-matter-329212110",
    logo: "/images/Untitled design (6).png",
    blurb: "Follow the show on iHeartRadio and stream the latest conversations on the go.",
  },
  {
    slug: "player-fm",
    name: "Player FM",
    href: "https://player.fm/series/3726268",
    logo: "/images/Untitled design (7).png",
    blurb: "Subscribe on Player FM to queue episodes and keep your feed in sync everywhere.",
  },
  {
    slug: "boomplay",
    name: "Boomplay",
    href: "https://www.boomplay.com/podcasts/143835",
    logo: "/images/Untitled design (2).png",
    blurb: "Tune in on Boomplay and take Mind Over Matter with you across Africa and beyond.",
  },
];

export const getPlatform = (slug) => platforms.find((p) => p.slug === slug);
