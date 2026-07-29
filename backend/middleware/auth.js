// =====================================================================
//  Route guards. `requireAuth()` only checks that somebody is logged in;
//  `requireAuth("posts")` also checks that their role may touch that
//  section (see canAccess in lib/auth.js).
//  On success the session is attached as req.user = { id, role }.
// =====================================================================
import { canAccess, sessionFromRequest } from "../lib/auth.js";

export function requireAuth(section) {
  return (req, res, next) => {
    const session = sessionFromRequest(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });
    if (section && !canAccess(session.role, section)) {
      return res.status(403).json({ error: `Permission denied (role: ${session.role})` });
    }
    req.user = session;
    next();
  };
}

/* Optional: attaches req.user when present, never blocks. */
export function attachUser(req, _res, next) {
  req.user = sessionFromRequest(req) || null;
  next();
}
