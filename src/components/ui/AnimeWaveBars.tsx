"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
import { getAdaptiveQuality, observeVisibility } from "@/lib/performance";

/* ══════════════════════════════════════════════════════════
   AnimeWaveBars
   ──────────────────────────────────────────────────────────
   A live signal readout — bars whose heights travel in a wave. Deliberately
   frameless so it can sit beside a label as punctuation rather than as yet
   another card.

   `scaleY` with a bottom transform origin, not `height`: height would lay out
   every frame, scale stays on the compositor.
   ══════════════════════════════════════════════════════════ */

export default function AnimeWaveBars({
  bars = 28,
  className = "",
}: {
  bars?: number;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<anime.AnimeInstance | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const q = getAdaptiveQuality();

    const start = () => {
      animRef.current?.pause();
      animRef.current = anime({
        targets: el.querySelectorAll(".wave-bar"),
        scaleY: [
          { value: 1, easing: "easeOutSine", duration: q.tier === "low" ? 900 : 620 },
          { value: 0.18, easing: "easeInOutQuad", duration: q.tier === "low" ? 900 : 620 },
        ],
        opacity: [
          { value: 0.95, duration: 400 },
          { value: 0.35, duration: 600 },
        ],
        delay: anime.stagger(55, { from: "first" }),
        loop: true,
        direction: "alternate",
      });
    };

    const unobserve = observeVisibility(
      el,
      (visible) => {
        if (visible) start();
        else {
          animRef.current?.pause();
          animRef.current = null;
        }
      },
      "10% 0px"
    );

    return () => {
      unobserve();
      animRef.current?.pause();
      animRef.current = null;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`flex h-8 items-end gap-[3px] ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className="wave-bar h-8 w-[3px] origin-bottom rounded-full bg-[var(--color-accent-primary)] opacity-40 transform-gpu will-change-transform"
          style={{ transform: "scaleY(0.18)" }}
        />
      ))}
    </div>
  );
}
