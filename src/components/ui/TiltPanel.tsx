"use client";

/**
 * TiltPanel — gives a DOM card real perspective.
 *
 * The project cards are 3D panels now: they rotate toward the cursor in a
 * perspective projection, with a specular sheen that tracks where the
 * pointer is on the surface. The point is depth cueing — a flat card that
 * merely scales on hover reads as a button, whereas one that rotates and
 * catches light reads as a physical panel you're leaning over.
 *
 * Why this is DOM and not WebGL, deliberately:
 * these cards contain a heading, a description, tech tags, a Next/Image and
 * a click target that opens a modal. Rendering that into a canvas would mean
 * re-implementing text layout, focus, selection and hit testing, and would
 * take the content out of the accessibility tree. A CSS 3D transform gets
 * the same visual result on the compositor while leaving the card a normal,
 * selectable, screen-reader-visible article.
 *
 * COST
 * ----
 * The transform is written to the element's style, never through React
 * state: a per-frame setState here would re-render a card containing an
 * image on every mouse move. The rAF loop also stops itself once the panel
 * has settled back to flat, so an untouched card costs nothing at all —
 * this mounts once per card, and a permanent loop each would add up.
 *
 * The tilt lives on a WRAPPER rather than the card itself because the card's
 * own hover scale is animated by framer-motion. Two owners writing one
 * `transform` fight and the loser's value is dropped; separating them by one
 * element means the two compose instead (wrapper rotates, inner scales).
 */

import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/lib/hooks/useClientFlag";

/** Maximum rotation at the very edge of the panel, degrees. Small on
    purpose: past ~10° the text on the far edge starts to visibly distort
    and the panel reads as a novelty rather than as depth. */
const MAX_TILT = 7;
/** Perspective distance, px. Lower is a wider-angle, more aggressive lens.
    1100 on a card this size is roughly a 50mm look — present, not fisheye. */
const PERSPECTIVE = 1100;
/** Time constant of the easing, seconds. The tilt trails the cursor slightly
    so the panel feels like it has mass. */
const TAU = 0.12;
/** Below this, the panel is treated as flat and the loop shuts down. */
const EPSILON = 0.02;

export default function TiltPanel({
  children,
  className = "",
  /** Matches the child card's radius so the sheen doesn't square off its
      corners. It has to be stated: the overlay sits above the card, so it
      cannot inherit the card's own clipping. */
  radiusClass = "rounded-3xl",
  max = MAX_TILT,
}: {
  children: React.ReactNode;
  className?: string;
  radiusClass?: string;
  max?: number;
}) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

  /** Target and current tilt, plus the cursor in normalised panel space.
      All in one ref: this is animation state, and none of it should ever
      trigger a render. */
  const state = useRef({
    tx: 0, ty: 0,   // target rotation, degrees
    cx: 0, cy: 0,   // current rotation, degrees
    px: 0.5, py: 0.5, // pointer, 0..1 across the panel
    sx: 0.5, sy: 0.5, // eased pointer, for the sheen
    glare: 0,       // sheen opacity target/current
    cg: 0,
    raf: 0,
    last: 0,
  });

  const reduced = useReducedMotionPref();

  /* The whole loop lives in one effect with native listeners rather than in
     useCallbacks wired to JSX handlers. Two reasons, in order of importance:
     a rAF loop has to reference itself to schedule the next frame, which a
     self-referencing useCallback cannot do (and the compiler rejects
     outright); and native listeners are registered once for the element's
     lifetime instead of a new closure being handed to React each render.
     Everything the loop touches is a ref or a local, so nothing here is
     rebuilt when the parent re-renders. */
  useEffect(() => {
    if (reduced) return;
    const el = wrapRef.current;
    if (!el) return;

    const s = state.current;
    let alive = true;

    const stop = () => {
      if (s.raf) cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.last = 0;
    };

    function frame() {
      if (!alive) return;
      const now = performance.now();
      // The first frame of a run has no previous timestamp; assume one 60Hz
      // step rather than letting dt be the whole idle gap since the last run,
      // which would snap the panel to its target instead of easing.
      const dt = s.last ? Math.min((now - s.last) / 1000, 1 / 30) : 1 / 60;
      s.last = now;

      const k = 1 - Math.exp(-dt / TAU);
      s.cx += (s.tx - s.cx) * k;
      s.cy += (s.ty - s.cy) * k;
      s.sx += (s.px - s.sx) * k;
      s.sy += (s.py - s.sy) * k;
      s.cg += (s.glare - s.cg) * k;

      if (innerRef.current) {
        innerRef.current.style.transform =
          `rotateX(${s.cx.toFixed(3)}deg) rotateY(${s.cy.toFixed(3)}deg)`;
      }
      if (sheenRef.current) {
        sheenRef.current.style.opacity = s.cg.toFixed(3);
        sheenRef.current.style.background =
          `radial-gradient(circle at ${(s.sx * 100).toFixed(1)}% ${(s.sy * 100).toFixed(1)}%,`
          + ` rgba(255,255,255,0.16), rgba(255,255,255,0.04) 38%, transparent 62%)`;
      }

      // Settled AND heading nowhere: park the loop. Testing the target as
      // well as the delta matters — mid-hover the panel is often momentarily
      // within epsilon of a target it is still tracking.
      const settled =
        Math.abs(s.tx - s.cx) < EPSILON && Math.abs(s.ty - s.cy) < EPSILON &&
        Math.abs(s.glare - s.cg) < 0.01;
      if (settled && s.tx === 0 && s.ty === 0 && s.glare === 0) {
        if (innerRef.current) innerRef.current.style.transform = "";
        stop();
        return;
      }
      s.raf = requestAnimationFrame(frame);
    }

    const kick = () => {
      if (!s.raf) s.raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      s.px = nx;
      s.py = ny;
      // Rotate away from the cursor's side on one axis and toward it on the
      // other: the combination that reads as the surface being pressed under
      // the pointer rather than pivoting about the middle of the screen.
      s.ty = (nx - 0.5) * 2 * max;
      s.tx = -(ny - 0.5) * 2 * max;
      s.glare = 1;
      kick();
    };

    const onLeave = () => {
      s.tx = 0;
      s.ty = 0;
      s.glare = 0;
      kick();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      // A pointer can leave without a pointerleave ever firing — the card
      // unmounts, the route changes — so teardown has to cancel the loop
      // itself rather than trusting the panel to have settled.
      alive = false;
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      stop();
    };
  }, [max, reduced]);

  if (reduced) {
    // No wrapper transform, no listeners, no loop — the card is simply
    // itself. Same DOM shape either way, so nothing below has to care.
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ perspective: `${PERSPECTIVE}px` }}
    >
      <div
        ref={innerRef}
        className="relative h-full w-full will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}

        {/* Specular sheen. Above the card, so it has to carry the card's own
            radius; `screen` keeps it additive over artwork instead of
            washing it grey. Opacity and gradient position are written by the
            frame loop. */}
        <div
          ref={sheenRef}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-20 ${radiusClass}`}
          style={{ opacity: 0, mixBlendMode: "screen" }}
        />
      </div>
    </div>
  );
}
