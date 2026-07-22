"use client";
import { useEffect, useRef } from "react";

// "Universe in motion" layer for the cosmic background.
// Three depth tiers of dark-blue dust drift OUTWARD from the centre (parallax):
//  - far  : tiny, slow, faint        (deep background)
//  - mid  : medium                   (body of the field)
//  - near : larger, faster, with a   (foreground — gives the warp/fly feel)
//           short motion streak
// A few fixed stars twinkle softly for life. Additive glow keeps it gentle.
const PALETTE = [
  [40, 78, 150],
  [60, 112, 210],
  [100, 168, 242],
  [150, 214, 248],
];

export default function CosmicParticles() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w, h, dpr, raf, ox, oy, maxR;
    let drift = [], stars = [], t = 0;

    // depth tiers: [speedMul, sizeMul, alphaMul, streak]
    const TIERS = [
      [0.45, 0.7, 0.55, false], // far
      [0.9, 1.0, 0.8, false],   // mid
      [1.7, 1.5, 1.0, true],    // near (streaks)
    ];

    function spawnDrift(tier, seed) {
      const [sp, sz, al] = TIERS[tier];
      const col = PALETTE[(Math.random() * PALETTE.length) | 0];
      return {
        tier,
        ang: Math.random() * Math.PI * 2,
        r: seed ? Math.random() * maxR : Math.random() * 18,
        vr: (0.22 + Math.random() * 0.7) * sp,
        size: (0.7 + Math.random() * 1.8) * sz,
        sway: (Math.random() - 0.5) * 0.6,
        phase: Math.random() * Math.PI * 2,
        col,
        maxAlpha: (0.16 + Math.random() * 0.32) * al,
        prevX: 0,
        prevY: 0,
      };
    }

    function spawnStar() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        size: 0.5 + Math.random() * 1.3,
        base: 0.12 + Math.random() * 0.3,
        tw: 0.4 + Math.random() * 1.6,      // twinkle speed
        off: Math.random() * Math.PI * 2,
        col: PALETTE[2 + ((Math.random() * 2) | 0)],
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ox = w / 2; oy = h / 2;
      maxR = Math.hypot(w, h) / 2 * 1.08;
      const base = Math.floor((w * h) / 16000);
      const counts = [
        Math.max(40, Math.min(120, base)),       // far
        Math.max(28, Math.min(80, base * 0.6)),  // mid
        Math.max(14, Math.min(46, base * 0.32)), // near
      ];
      drift = [];
      counts.forEach((n, tier) => {
        for (let i = 0; i < n; i++) drift.push(spawnDrift(tier, true));
      });
      stars = Array.from(
        { length: Math.max(18, Math.min(54, Math.floor(base * 0.4))) },
        spawnStar
      );
    }

    function dot(x, y, rad, col, a) {
      const [r, g, b] = col;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, rad * 3);
      grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, rad * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    function draw() {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // twinkling fixed stars
      for (const s of stars) {
        const a = s.base * (0.55 + 0.45 * Math.sin(t * s.tw + s.off));
        if (a > 0.02) dot(s.x, s.y, s.size, s.col, a);
      }

      // outward drifting depth field
      for (const p of drift) {
        if (!reduce) {
          p.r += p.vr * (0.4 + p.r / maxR);  // accelerate outward
          p.phase += 0.012;
        }
        const prog = p.r / maxR;
        if (prog >= 1) { Object.assign(p, spawnDrift(p.tier, false)); continue; }

        const x = ox + Math.cos(p.ang) * p.r + Math.sin(p.phase) * 10 * p.sway;
        const y = oy + Math.sin(p.ang) * p.r;
        const scale = 0.5 + prog * 1.7;
        let a = p.maxAlpha;
        if (prog < 0.12) a *= prog / 0.12;
        if (prog > 0.82) a *= Math.max(0, (1 - prog) / 0.18);
        a = Math.max(0, a);

        // subtle warp streak for the near tier
        if (TIERS[p.tier][3] && p.prevX && prog > 0.18) {
          const [r, g, b] = p.col;
          ctx.strokeStyle = `rgba(${r},${g},${b},${a * 0.5})`;
          ctx.lineWidth = p.size * scale * 1.1;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p.prevX, p.prevY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        dot(x, y, p.size * scale, p.col, a);
        p.prevX = x; p.prevY = y;
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    }

    resize(); draw();
    addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas ref={ref} aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
  );
}
