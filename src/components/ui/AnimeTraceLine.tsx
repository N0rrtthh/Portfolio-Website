"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
import { getAdaptiveQuality, observeVisibility } from "@/lib/performance";

/* ══════════════════════════════════════════════════════════
   AnimeTraceLine
   ──────────────────────────────────────────────────────────
   A hairline that draws itself across the section, with a single bright
   node riding the stroke. Used as a divider between blocks, so it is
   frameless by definition — no card, no border, nothing to enclose it.

   Two anime instances, both cheap: one animates `stroke-dashoffset` on a
   path (compositor-friendly, no layout), the other slides the node along
   the same axis. Both are paused off-screen and the whole thing degrades
   to a static rule when the device asks for less continuous motion.
   ══════════════════════════════════════════════════════════ */

interface Props {
  className?: string;
  /** Height of the band the line waves inside, in px. */
  height?: number;
  /** Seconds for one full draw. Longer reads calmer. */
  duration?: number;
}

export default function AnimeTraceLine({
  className = "",
  height = 28,
  duration = 3.2,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const nodeRef = useRef<HTMLSpanElement>(null);
  const drawRef = useRef<anime.AnimeInstance | null>(null);
  const nodeAnimRef = useRef<anime.AnimeInstance | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    const node = nodeRef.current;
    if (!wrap || !path || !node) return;

    const q = getAdaptiveQuality();
    if (q.reduceContinuousFx) {
      // Static hairline: fully drawn, node parked at the end.
      path.style.strokeDasharray = "none";
      path.style.strokeDashoffset = "0";
      node.style.opacity = "0";
      return;
    }

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;

    const start = () => {
      drawRef.current?.pause();
      nodeAnimRef.current?.pause();

      drawRef.current = anime({
        targets: path,
        strokeDashoffset: [length, 0],
        easing: "easeInOutSine",
        duration: duration * 1000,
        direction: "alternate",
        loop: true,
      });

      nodeAnimRef.current = anime({
        targets: node,
        left: ["0%", "100%"],
        opacity: [
          { value: 1, duration: 200 },
          { value: 1, duration: duration * 1000 - 400 },
          { value: 0.2, duration: 200 },
        ],
        easing: "easeInOutSine",
        duration: duration * 1000,
        direction: "alternate",
        loop: true,
      });
    };

    const unobserve = observeVisibility(
      wrap,
      (visible) => {
        if (visible) start();
        else {
          drawRef.current?.pause();
          nodeAnimRef.current?.pause();
          drawRef.current = null;
          nodeAnimRef.current = null;
        }
      },
      "10% 0px"
    );

    return () => {
      unobserve();
      drawRef.current?.pause();
      nodeAnimRef.current?.pause();
      drawRef.current = null;
      nodeAnimRef.current = null;
    };
  }, [duration]);

  return (
    <div
      ref={wrapRef}
      className={`relative w-full ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1000 28"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          ref={pathRef}
          d="M0 20 C 140 20, 190 6, 320 12 S 520 26, 640 14 S 830 4, 1000 16"
          fill="none"
          stroke="var(--color-accent-primary)"
          strokeWidth="1"
          strokeOpacity="0.55"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        ref={nodeRef}
        className="pointer-events-none absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent-primary)] shadow-[0_0_10px_var(--color-accent-primary)]"
        style={{ left: "0%", opacity: 0 }}
      />
    </div>
  );
}
