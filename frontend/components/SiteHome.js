"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { bodyHtml, scripts } from "./siteContent";
import HeroLogoReveal from "./HeroLogoReveal";
import HeroVideoScrub from "./HeroVideoScrub";
import { episodesDeck, heroVideo } from "@/data/content";
import { ytId } from "@/data/episodes";

export default function SiteHome({ articles = [], ig = {} }) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return; // run once
    ranRef.current = true;

    // expose the libraries the original scripts expect as globals
    window.THREE = THREE;
    window.gsap = gsap;
    window.ScrollTrigger = ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    // expose editable content to the original scripts
    window.__MOM__ = { episodesDeck, ig, articles };

    // set the hero video from data
    const id = ytId(heroVideo);
    const hero = document.getElementById("mom-hero-video");
    if (hero && id) {
      hero.setAttribute(
        "src",
        `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3`
      );
    }

    // execute the original site scripts, in order, in global scope
    const added = [];
    scripts.forEach((code) => {
      const el = document.createElement("script");
      el.type = "text/javascript";
      el.text = code;
      document.body.appendChild(el);
      added.push(el);
    });

    // nudge layout-dependent ScrollTriggers after everything is in place.
    // Multiple passes because each scroll-jacked section sets its own height
    // as it initialises, which shifts the sections below it.
    const timers = [300, 800, 1600, 2600].map((ms) =>
      setTimeout(() => ScrollTrigger.refresh(), ms)
    );
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("load", onLoad);
      added.forEach((el) => el.remove());
    };
  }, []);

  // ---- hero card -> click to zoom into a fullscreen player (sound + controls) ----
  // Kept in its own effect with full, symmetric cleanup so a remount can never
  // leave a stale handler that locks page scroll (overflow:hidden).
  useEffect(() => {
    const card = document.querySelector("[data-vcard]");
    if (!card) return;
    const heroIframe = document.getElementById("mom-hero-video");

    // transparent click-catcher over the iframe: keeps the whole card clickable
    // AND stops the YouTube embed from ever showing its own play/skip controls
    const vvideo = card.querySelector(".vvideo");
    let catcher = null;
    if (vvideo && !vvideo.querySelector(".vclick")) {
      catcher = document.createElement("div");
      catcher.className = "vclick";
      vvideo.appendChild(catcher);
    }

    // fullscreen lightbox
    const lb = document.createElement("div");
    lb.className = "hero-lb";
    lb.setAttribute("aria-hidden", "true");
    lb.innerHTML =
      '<div class="hero-lb-stage">' +
      '<button class="hero-lb-x" aria-label="Close">&#10005;</button>' +
      '<div class="hero-lb-frame"><iframe title="Mind Over Matter" ' +
      'allow="autoplay; encrypted-media; picture-in-picture; fullscreen" ' +
      "allowfullscreen></iframe></div></div>";
    document.body.appendChild(lb);

    const frame = lb.querySelector("iframe");
    const stage = lb.querySelector(".hero-lb-stage");
    const closeBtn = lb.querySelector(".hero-lb-x");

    const videoId = () => {
      const src = heroIframe ? heroIframe.getAttribute("src") || "" : "";
      const m = src.match(/embed\/([^?&]+)/);
      return m ? m[1] : "5tMYeJNbeOI";
    };

    const open = () => {
      // controls + sound (NOT muted) -> only enabled here, in the fullscreen view
      frame.src =
        "https://www.youtube-nocookie.com/embed/" + videoId() +
        "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
      if (window.gsap) {
        const c = card.getBoundingClientRect();
        const s = stage.getBoundingClientRect();
        const scaleStart = Math.max(0.05, c.width / s.width);
        const dx = (c.left + c.width / 2) - (s.left + s.width / 2);
        const dy = (c.top + c.height / 2) - (s.top + s.height / 2);
        window.gsap.fromTo(
          stage,
          { x: dx, y: dy, scale: scaleStart, opacity: 0 },
          { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.55, ease: "power3.out" }
        );
      }
    };
    const finishClose = () => {
      lb.classList.remove("open");
      frame.src = "";
      document.body.style.overflow = "";
      if (window.gsap) window.gsap.set(stage, { clearProps: "all" });
    };
    const close = () => {
      if (window.gsap) {
        const c = card.getBoundingClientRect();
        const s = stage.getBoundingClientRect();
        const scaleEnd = Math.max(0.05, c.width / s.width);
        const dx = (c.left + c.width / 2) - (s.left + s.width / 2);
        const dy = (c.top + c.height / 2) - (s.top + s.height / 2);
        window.gsap.to(stage, {
          x: dx, y: dy, scale: scaleEnd, opacity: 0,
          duration: 0.4, ease: "power2.in", onComplete: finishClose,
        });
      } else {
        finishClose();
      }
    };
    const onCardClick = () => open();
    const onCloseClick = (e) => { e.stopPropagation(); close(); };
    const onBackdrop = (e) => { if (e.target === lb || e.target === stage) close(); };
    const onKey = (e) => { if (e.key === "Escape") close(); };

    card.style.cursor = "pointer";
    card.addEventListener("click", onCardClick);
    closeBtn.addEventListener("click", onCloseClick);
    lb.addEventListener("click", onBackdrop);
    document.addEventListener("keydown", onKey);

    return () => {
      card.removeEventListener("click", onCardClick);
      document.removeEventListener("keydown", onKey);
      if (catcher && catcher.parentNode) catcher.parentNode.removeChild(catcher);
      lb.remove();
      document.body.style.overflow = ""; // never leave scroll locked
    };
  }, []);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <HeroLogoReveal />
      <HeroVideoScrub />
    </>
  );
}
