"use client";
// "Morph: Dots To Text" logo reveal for the home hero.
// Phase 1: glowing dots cluster + bob  ->  Phase 2: dots spread into a line
// Phase 3: letters morph in left-to-right  ->  Phase 4: the mic pops OUT of
// the O in OVER (ring burst + float). Injects itself under the hero Scroll
// indicator (.hero-stage). CSS lives in globals.css under "MOM LOGO REVEAL".
import { useEffect } from "react";

const WORDS = ["MIND", "OVER", "MATTER"];
// const MIC_SRC = "/images/o-mic.png";

export default function HeroLogoReveal() {
  useEffect(() => {
    const stage = document.querySelector("#hero .hero-stage");
    if (!stage || stage.querySelector(".mom-reveal-word")) return;

    // ---- build markup: <h1> after the scroll indicator ----
    const h1 = document.createElement("h1");
    h1.className = "mom-reveal-word";
    h1.setAttribute("aria-label", "Mind Over Matter");
    WORDS.forEach((word) => {
      const w = document.createElement("span");
      w.className = "mom-rw";
      [...word].forEach((chr) => {
        // const l = document.createElement("span");
        // l.className = "mom-rl";
        const l = document.createElement("span");
l.className = "mom-rl";

l.innerHTML =
  '<span class="dot" aria-hidden="true"></span>' +
  '<span class="ch">' + chr + '</span>';
        // const isMicO = word === "OVER" && chr === "O";
        // if (isMicO) l.classList.add("mom-ro");
        l.innerHTML =
  '<span class="dot" aria-hidden="true"></span><span class="ch">' + chr + "</span>";
        // l.innerHTML =
        //   '<span class="dot" aria-hidden="true"></span><span class="ch">' + chr + "</span>" +
        //   (isMicO
        //     ? '<span class="ring" aria-hidden="true"></span><img class="mic" src="' + MIC_SRC + '" alt="" aria-hidden="true">'
        //     : "");
        w.appendChild(l);
      });
      h1.appendChild(w);
    });
    const scrollEl = stage.querySelector(".hero-scroll");

    // ---- EPK cover text (MOM EPK V2.0, page 1) around the title ----
    const eyebrow = document.createElement("span");
    eyebrow.className = "mom-hero-eyebrow";
    eyebrow.textContent = "Ashwin Gane";

    const tag = document.createElement("span");
    tag.className = "mom-hero-tag";
    tag.textContent = "See Past The Surface";

    const sub = document.createElement("p");
    sub.className = "mom-hero-sub";
    sub.innerHTML =
      "A premium culture, power, and perception podcast platform";

    const frag = document.createDocumentFragment();
    frag.appendChild(eyebrow);
    frag.appendChild(h1);
    frag.appendChild(tag);
    frag.appendChild(sub);

    if (scrollEl) stage.insertBefore(frag, scrollEl);  // SCROLL goes below the text
    else stage.appendChild(frag);
    // NOTE: letters are solid champagne gold (CSS color). We deliberately do
    // NOT use background-clip:text gradients here — Chrome renders clipped
    // text unreliably while opacity/transform transitions run, which showed
    // up as blurry "ghost" letters during the reveal on the live site.

    const letters = Array.from(h1.querySelectorAll(".mom-rl"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));

    // pull every letter toward the centre so the dots read as one cluster
    function setClusterOffsets() {
      const box = h1.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      letters.forEach((l, i) => {
        const r = l.getBoundingClientRect();
        const off = cx - (r.left + r.width / 2);
        const jit = ((i % 5) - 2) * (r.width * 0.35); // organic, not a single point
        l.style.setProperty("--cx", off + jit + "px");
        l.style.setProperty("--bd", (i % 4) * 0.14 + "s");
      });
    }

    function finishInstant() {
      timers.forEach(clearTimeout);
      timers = [];
      h1.classList.remove("phase-cluster", "fade-out");
      // h1.classList.add("phase-line", "mic-out");
      h1.classList.add("phase-line");
      letters.forEach((l) => {
        l.classList.add("on");
        l.style.removeProperty("--cx");
      });
    }

    const HOLD = 4200;  // how long the finished logo stays before replaying
    const FADE = 650;   // fade-out duration between cycles

    function reset() {
      timers.forEach(clearTimeout);
      timers = [];
      // h1.classList.remove("phase-cluster", "phase-line", "mic-out");
      h1.classList.remove("phase-cluster", "phase-line");
      letters.forEach((l) => l.classList.remove("on"));
      setClusterOffsets();
      void h1.offsetWidth; // reflow so transitions restart cleanly
      h1.classList.remove("fade-out");
    }

    function play() {
      if (reduce) return finishInstant(); // no loop for reduced motion
      reset();
      at(60, () => h1.classList.add("phase-cluster"));   // dots bob in a cluster
      at(1500, () => h1.classList.add("phase-line"));    // dots spread into a line
      letters.forEach((l, i) => at(2450 + i * 95, () => l.classList.add("on"))); // morph L->R
      const done = 2450 + letters.length * 95 + 450;
      at(done, () => {
        // watchdog: even if per-letter timers were throttled (background tab),
        // force every letter to its final sharp state before the mic pops
        letters.forEach((l) => l.classList.add("on"));
        // h1.classList.add("phase-line", "mic-out");
        h1.classList.add("phase-line");
      });
      // hold the finished logo, fade, then run the whole reveal again
      at(done + HOLD, () => h1.classList.add("fade-out"));
      at(done + HOLD + FADE, play);
    }

    const onResize = () => {
      if (!h1.classList.contains("phase-line")) setClusterOffsets();
    };
    window.addEventListener("resize", onResize);

    // Background tabs throttle/pause setTimeout, which can freeze the morph
    // mid-way (blurry letters + dots). So: when the tab hides, snap to the
    // finished logo; when it becomes visible again, replay from the top.
    const onVisibility = () => {
      if (document.hidden) finishInstant();
      else if (!reduce) play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // fonts ready first so letter positions are final, then start.
    // If the page loaded in a background tab, show the finished logo and
    // let the visibility handler replay it once the tab is focused.
    const start = () =>
      requestAnimationFrame(() => (document.hidden ? finishInstant() : play()));
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start);
    } else {
      at(150, start);
    }

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      h1.remove();
      eyebrow.remove(); tag.remove(); sub.remove();
    };
  }, []);

  return null;
}
