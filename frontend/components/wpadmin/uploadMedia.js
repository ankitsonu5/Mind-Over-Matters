"use client";
import { apiFetch } from "@/lib/api";
// Shared client helper — uploads a File to the Media Library, returns its URL.
export async function uploadMedia(file) {
  if (file.size > 4 * 1024 * 1024) throw new Error("File exceeds 4MB — choose a smaller image.");
  const base64 = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = () => reject(new Error("Could not read the file."));
    r.readAsDataURL(file);
  });
  const res = await apiFetch("/api/admin/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, mime: file.type || "image/jpeg", data: base64 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url; // /media/<seo-friendly-file-name>
}
