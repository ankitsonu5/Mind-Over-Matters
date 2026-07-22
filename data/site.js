// =====================================================================
//  ABOUT — drives the /about detail page. Edit Ashwin's bio/stats here.
// =====================================================================

export const about = {
  // ---- intro hero ("About Mind Over Matter") ----
  introEyebrow: "Ashwin Gane · Mind Over Matter · Detroit",
  introTitle: "About Mind Over Matter",
  intro: [
    "Mind Over Matter is Ashwin Gane's raw and cinematic podcast universe — a space where music, mindset, identity, culture, creativity, and truth meet without filters.",
    "The show goes beyond surface-level interviews. Each episode is designed as a deep conversation with artists, creators, thinkers, and culture-shapers who see life through a different lens.",
  ],
  introBadge: { top: "Now Live", bottom: "New Episodes · Fridays" },

  // ---- the man behind the mic ----
  eyebrow: "The Man Behind The Mic",
  name: "Ashwin Gane",
  role: "Host · Creator · Artist · Worldbuilder",
  photo: "https://ashwingane.com/wp-content/uploads/2026/04/Ashwin-Gane.webp",
  bio: [
    "Ashwin Gane is a Detroit-based artist, producer, and creative visionary known for blending music, film, and storytelling into a cinematic trap world of his own.",
    "Through Mind Over Matter, Ashwin opens the door to the thoughts behind the music — exploring perception, ambition, discipline, mythology, vision, personal evolution, and the cultural forces that shape modern creativity.",
    "From conversations with entertainers like Brandon T. Jackson to creative voices like Gerard Victor and Dre Butterz, the podcast captures real people speaking honestly about art, purpose, pressure, identity, and the journey behind success.",
  ],
  quote: "I don't want polished. I want true. There's a difference — and most people never find it.",
  stats: [
    { num: "16", suffix: "+", label: "Episodes" },
    { num: "50", suffix: "K", label: "Listeners" },
    { num: "Fri", suffix: "", label: "New Episodes" },
  ],

  // ---- three info cards ----
  cards: [
    {
      kicker: "What It Covers",
      title: "Mindset, Culture & Creativity",
      text: "The podcast explores the invisible side of success — perception, vision, fear, belief, discipline, storytelling, and the choices that define a creator's path.",
    },
    {
      kicker: "The Experience",
      title: "Raw Conversations",
      text: "Every episode is built around honesty. No PR polish, no forced answers, no fake energy — just grounded conversations that feel personal, cinematic, and real.",
    },
    {
      kicker: "Where To Listen",
      title: "Streaming Everywhere",
      text: "Mind Over Matter is available across major platforms including Spotify, Apple Podcasts, Amazon Music, iHeartRadio, Player FM, Boomplay, and YouTube.",
    },
  ],

  // ---- mission strip ----
  mission: {
    kicker: "The Mission",
    title: "To have the conversations nobody else is willing to have — and make them impossible to ignore.",
    text: "Every episode is a commitment to truth over comfort. Mind Over Matter is not just a podcast; it is an extension of Ashwin Gane's creative world — where sound, story, thought, and identity come together.",
  },
};

// =====================================================================
//  FOOTER — edit the bio, contact emails, office address and socials.
// =====================================================================
export const footer = {
  name: "Ashwin Gane",
  bioLead: "Building worlds. One sound at a time.",
  bio: "From Detroit's underground to global stages, Ashwin crafts cinematic trap for those who crave depth, tension, and timeless energy. This is where art and strategy collide.",
  contacts: [
    { label: "General inquiries.", email: "info@mindovermatterpodcast.com" },
    { label: "Guest applications.", email: "guests@mindovermatterpodcast.com" },
    { label: "PR inquiries.", email: "press@mindovermatterpodcast.com" },
  ],
  office: ["28230 Orchard Lake Road,", "Farmington Hills, MI 48334"],
  // name must match an icon key in components/Footer.js; href is the link
  socials: [
    { name: "facebook", href: "https://www.facebook.com/mindovermatterr.show" },
    { name: "x", href: "https://x.com" },
    { name: "youtube", href: "https://www.youtube.com/@MindOverMatter-w8w" },
    { name: "instagram", href: "https://www.instagram.com/mindovermatter.show/" },
    { name: "tiktok", href: "https://tiktok.com" },
    { name: "spotify", href: "https://open.spotify.com/show/1gjHxeDVFhwJLNc4j3TRIX" },
    { name: "apple", href: "https://podcasts.apple.com/us/podcast/mind-over-matter/id1891023935" },
    { name: "threads", href: "https://threads.net" },
    { name: "pinterest", href: "https://pinterest.com" },
    { name: "soundcloud", href: "https://soundcloud.com" },
  ],
};
