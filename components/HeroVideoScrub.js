"use client";
import { useEffect } from "react";

// Pins the hero and scrubs its background <video> with scroll, using the SAME
// GSAP ScrollTrigger system the Episodes/Listen sections use — so the pins
// chain correctly instead of overlapping. While pinned, the page does not
// advance; scroll drives the video start->finish; when the clip ends the pin
// releases and the next section scrolls up.
export default function HeroVideoScrub() {
  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    let tries = 0;
    const wait = setInterval(() => {
      if (cancelled) { clearInterval(wait); return; }
      tries += 1;
      const gsap = window.gsap;
      const ST = window.ScrollTrigger;
      const hero = document.getElementById("hero");
      const video = document.querySelector(".hero-bg-video");
      if ((gsap && ST && hero && video) || tries > 80) {
        clearInterval(wait);
        if (gsap && ST && hero && video) cleanup = setup(gsap, ST, hero, video);
      }
    }, 80);

    function setup(gsap, ST, hero, video) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // own the playhead — no autoplay/loop, scroll is the clock
      video.removeAttribute("autoplay");
      video.removeAttribute("loop");
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      try { video.pause(); } catch (e) {}

      let trigger = null;
      let target = 0;     // seconds the scroll wants
      let shown = 0;      // seconds currently displayed
      let raf = 0;
      let seeking = false;

      const dur = () => {
        const d = video.duration;
        return Number.isFinite(d) && d > 0 ? d : 0;
      };

      // step toward target one seek at a time (wait for 'seeked' to chain)
      const tick = () => {
        if (cancelled) return;
        const d = dur();
        if (d <= 0) return;
        const diff = target - shown;
        if (Math.abs(diff) < 0.015) return;     // close enough; idle
        if (seeking) return;
        shown += diff * 0.3;
        seeking = true;
        try { video.currentTime = Math.max(0, Math.min(d, shown)); }
        catch (e) { seeking = false; }
      };
      const onSeeked = () => {
        seeking = false;
        if (!cancelled) raf = requestAnimationFrame(tick);
      };
      video.addEventListener("seeked", onSeeked);

      const makeTrigger = () => {
        const d = dur();
        if (d <= 0) return;
        if (trigger) { trigger.kill(); trigger = null; }
        // runway length scales with clip length: ~120vh of scroll per second,
        // so a 14s clip pins for a long, deliberate scrub.
        const px = Math.round(window.innerHeight * d * 0.6);
        trigger = ST.create({
          trigger: hero,
          start: "top top",
          end: "+=" + px,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: true,
          invalidateOnRefresh: true,
          refreshPriority: 20,           // resolve hero pin before lower sections
          onUpdate: (self) => {
            target = self.progress * d;
            if (!seeking) { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
          },
          onRefresh: (self) => {
            target = self.progress * d;
          },
        });
        ST.refresh();
      };

      if (reduce) {
        // no scrubbing for reduced-motion: show a static first frame, no pin
        const showFirst = () => { try { video.currentTime = 0.05; } catch (e) {} };
        if (dur() > 0) showFirst();
        else video.addEventListener("loadedmetadata", showFirst, { once: true });
        return () => { video.removeEventListener("seeked", onSeeked); };
      }

      // prime the decoder so currentTime seeks actually paint frames
      const init = () => {
        const p = video.play();
        const after = () => { try { video.pause(); } catch (e) {} makeTrigger(); };
        if (p && p.then) p.then(after).catch(() => makeTrigger());
        else after();
      };

      if (dur() > 0) init();
      else video.addEventListener("loadedmetadata", init, { once: true });

      const onResize = () => makeTrigger();
      window.addEventListener("resize", onResize);
      window.addEventListener("load", () => ST.refresh());

      return () => {
        cancelAnimationFrame(raf);
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("loadedmetadata", init);
        window.removeEventListener("resize", onResize);
        if (trigger) trigger.kill();
      };
    }

    return () => { cancelled = true; clearInterval(wait); cleanup(); };
  }, []);

  return null;
}
