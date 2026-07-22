# Mind Over Matter — Admin Panel Guide

A complete WordPress-style admin panel, built directly into the site. Frontend and backend live in one project.

## Login

- URL: **`/admin`**
- Default credentials: **admin / admin123**
- First step: change your password in **Settings → Change my password**, or set these environment variables on Vercel:
  - `ADMIN_USER` / `ADMIN_PASSWORD` — used to create the first admin account
  - `AUTH_SECRET` — any long random string (secures login sessions)

> The old Decap CMS (previously at `/admin`) and the `/panel` submissions page have been replaced. `/panel` now redirects to the new admin.

## Sections

### Posts
- The list shows an **SEO Details** column for every post — score badge (green 80+, yellow 51–79, red below), focus keyword, schema type (including FAQPage), and internal/external link counts — just like Rank Math in WordPress.
- The editor includes: title, permalink, a **Visual/HTML rich editor** (H2/H3, bold, quotes, lists, links, **image upload**, YouTube embeds), excerpt, category (`Episode 06` — the number becomes the ghost numeral on the home card), highlight word (cyan on the home deck), tags, read time, related episode, card background, and cover image with **direct upload**.
- **Author assignment**: admins and editors can assign any user as the post author.
- **Import Site Posts** pulls the original markdown blog posts into the admin so every existing blog can be edited and SEO-optimized. Admin posts with the same slug override the markdown versions — nothing is duplicated.
- Publishing makes a post live instantly on the home Journal deck and `/blog`.

### SEO (Rank Math style — built into the post editor)
- **Focus Keyword** + live **SEO score /100**
- **Google snippet preview**
- SEO Title (60-char counter) and Meta Description (160-char counter)
- **15 checks** in three groups (Basic / Additional / Readability) — every failed check shows exactly how to fix it
- **Schema**: Article / BlogPosting / NewsArticle, plus **FAQ Schema** (write an H3 question followed by a paragraph answer — detected automatically)
- Automatic frontend output: meta tags, Open Graph, Twitter cards, canonical URLs, JSON-LD (including FAQPage), **`/sitemap.xml`** (posts + episodes + pages) and **`/robots.txt`**

**How to reach 90+ on any post:**
1. Set a focus keyword.
2. Use it in the SEO title (at the start), meta description, slug, first paragraph, and one H2/H3.
3. Write **1000+ words** (2000+ scores full marks).
4. Add at least one internal link and one external link.
5. Upload an image and put the focus keyword in its alt text (the editor asks for alt text on every upload).
6. Keep the title ≤ 60 chars and the description 80–160 chars.
Follow the checklist until everything is green — 90+ is fully achievable (a fully optimized post scores 92–100).

After deploying, submit `your-domain.com/sitemap.xml` in Google Search Console to start ranking.

### Episodes
Number, guest, role, cover image (upload or URL), YouTube URL, date, duration, Live badge, tagline, and show notes. Published episodes merge with the original markdown episodes on `/episodes` and the home page.

### Media
Drag-and-drop image uploads (max 4MB per file). Click **Copy URL** to use an image anywhere. Files are stored in the database, so uploads persist on Vercel.

### Pages
Create custom pages, live at `/p/slug`. Embed any form by typing `[form slug]` in the content.

### Forms — HTML/CSS Form Builder
- Build forms by editing the **HTML** (give every field a `name` attribute) and **CSS**, with a live preview.
- Two ways to use a form:
  1. Shortcode: `[form slug]` inside any post or page
  2. Standalone page: `/f/slug`
- Entries arrive in **Submissions** (with unread indicators), plus optional email notifications when `RESEND_API_KEY` and `NOTIFY_EMAIL_TO` are configured.
- The site's built-in `/contact` and `/guest` forms also feed the same inbox.
- Forms can be activated/deactivated at any time.

### Users — Roles & Access
- **Admin** — full access (users, plugins, settings included)
- **Editor** — posts, episodes, pages, media, forms, submissions
- **Author** — can create and edit **only their own** posts
Create users in **Users → Add New**, then assign them to posts from the post editor.

### Plugins
- **Add New Plugin**: name + type (JS / CSS / HTML) + code → save → **Activate/Deactivate** with one click. Active plugin code is injected into the live site immediately.
- **Upload Plugin**: upload a `.js` / `.css` / `.html` file to create a plugin from it.
- Use cases: Google Analytics, Search Console verification, Facebook Pixel, chat widgets, custom CSS, announcement banners…
- Note: this is a Next.js site, so WordPress.org plugins cannot be installed directly — this injected-code plugin system covers the vast majority of real-world plugin needs, and the SEO suite, Form builder and Media library are built into the core.

### Settings
Site title, tagline, **Site URL** (used for sitemap/canonical URLs — keep it accurate), contact email, and your password.

## Deployment (Vercel) — required

Vercel's filesystem is read-only, so **MongoDB is required** for admin data to persist in production:

1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Add a database user, and allow `0.0.0.0/0` under Network Access
3. Copy the connection string
4. In Vercel → Project → Settings → Environment Variables, add:
   - `MONGODB_URI` = `mongodb+srv://user:pass@cluster…`
   - `AUTH_SECRET` = a long random string
   - `ADMIN_USER` / `ADMIN_PASSWORD` = your login (creates the first admin)
   - Optional email: `RESEND_API_KEY`, `NOTIFY_EMAIL_TO`, `NOTIFY_EMAIL_FROM`
5. Redeploy, open `/admin`, and use **Import Site Posts** to bring the existing blogs in.

Local development needs no database — data is saved to `data-store/*.json`.

## Quick recipes

- **Add Google Analytics**: Plugins → Add New → type JS → paste the GA snippet → Activate.
- **New contact form on a page**: Forms → Add New (edit the field HTML) → Save → add `[form your-slug]` to any page.
- **Give a writer access**: Users → Add New → role Author → they log in and manage only their own posts.
- **Rank a post**: open it → SEO panel → set the focus keyword → clear every red check → hit 90+ → publish → submit the sitemap in Search Console.
