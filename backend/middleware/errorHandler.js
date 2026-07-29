// =====================================================================
//  404 + central error handler. Every controller wraps its body in
//  try/catch and calls next(err), so all failures land here in one
//  consistent JSON shape.
// =====================================================================

export function notFound(_req, res) {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const hint = process.env.MONGODB_URI ? "" : " (MONGODB_URI is not configured)";
  if (status >= 500) console.error("[api error]", err);
  res.status(status).json({ error: (err.message || "Server error") + hint });
}

/* Small helper so controllers can stay flat: asyncRoute(fn) */
export function asyncRoute(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
