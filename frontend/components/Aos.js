"use client";
// Lightweight AOS (animate-on-scroll). Add data-aos="fade-up-right" (etc.)
// to any element; optional data-aos-delay="150" (ms). CSS lives in globals.css.
// Variants: fade-up, fade-down, fade-up-right, fade-up-left,
//           fade-down-right, fade-down-left, zoom-in
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Aos() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-aos]"));
    if (!els.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      els.forEach((el) => el.setAttribute("data-aos-in", ""));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const delay = parseInt(el.dataset.aosDelay || "0", 10);
          if (delay) el.style.transitionDelay = delay + "ms";
          // attribute (not class): React re-renders rewrite className and would
          // wipe an externally-added class, hiding the element again (FAQ bug)
          el.setAttribute("data-aos-in", "");
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => {
      // already revealed on a previous visit of this page instance
      if (!el.hasAttribute("data-aos-in")) io.observe(el);
    });

    return () => io.disconnect();
  }, [pathname]);

  return null;
}
