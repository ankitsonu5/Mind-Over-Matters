# Mind Over Matter

Podcast website with a built-in CMS, split into two independent applications.

```
Mind-Over-Matters/
├── backend/     Express + MongoDB REST API   (port 5000)
└── frontend/    Next.js 14 website + admin   (port 3000)
```

The frontend never touches the database. Everything it displays comes from the
backend over HTTP, which means either half can be deployed, scaled or replaced
on its own.

---

## Quick start

```bash
# 1. install everything (root, backend, frontend)
npm run install:all

# 2. create the two env files
cp backend/.env.example      backend/.env
cp frontend/.env.local.example frontend/.env.local

# 3. run both together
npm run dev
```

- Website → http://localhost:3000
- API → http://localhost:5000/api/health
- Admin panel → http://localhost:3000/admin (default `admin` / `admin123`)

To run just one side: `npm run dev:backend` or `npm run dev:frontend`.

---

## How the two halves talk

`frontend/next.config.mjs` forwards every `/api/*` request to the backend:

```js
{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }
```

This matters more than it looks. Because the browser only ever sees one origin,
there is no CORS negotiation and no cross-site cookie problem, and media URLs
already saved inside post HTML (`/api/media/<id>`) keep resolving exactly as they
did before the split.

Server components skip the proxy and call `BACKEND_URL` directly — a page being
rendered on the server has no reason to make a round trip through itself.

Both paths go through one file, `frontend/lib/api.js`:

| Function | Used by | What it does |
| --- | --- | --- |
| `apiGet(path, fallback)` | server components | absolute URL, `cache: "no-store"`, returns `fallback` instead of throwing |
| `apiFetch(path, options)` | browser / admin panel | relative URL, sends cookie + bearer token |

---

## Authentication

Login returns the session **two ways**: an httpOnly cookie *and* a token in the
JSON body. The backend accepts either one.

The cookie is the normal path. The token exists for the case where the frontend
and the API sit on different domains — a cookie would not survive that, a bearer
header will.

The old `middleware.js` was deleted. Next's Edge middleware ran before any
request reached the API, so it can no longer verify a session that now lives on
another server. The guard moved into `app/admin/layout.jsx`, which asks
`/api/admin/me` on mount and redirects to the login screen on a 401.

Roles are unchanged — `admin`, `editor`, `author` — and enforced in
`backend/middleware/auth.js` via `requireAuth("<section>")`.

---

## Backend layout

```
backend/
├── server.js                  express app, CORS, body limits, route mounting
├── config/db.js               pooled MongoDB client
├── lib/
│   ├── store.js               CRUD over MongoDB *or* JSON files
│   ├── auth.js                HMAC sessions, password hashing, role map
│   ├── content.js             merges markdown seeds with admin entries
│   ├── forms.js               [form slug] shortcodes, FAQ accordions
│   └── seo-tools.js           SEO scoring used by the post editor
├── middleware/                requireAuth, error handler
├── controllers/               auth, post, content, media, user, settings,
│                              submission, public
├── routes/                    adminRoutes.js, publicRoutes.js
├── content/                   seed markdown (blog + episodes)
└── data-store/                JSON fallback when MONGODB_URI is empty
```

**Storage is automatic.** Set `MONGODB_URI` and the API uses MongoDB; leave it
empty and it reads and writes the JSON files in `data-store/`. That makes local
development possible without a database, and `GET /api/health` reports which
mode is active.

**Episodes, pages, forms and plugins share one controller.** They are the same
CRUD shape, so `controllers/contentController.js` builds the handlers from a
per-collection field list. Only the listed fields are ever written, so unknown
keys in a request body cannot reach the database.

### API surface

Public — no auth:

```
GET  /api/health
GET  /api/public/posts              GET /api/public/posts/:slug
GET  /api/public/episodes           GET /api/public/episodes/:slug
GET  /api/public/pages/:slug        GET /api/public/forms/:slug
GET  /api/public/plugins            GET /api/public/settings
GET  /api/public/sitemap
GET  /api/media/:id
POST /api/submit
```

Authenticated — `/api/admin/*`:

```
POST   /login          POST /logout        GET /me
CRUD   /posts          POST /import-posts
CRUD   /episodes  /pages  /forms  /plugins
GET/POST/DELETE /media
GET/PUT/DELETE  /subs          GET /submissions   (legacy x-admin-key panel)
CRUD   /users          GET/PUT /settings
```

---

## Frontend layout

```
frontend/
├── app/            pages only — the api/ folder is gone
├── components/     unchanged UI, admin editors under wpadmin/
├── lib/
│   ├── api.js      the only place that knows the backend exists
│   ├── blog.js     same exports as before, now fetching
│   └── episodes.js same exports as before, now fetching
├── data/           static site data
└── public/         images, video, logos
```

`lib/blog.js` and `lib/episodes.js` kept their original function signatures
(`getAllPosts`, `getPost`, `getAllEpisodes`, `getEpisode`, `ytId`), so no page
file needed editing when the data source moved.

---

## Environment variables

**backend/.env**

| Variable | Purpose |
| --- | --- |
| `PORT` | API port, default 5000 |
| `MONGODB_URI` | Atlas string. Empty = JSON file mode |
| `MONGODB_DB` | database name, default `mom` |
| `ADMIN_USER` / `ADMIN_PASSWORD` | seeds the first admin when the DB is empty |
| `AUTH_SECRET` | signs session tokens — set a long random value |
| `ADMIN_PANEL_PASSWORD` | legacy `/panel` key |
| `CORS_ORIGINS` | comma-separated frontend origins |
| `COOKIE_SAMESITE` | set to `none` only for cross-domain cookie auth (needs HTTPS) |
| `RESEND_API_KEY`, `NOTIFY_EMAIL_TO`, `NOTIFY_EMAIL_FROM` | form notification emails |

**frontend/.env.local**

| Variable | Purpose |
| --- | --- |
| `BACKEND_URL` | where the API lives, e.g. `http://localhost:5000` |

Passwords with reserved characters must be percent-encoded inside `MONGODB_URI`
(`@` becomes `%40`).

---

## Deployment

The two apps deploy separately.

**Backend** — any Node host that runs a long-lived process (Render, Railway, a
VPS). Set the env vars from the table above, including `CORS_ORIGINS` pointing
at the deployed frontend. Note that JSON-file mode does not survive a restart on
these hosts, so production needs `MONGODB_URI`.

**Frontend** — Vercel or Netlify. Set `BACKEND_URL` to the deployed API. The
rewrite in `next.config.mjs` handles the rest; no code changes are needed
between local and production.

If you put both behind the same domain, nothing else is required. If they end up
on different domains, set `COOKIE_SAMESITE=none` on the backend — the bearer
token fallback then carries the session.

---

## Notes on what changed from the single-app version

- `app/api/` (25 route files) became `backend/routes` + `backend/controllers`.
- `middleware.js` was removed; the admin guard is now client-side.
- The `/admin → /admin/index.html` rewrite was dropped. It pointed at a file
  that does not exist; `app/admin/page.jsx` already serves that route.
- `gray-matter`, `marked` and `mongodb` moved out of the frontend's
  dependencies — only the backend parses markdown or talks to the database now.
