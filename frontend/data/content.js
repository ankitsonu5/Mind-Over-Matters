// =====================================================================
//  HOME CONTENT  — this feeds the ORIGINAL site scripts (hero deck,
//  Instagram feed, journal). Edit these to update the home page.
//
//  - heroVideo     : the big hero video (paste any YouTube URL)
//  - episodesDeck  : the cards in the hero "Episodes" deck/carousel
//  - ig            : the Instagram "Feed" section
//  (Journal/blog content now comes from the CMS: content/blog/*.md)
// =====================================================================

export const heroVideo = "https://youtu.be/5tMYeJNbeOI";

// The shuffleable hero deck (kept exactly like the original design).
// grad = the two gradient colours behind each card; url = the YouTube link.
export const episodesDeck = [
  { ep: "EP 02 · Featured", big: "02", title: "Ashwin Gane &amp; Gerard Victor", guest: "Actor · Comedian · Producer", meta: "Now Live", live: true,
    grad: ["#0a4aaa", "#050a14"], url: "https://youtu.be/SltYPjMkbaE?si=k6T37bT_lNr6ieDr" },
  { ep: "EP 02", big: "02", title: "Preview", guest: "Gerard Victor", meta: "", live: false,
    grad: ["#073175", "#0a0f1f"], url: "https://www.youtube.com/watch?v=E9hl5LBFCKc" },
  { ep: "EP 01", big: "01", title: "Episode 01", guest: "Brandon T. Jackson", meta: "", live: false,
    grad: ["#1d2b55", "#050a14"], url: "https://youtu.be/mxzMQkyW7ok?si=Ko0ECxdVJUQLLA2z" },
  { ep: "EP 01", big: "01", title: "Promo", guest: "Detroit Studio", meta: "", live: false,
    grad: ["#0c2a5e", "#08101f"], url: "https://www.youtube.com/watch?v=FNx1B6wq5Wo" },
  { ep: "EP 01", big: "01", title: "Trailer", guest: "Detroit Studio", meta: "", live: false,
    grad: ["#102a4d", "#050a14"], url: "https://www.youtube.com/watch?v=PRwHYYYt91M" },
];

// =====================================================================
//  TRAILERS / PROMOS  — these show up on the /episodes page under the
//  "Trailers" filter. They open straight on YouTube (no detail page).
//  Edit / add freely. `image` can reuse any episode image in /public/images.
// =====================================================================
export const trailers = [
  { title: "Season Trailer", label: "Trailer", guest: "Detroit Studio",
    image: "/images/ep1.jpg", duration: "2m 10s",
    youtube: "https://www.youtube.com/watch?v=PRwHYYYt91M" },
  { title: "Episode 01 Promo", label: "Promo", guest: "Detroit Studio",
    image: "/images/ep3.webp", duration: "1m 30s",
    youtube: "https://www.youtube.com/watch?v=FNx1B6wq5Wo" },
  { title: "Episode 02 Preview", label: "Preview", guest: "Gerard Victor",
    image: "/images/ep2.jpg", duration: "1m 45s",
    youtube: "https://www.youtube.com/watch?v=E9hl5LBFCKc" },
];

