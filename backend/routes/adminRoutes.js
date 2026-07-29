// =====================================================================
//  /api/admin/*  - everything behind a login.
//  The second argument to requireAuth() is the permission section, so
//  role rules stay visible right next to the route they protect.
// =====================================================================
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncRoute as h } from "../middleware/errorHandler.js";

import * as auth from "../controllers/authController.js";
import * as posts from "../controllers/postController.js";
import { episodes, pages, forms, plugins } from "../controllers/contentController.js";
import * as media from "../controllers/mediaController.js";
import * as users from "../controllers/userController.js";
import * as settings from "../controllers/settingsController.js";
import * as subs from "../controllers/submissionController.js";

const router = Router();

/* ------------------------------- session ---------------------------------- */
router.post("/login", h(auth.login));
router.post("/logout", h(auth.logout));
router.get("/me", requireAuth(), h(auth.me));

/* -------------------------------- posts ----------------------------------- */
router.get("/posts", requireAuth("posts"), h(posts.list));
router.post("/posts", requireAuth("posts"), h(posts.create));
router.get("/posts/:id", requireAuth("posts"), h(posts.getOne));
router.put("/posts/:id", requireAuth("posts"), h(posts.updateOne));
router.delete("/posts/:id", requireAuth("posts"), h(posts.removeOne));
router.post("/import-posts", requireAuth("posts"), h(posts.importMarkdownPosts));

/* ------------------------------- episodes --------------------------------- */
router.get("/episodes", requireAuth("episodes"), h(episodes.list));
router.post("/episodes", requireAuth("episodes"), h(episodes.create));
router.get("/episodes/:id", requireAuth("episodes"), h(episodes.getOne));
router.put("/episodes/:id", requireAuth("episodes"), h(episodes.updateOne));
router.delete("/episodes/:id", requireAuth("episodes"), h(episodes.removeOne));

/* --------------------------------- pages ---------------------------------- */
router.get("/pages", requireAuth("pages"), h(pages.list));
router.post("/pages", requireAuth("pages"), h(pages.create));
router.get("/pages/:id", requireAuth("pages"), h(pages.getOne));
router.put("/pages/:id", requireAuth("pages"), h(pages.updateOne));
router.delete("/pages/:id", requireAuth("pages"), h(pages.removeOne));

/* --------------------------------- forms ---------------------------------- */
router.get("/forms", requireAuth("forms"), h(forms.list));
router.post("/forms", requireAuth("forms"), h(forms.create));
router.get("/forms/:id", requireAuth("forms"), h(forms.getOne));
router.put("/forms/:id", requireAuth("forms"), h(forms.updateOne));
router.delete("/forms/:id", requireAuth("forms"), h(forms.removeOne));

/* -------------------------------- plugins --------------------------------- */
router.get("/plugins", requireAuth("plugins"), h(plugins.list));
router.post("/plugins", requireAuth("plugins"), h(plugins.create));
router.get("/plugins/:id", requireAuth("plugins"), h(plugins.getOne));
router.put("/plugins/:id", requireAuth("plugins"), h(plugins.updateOne));
router.delete("/plugins/:id", requireAuth("plugins"), h(plugins.removeOne));

/* --------------------------------- media ---------------------------------- */
router.get("/media", requireAuth("media"), h(media.list));
router.post("/media", requireAuth("media"), h(media.create));
router.delete("/media/:id", requireAuth("media"), h(media.removeOne));

/* ------------------------------ submissions ------------------------------- */
router.get("/subs", requireAuth("submissions"), h(subs.list));
router.put("/subs/:id", requireAuth("submissions"), h(subs.markRead));
router.delete("/subs/:id", requireAuth("submissions"), h(subs.removeOne));
// legacy: has its own auth (session OR x-admin-key), so no requireAuth here
router.get("/submissions", h(subs.legacyPanel));

/* --------------------------------- users ---------------------------------- */
router.get("/users", requireAuth(), h(users.list));
router.post("/users", requireAuth("users"), h(users.create));
router.put("/users/:id", requireAuth(), h(users.updateOne)); // self-edit allowed
router.delete("/users/:id", requireAuth("users"), h(users.removeOne));

/* -------------------------------- settings -------------------------------- */
router.get("/settings", requireAuth(), h(settings.get));
router.put("/settings", requireAuth("settings"), h(settings.put));

export default router;
