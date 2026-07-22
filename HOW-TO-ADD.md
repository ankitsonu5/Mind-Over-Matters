# Managing content — everything from /admin (no code)

Once live (see CMS setup below), open **your-site.com/admin**, log in, and you
get a form-based panel with three sections:

## 1) Blog Posts
New Blog Post -> fill title, category, cover image (upload), excerpt, body,
date -> Publish. Shows in the home Journal, on /blog (cards open on scroll),
and gets its own SEO page at /blog/your-post.

## 2) Episodes
New Episode -> fill title, number, guest, role, cover image, YouTube URL, date,
duration, "Now Streaming" toggle, tagline, body -> Publish. Shows on /episodes
(flip cards) and gets its own SEO page at /episodes/your-episode.

## 3) Home Sections -> Instagram Feed
Edit the eyebrow/title/handle, and the list of posts/reels (each: link,
thumbnail image, caption, type video/image, badge). Updates the "Feed" section
on the homepage.

Every change auto-rebuilds the site and is live in ~1-2 minutes. Each blog and
episode is a static, SEO-friendly page (proper title + meta description).

Behind the scenes these are plain files you can also edit by hand:
- Blog      -> content/blog/*.md
- Episodes  -> content/episodes/*.md
- Instagram -> content/instagram.json
Images uploaded in the CMS save to public/images/ automatically.

---

## CMS setup (one time) — GitHub login

Netlify Identity is deprecated, and a drag-drop ("Netlify Drop") site has no
repo for the CMS to save to. So use a **GitHub-connected** site + **GitHub login**:

1. **Put the project on GitHub**
   - Create a new GitHub repo and push this project to it.

2. **Connect the site to that repo on Netlify**
   - Netlify -> Add new site -> Import an existing project -> GitHub -> pick the repo.
   - (Build command `npm run build`. This replaces the Drop site so the CMS can
     commit content. Every push now auto-deploys.)

3. **Tell the CMS your repo**
   - Open `public/admin/config.yml` and set:
     `repo: your-username/your-repo`  (and `branch: main`)

4. **Set up GitHub login (one-time OAuth)**
   - On GitHub: Settings -> Developer settings -> OAuth Apps -> New OAuth App.
     - Homepage URL: your site URL
     - Authorization callback URL: `https://api.netlify.com/auth/done`
     - Copy the Client ID + generate a Client Secret.
   - On Netlify: Site configuration -> Access & security -> OAuth (Authentication
     providers) -> Install provider -> GitHub -> paste Client ID + Secret.

5. **Log in**
   - Go to `your-site/admin/` -> "Login with GitHub" -> authorize -> done.
   - Anyone you want to let edit just needs access to the GitHub repo.

> Don't want editors to need GitHub accounts at all? Then a hosted CMS like
> Sanity (free tier) is the alternative — ask and I can switch to it.

## Other quick edits (code files)

| Change                            | File                |
| --------------------------------- | ------------------- |
| Hero video + hero deck cards      | data/content.js     |
| Listen platforms                  | data/platforms.js   |
| About page (bio, stats, photo)    | data/site.js        |
| Footer (emails, address, socials) | data/site.js        |

slug rules: lowercase, dashes, no spaces/symbols.
images: live in public/images/, referenced as /images/yourfile.jpg
