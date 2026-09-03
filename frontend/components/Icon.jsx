// =====================================================================
//  ICON — one inline-SVG set for the whole app, replacing the emoji and
//  dingbat glyphs the UI used to render.
//
//  Emoji were a problem for three reasons: every OS draws them
//  differently (🖼 is flat grey on Windows, full colour on macOS), they
//  ignore CSS `color`, and screen readers announce them by name mid-
//  sentence. These are stroke-based SVGs that inherit `currentColor` and
//  scale with `font-size`, so existing `.ic` rules keep working.
//
//  Usage:  <Icon name="media" />            decorative (aria-hidden)
//          <Icon name="close" title="Close" />   announced to screen readers
// =====================================================================

const P = {
  /* --- admin sidebar --- */
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>,
  posts: <><path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4Z" /><path d="M13.5 6.5 17.5 10.5" /></>,
  episodes: <><circle cx="12" cy="12" r="9" /><path d="M10 8.5v7l6-3.5-6-3.5Z" /></>,
  media: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="m3.5 17 5-4.5 4 3.5 3-2.5 5 4" /></>,
  pages: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></>,
  forms: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 9v12" /></>,
  submissions: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6 8.5-6" /></>,
  users: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  plugins: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22M4.9 4.9l2.5 2.5M16.6 16.6l2.5 2.5M19.1 4.9l-2.5 2.5M7.4 16.6l-2.5 2.5" /></>,
  settings: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  logout: <><path d="M12 3v9" /><path d="M6.5 6.8a8 8 0 1 0 11 0" /></>,

  /* --- actions --- */
  external: <><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></>,
  upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></>,
  download: <><path d="M12 4v12" /><path d="m7 11 5 5 5-5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></>,
  view: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
  link: <><path d="M10 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.4 1.4" /><path d="M14 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.4-1.4" /></>,
  edit: <><path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4Z" /><path d="M13.5 6.5 17.5 10.5" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  check: <><path d="m4.5 12.5 5 5 10-11" /></>,
  cross: <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>,
  refresh: <><path d="M20 11a8 8 0 1 0-.7 4.3" /><path d="M20 4v7h-7" /></>,
  quote: <><path d="M9.5 6C6.9 7.4 5.5 9.7 5.5 13v5h6v-6H8.6c.1-1.9.9-3.3 2.5-4.2L9.5 6Z" /><path d="M18.5 6c-2.6 1.4-4 3.7-4 7v5h6v-6h-2.9c.1-1.9.9-3.3 2.5-4.2L18.5 6Z" /></>,
  chevronDown: <><path d="m6 9.5 6 6 6-6" /></>,
  chevronRight: <><path d="m9.5 6 6 6-6 6" /></>,
  play: <><path d="M7 5.5v13l11-6.5-11-6.5Z" /></>,
  import: <><path d="M12 4v12" /><path d="m7 11 5 5 5-5" /><path d="M4 20h16" /></>,
};

export default function Icon({ name, title, size = "1em", className = "", strokeWidth = 1.7, ...rest }) {
  const d = P[name];
  if (!d) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={name === "play" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : "true"}
      focusable="false"
      style={{ flex: "none", display: "inline-block", verticalAlign: "-0.14em" }}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {d}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(P);
