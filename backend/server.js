// =====================================================================
//  Mind Over Matter - API server
//  Runs completely independently of the frontend. Start it with:
//      npm run dev     (auto-restart)  or  npm start
//  Default port 5000, override with PORT in .env
// =====================================================================
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import adminRoutes from "./routes/adminRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { hasMongo } from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------------------------------------------------------------------
   CORS. The frontend usually proxies /api through Next, in which case
   the browser sees one origin and this never matters. It does matter
   when the frontend calls the API directly from another domain, so the
   allowed origins are configurable and credentials are permitted.
--------------------------------------------------------------------- */
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // no Origin header = same-origin, curl, or a server-side fetch
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      cb(new Error("Blocked by CORS: " + origin));
    },
    credentials: true,
  })
);

/* Media uploads travel as base64 JSON, so the default 100kb limit is
   far too small - 10mb comfortably covers the 4MB file cap. */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

/* ------------------------------- routes ---------------------------------- */
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    storage: hasMongo() ? "mongodb" : "json-files",
    time: new Date().toISOString(),
  });
});

app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n  Mind Over Matter API`);
  console.log(`  ▸ http://localhost:${PORT}`);
  console.log(`  ▸ storage: ${hasMongo() ? "MongoDB" : "local JSON files (data-store/)"}`);
  console.log(`  ▸ cors:    ${allowedOrigins.join(", ")}\n`);
});
