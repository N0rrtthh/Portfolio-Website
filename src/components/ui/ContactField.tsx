"use client";

/**
 * Contact signal field — dot lattice with interactive ripples.
 *
 * WHY CANVAS 2D, AFTER TWO OTHER ATTEMPTS
 * ---------------------------------------
 * v1 was 576 tweened divs: it worked, but it was the most expensive
 * decoration on the page.
 * v2 was a WebGL fragment shader: one draw call, and invisible in practice.
 * Additively blended, premultiplied output over a near-black section left the
 * lattice at a few percent luminance on screen, and raising the constants
 * twice didn't fix it — the failure was that the technique put four separate
 * things (shader compile, additive blend factors, premultiplied alpha, and
 * device-pixel mapping) between "I set a colour" and "a pixel is that
 * colour", any one of which can silently produce nothing.
 *
 * Canvas 2D has none of that. `fillStyle = rgba(...)` puts exactly that
 * colour on screen, so what the code says is what you see. The cost is
 * paying for the dots on the CPU instead of the GPU — but this is one
 * element drawing a few hundred small arcs into a band a couple of hundred
 * pixels tall, which is a fraction of a millisecond a frame and nothing like
 * the DOM version's layout and composite work.
 *
 * Frameless and full-bleed on purpose: this is the surface the contact
 * section rests on, not a widget in a box. Move across it to pull the
 * lattice toward the cursor; press to drop a wavefront.
 */

import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/lib/hooks/useClientFlag";
import { observeVisibility } from "@/lib/performance";

/** Lattice pitch in CSS px. */
const CELL = 26;
/** Dot radius at rest, and the most a wave can add to it. */
const R_REST = 1.5;
const R_GAIN = 2.6;
/** Ripple lifetime (s), front speed (px/s) and front thickness (px). */
const LIFE = 2.4;
const SPEED = 380;
const WIDTH = 44;
/** How far a dot is displaced by a passing front, px. */
const PUSH = 8;
/** Radius of the cursor's influence, px. */
const REACH = 110;
/** Seconds between unprompted ripples, so the field is alive before it is
    touched — an inert field reads as broken rather than as waiting. */
const AMBIENT = 3.2;
/** Concurrent wavefronts. Older ones are dropped rather than queued. */
const MAX_RIPPLES = 5;

type Ripple = { x: number; y: number; born: number };

export default function ContactField({
  className = "",
  /** Indigo by default, matching the section accent. */
  color = "139,157,255",
}: {
  className?: string;
  /** "r,g,b" — the alpha varies per dot, so the channels are kept raw
      rather than taking a hex and re-parsing it every frame. */
  color?: string;
}) {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced   = useReducedMotionPref();

  /* Interaction and animation state. All in refs: none of it should cause a
     render, and a pointermove that re-rendered this component would defeat
     the point of the rewrite. */
  const st = useRef({
    px: -9999, py: -9999,   // pointer, CSS px within the band
    hover: 0,               // eased 0..1
    ripples: [] as Ripple[],
    nextAmbient: 1.0,
    visible: false,
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = st.current;
    let raf = 0;
    let last = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;

    /* Backing store is sized in device pixels and the context is scaled once,
       so everything below can be written in CSS pixels. Getting this wrong is
       what makes canvas work look soft on retina displays. */
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const t = now / 1000;
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;

      // Ease the hover weight so leaving the band fades the pull out instead
      // of dropping every dot back at once.
      const wantHover = s.px > -9998 ? 1 : 0;
      s.hover += (wantHover - s.hover) * (1 - Math.exp(-dt / 0.18));

      if (!reduced) {
        s.nextAmbient -= dt;
        if (s.nextAmbient <= 0) {
          s.nextAmbient = AMBIENT * (0.7 + Math.random() * 0.6);
          s.ripples.push({ x: Math.random() * w, y: Math.random() * h, born: t });
        }
      }
      // Expired fronts are dropped here rather than inside the dot loop, so
      // the per-dot work stays proportional to what's actually on screen.
      s.ripples = s.ripples.filter((r) => t - r.born < LIFE).slice(-MAX_RIPPLES);

      ctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);

      for (let iy = 0; iy < rows; iy++) {
        for (let ix = 0; ix < cols; ix++) {
          const bx = (ix + 0.5) * CELL;
          const by = (iy + 0.5) * CELL;

          let amp = 0;
          let ox = 0;
          let oy = 0;

          for (let i = 0; i < s.ripples.length; i++) {
            const r = s.ripples[i];
            const age = t - r.born;
            const dx = bx - r.x;
            const dy = by - r.y;
            const dist = Math.hypot(dx, dy);
            const front = age * SPEED;
            /* A ring, not a disc: the energy sits at the expanding front and
               falls away on both sides, which is what reads as a wave
               travelling through the lattice rather than a circle growing. */
            const ring = Math.exp(-Math.abs(dist - front) / WIDTH);
            const fade = 1 - age / LIFE;
            const wgt = ring * fade * fade;
            if (wgt > 0.002 && dist > 0.001) {
              amp += wgt;
              ox += (dx / dist) * wgt;
              oy += (dy / dist) * wgt;
            }
          }

          // Cursor pull, toward the pointer rather than away from it.
          if (s.hover > 0.01) {
            const dx = bx - s.px;
            const dy = by - s.py;
            const dist = Math.hypot(dx, dy);
            if (dist < REACH * 2.2 && dist > 0.001) {
              const pull = Math.exp(-dist / REACH) * s.hover;
              amp += pull * 0.7;
              ox -= (dx / dist) * pull;
              oy -= (dy / dist) * pull;
            }
          }

          // Slow breathing so a resting field still moves. Phase-shifted on
          // both axes so neighbours are never in step.
          const idle = reduced
            ? 0.5
            : 0.5 + 0.5 * Math.sin(t * 0.9 + bx * 0.013 + by * 0.02);

          const radius = R_REST + idle * 0.5 + Math.min(amp, 1.6) * R_GAIN;
          const alpha = Math.min(0.85, 0.26 + idle * 0.1 + amp * 0.7);

          ctx.beginPath();
          ctx.arc(bx + ox * PUSH, by + oy * PUSH, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color},${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      if (s.visible && !reduced) raf = requestAnimationFrame(draw);
      else raf = 0;
    };

    const start = () => {
      if (!raf && s.visible && !reduced) {
        last = 0;
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    // One frame immediately, so the lattice is on screen before the loop's
    // first tick — and so the reduced-motion path renders at all.
    draw(performance.now());

    const stopVisibility = observeVisibility(wrap, (v) => {
      s.visible = v;
      if (v) start();
    });

    const onResize = () => {
      resize();
      draw(performance.now());
    };

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      s.px = e.clientX - r.left;
      s.py = e.clientY - r.top;
      start();
    };

    const onLeave = () => {
      s.px = -9999;
      s.py = -9999;
    };

    const onDown = (e: PointerEvent) => {
      if (reduced) return;
      const r = wrap.getBoundingClientRect();
      s.ripples.push({
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        born: performance.now() / 1000,
      });
      start();
    };

    window.addEventListener("resize", onResize, { passive: true });
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointerdown", onDown);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      stopVisibility();
      window.removeEventListener("resize", onResize);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointerdown", onDown);
    };
  }, [color, reduced]);

  return (
    <div
      ref={wrapRef}
      className={`relative h-[180px] w-full touch-none select-none md:h-[220px] ${className}`}
      /* Decorative: it states nothing the section doesn't already say in
         text, so it is hidden rather than announced as a bare canvas. */
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
