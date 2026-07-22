// Client-safe helper only. Episode CONTENT now lives in content/episodes/*.md
// (managed by the CMS) and is read via lib/episodes.js on the server.

export function ytId(url = "") {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : "";
}
