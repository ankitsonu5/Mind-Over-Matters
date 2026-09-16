// =====================================================================
//  MEDIA - files are stored as base64 inside the database, which keeps
//  the API stateless (no disk to persist on a serverless host). The 4MB
//  cap exists because base64 inflates the payload by roughly a third and
//  MongoDB documents are limited to 16MB.
// =====================================================================
import { getAll, insert, remove } from "../lib/store.js";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function createSlug(filename) {
  return String(filename)
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "image";
}

function getExtension(filename) {
  const extension = String(filename).split(".").pop();
  return extension && extension !== filename ? `.${extension.toLowerCase()}` : "";
}

function getPublicFilename(item) {
  const slug = item.slug || createSlug(item.filename);
  const extension = item.extension || getExtension(item.filename);
  return `${slug}${extension}`;
}

/* GET /api/admin/media - metadata only, never the base64 payloads */
export async function list(_req, res) {
  const media = await getAll("media");
  res.json(
    media
      .map(({ data, ...item }) => ({
        ...item,
        alt: item.alt || item.filename.replace(/\.[^/.]+$/, ""),
        url: `/media/${getPublicFilename(item)}`,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  );
}

/* POST /api/admin/media body: { filename, mime, data(base64), alt, title } */
export async function create(req, res) {
  const { filename, mime, data, alt, title } = req.body || {};
  if (!filename || !mime || !data) {
    return res.status(400).json({ error: "filename, mime, data required" });
  }
  if (!ALLOWED_TYPES.includes(mime)) {
    return res.status(400).json({ error: "Only image files allowed" });
  }
  const bytes = Math.ceil((data.length * 3) / 4);
  if (bytes > MAX_BYTES) {
    return res.status(400).json({
      error: "Image size must be below 4MB",
    });
  }
  const safeFilename = String(filename).slice(0, 200);
  const baseSlug = createSlug(safeFilename);
  const slug = `${baseSlug}-${Date.now()}`;
  const extension = getExtension(safeFilename);
  const item = await insert("media", {
    filename: safeFilename,
    slug,
    extension,
    mime: String(mime).slice(0, 100),
    size: bytes,
    alt: alt || baseSlug.replace(/-/g, " "),
    title: title || baseSlug.replace(/-/g, " "),
    data,
  });
  const { data: _payload, ...meta } = item;
  res.status(201).json({ ...meta, url: `/media/${slug}${extension}` });
}

/* DELETE /api/admin/media/:id */
export async function removeOne(req, res) {
  await remove("media", req.params.id);
  res.json({ ok: true });
}

/* GET /api/media/:filename - public, serves SEO-friendly filenames */
export async function serve(req, res) {
  const filename = req.params.filename;
  const media = await getAll("media");
  const item = media.find((m) => getPublicFilename(m) === filename);
  if (!item?.data) return res.status(404).send("Not found");
  const buf = Buffer.from(item.data, "base64");
  res.set({
    "Content-Type": item.mime || "application/octet-stream",
    "Content-Length": String(buf.length),
    "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
  });
  res.send(buf);
}
