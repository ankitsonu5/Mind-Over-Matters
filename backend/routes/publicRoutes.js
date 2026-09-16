// =====================================================================
//  Everything that needs no login: the website's own content, the media
//  files, and the form-submit endpoint.
// =====================================================================
import { Router } from "express";
import { asyncRoute as h } from "../middleware/errorHandler.js";
import * as pub from "../controllers/publicController.js";
import * as media from "../controllers/mediaController.js";
import * as subs from "../controllers/submissionController.js";

const router = Router();

/* -------- site content, read by the Next.js server components -------- */
router.get("/public/posts", h(pub.posts));
router.get("/public/posts/:slug", h(pub.post));
router.get("/public/episodes", h(pub.episodes));
router.get("/public/episodes/:slug", h(pub.episode));
router.get("/public/pages/:slug", h(pub.page));
router.get("/public/forms/:slug", h(pub.form));
router.get("/public/plugins", h(pub.plugins));
router.get("/public/settings", h(pub.settings));
router.get("/public/sitemap", h(pub.sitemap));

/* -------- media bytes: SEO filename plus legacy ID compatibility -------- */
router.get("/media/:filename", h(media.serve));

/* -------- every form on the site posts here -------- */
router.post("/submit", h(subs.submit));

export default router;
