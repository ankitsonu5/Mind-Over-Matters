export function mediaUrl(value) {
  if (!value || typeof value !== "string") return "";

  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("data:") || v.startsWith("blob:")) {
    return v;
  }
  if (v.startsWith("/media/")) return `/api${v}`;
  if (v.startsWith("/")) return v;
  if (v.startsWith("media/")) return `/api/${v}`;
  if (v.startsWith("images/") || v.startsWith("video/")) return `/${v}`;
  if (v.startsWith("./") || v.startsWith("../")) return `/${v.replace(/^\.\.?\//, "")}`;
  return `/${v}`;
}