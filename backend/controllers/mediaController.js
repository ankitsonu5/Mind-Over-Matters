// =====================================================================
//  MEDIA - files are stored as base64 inside the database, which keeps
//  the API stateless (no disk to persist on a serverless host). The 4MB
//  cap exists because base64 inflates the payload by roughly a third and
//  MongoDB documents are limited to 16MB.
// =====================================================================
import { getAll, getById, insert, remove } from "../lib/store.js";

const MAX_BYTES = 4 * 1024 * 1024;

/* GET /api/admin/media - metadata only, never the base64 payloads */
export async function list(_req, res) {
  const media = await getAll("media");
  res.json(
    media
      .map(({ data, ...m }) => ({ ...m, url: `/api/media/${m.id}` }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  );
}

/* POST /api/admin/media  body: { filename, mime, data(base64) } */
export async function create(req, res) {
  const { filename, mime, data } = req.body || {};
  if (!filename || !mime || !data) {
    return res.status(400).json({ error: "filename, mime, data required" });
  }
  const bytes = Math.ceil((data.length * 3) / 4);
  if (bytes > MAX_BYTES) {
    return res.status(400).json({
      error: "File exceeds 4MB - use a smaller image or an external URL.",
    });
  }
  const item = await insert("media", {
    filename: String(filename).slice(0, 200),
    mime: String(mime).slice(0, 100),
    size: bytes,
    data,
  });
  const { data: _payload, ...meta } = item;
  res.status(201).json({ ...meta, url: `/api/media/${item.id}` });
}

/* DELETE /api/admin/media/:id */
export async function removeOne(req, res) {
  await remove("media", req.params.id);
  res.json({ ok: true });
}

/* GET /api/media/:id - public, serves the actual bytes */
export async function serve(req, res) {
  const item = await getById("media", req.params.id);
  if (!item?.data) return res.status(404).send("Not found");
  const buf = Buffer.from(item.data, "base64");
  res.set({
    "Content-Type": item.mime || "application/octet-stream",
    "Content-Length": String(buf.length),
    "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
  });
  res.send(buf);
}
