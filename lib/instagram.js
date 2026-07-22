// Reads the Instagram "Feed" section from content/instagram.json
// (managed by the CMS at /admin). Server-only.
import fs from "fs";
import path from "path";

export function getInstagram() {
  const file = path.join(process.cwd(), "content/instagram.json");
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { eyebrow: "", titleMain: "", titleAccent: "", handleText: "", handleUrl: "", items: [] };
  }
}
