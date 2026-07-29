"use client";
// Makes every admin-built form on the page work (fetch POST to /api/submit).
import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { apiFetch } from "@/lib/api";
export default function FormRuntime() {
  const pathname = usePathname();
  useEffect(() => {
    const forms = document.querySelectorAll("form[data-mom-form]:not([data-wired])");
    forms.forEach((form) => {
      form.dataset.wired = "1";
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const status = form.querySelector(".mom-form-status");
        const btn = form.querySelector('[type="submit"]');
        const data = { "form-name": form.dataset.momForm };
        new FormData(form).forEach((v, k) => (data[k] = v));
        if (btn) btn.disabled = true;
        if (status) { status.textContent = "Sending…"; status.style.color = "#9fb1d1"; }
        try {
          const res = await apiFetch("/api/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error("Failed");
          form.reset();
          if (status) { status.textContent = form.dataset.success || "Sent!"; status.style.color = "#7ee2a8"; }
        } catch {
          if (status) { status.textContent = "Something went wrong — try again."; status.style.color = "#ff8b8b"; }
        } finally {
          if (btn) btn.disabled = false;
        }
      });
    });
  }, [pathname]);
  return null;
}
