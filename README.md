# Mind Over Matter — Next.js (faithful port)

This is your **original site** — exact same design, animations, hero starfield,
episode deck, journal scroll-deck, Instagram feed, Listen and About sections —
moved into **Next.js**, made **dynamic** (content comes from `/data`), with
**detail pages** for episodes and blogs, plus the glowing **light-ribbon effect**
that emerges from behind each section as you scroll.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # production
```

> The hero/episode videos are YouTube embeds — they need internet and will show
> on your machine / server (a sandbox may block YouTube with "host not in allowlist").

## Update content — no code, just `/data`

| Change                                   | File              |
| ---------------------------------------- | ----------------- |
| Hero video (big video, top right)        | `data/content.js` → `heroVideo` |
| Hero "Episodes" deck cards               | `data/content.js` → `episodesDeck` |
| Instagram "Feed" section                 | `data/content.js` → `ig.items` |
| Journal cards + blog detail pages        | `data/blog.js`    |
| Episode detail pages + /episodes listing | `data/episodes.js`|

### Add a blog post (also shows in the home Journal)
Copy a block in `data/blog.js`:
```js
{
  slug: "my-post",                 // -> /blog/my-post
  category: "Episode 06",
  title: "My <span>Title</span>",  // <span> = cyan highlight on the home deck
  titlePlain: "My Title",          // plain heading on the detail page
  excerpt: "Short summary.",
  img: "/images/ep6.jpg",          // put the file in /public/images
  date: "Jul 1, 2026 · 5 min",
  bg: "#06080f",
  relatedEpisode: "my-episode",    // optional: link to an episode slug
  body: ["Paragraph one.", "Paragraph two."],
}
```

### Add an episode (detail page + listing)
Copy a block in `data/episodes.js` (`slug` -> `/episodes/<slug>`, set `youtube`).

### Change the hero / a deck video
Paste a YouTube URL into `data/content.js` (`heroVideo`, or a deck card `url`).

## How it's wired
- `components/SiteHome.js` renders your **original HTML markup** and runs your
  **original scripts** (now using bundled GSAP + Three.js instead of CDN), feeding
  them content from `/data` via `window.__MOM__`.
- `app/globals.css` is your original CSS, verbatim.
- `components/LightRibbons.js` is the new scroll-driven light effect.
- `app/episodes/*` and `app/blog/*` are the new detail + listing pages.

## Structure
```
app/
  page.js                 home (your original site)
  globals.css             your original CSS
  episodes/page.js        episodes listing
  episodes/[slug]/page.js episode detail
  blog/page.js            journal listing
  blog/[slug]/page.js     blog detail
components/
  SiteHome.js   siteContent.js   LightRibbons.js
data/           content.js  blog.js  episodes.js   <-- edit here
public/images/  logo + episode images
```
