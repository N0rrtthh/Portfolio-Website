"use client";

import { useEffect, useMemo, useRef } from "react";
import anime from "animejs";
import { getAdaptiveQuality, observeVisibility } from "@/lib/performance";

/* ══════════════════════════════════════════════════════════
   AnimeDriftParticles
   ──────────────────────────────────────────────────────────
   Ambient motes that drift across whatever they are placed over. Absolutely
   positioned and `pointer-events-none`, so it is decoration layered on the
   section itself — no frame, no background, nothing to read as a component.

   Positions are derived from a fixed seed rather than Math.random() so the
   server and client render identical markup (random values would hydrate
   mismatched). Each mote gets its own instance because they are meant to be
   out of phase; count stays small for exactly that reason.
   ══════════════════════════════════════════════════════════ */

function seeded(i: number, salt: number) {
  // Cheap deterministic hash → 0..1. Stable across SSR and client.
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export default function AnimeDriftParticles({
  count = 14,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const animsRef = useRef<anime.AnimeInstance[]>([]);

  const motes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: seeded(i, 1) * 100,
        top: seeded(i, 2) * 100,
        size: 2 + Math.round(seeded(i, 3) * 4),
        drift: 20 + seeded(i, 4) * 60,
        duration: 5200 + seeded(i, 5) * 5200,
        delay: seeded(i, 6) * 2600,
      })),
    [count]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const q = getAdaptiveQuality();
    if (q.reduceContinuousFx) return;

    const nodes = Array.from(el.querySelectorAll<HTMLElement>(".drift-mote"));
    const visibleCount = q.tier === "low" ? Math.ceil(nodes.length / 3) : nodes.length;

    const start = () => {
      stop();
      animsRef.current = nodes.slice(0, visibleCount).map((node, i) => {
        const m = motes[i];
        return anime({
          targets: node,
          translateY: [0, -m.drift],
          translateX: [0, (i % 2 === 0 ? 1 : -1) * (m.drift / 3)],
          opacity: [
            { value: 0.55, duration: m.duration * 0.4 },
            { value: 0.1, duration: m.duration * 0.6 },
          ],
          scale: [0.8, 1.25],
          easing: "easeInOutSine",
          duration: m.duration,
          delay: m.delay,
          loop: true,
          direction: "alternate",
        });
      });
    };

    const stop = () => {
      animsRef.current.forEach((a) => a.pause());
      animsRef.current = [];
    };

    const unobserve = observeVisibility(el, (visible) => (visible ? start() : stop()), "10% 0px");

    return () => {
      unobserve();
      stop();
    };
  }, [motes]);

  return (
    <div
      ref={rootRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {motes.map((m, i) => (
        <span
          key={i}
          className="drift-mote absolute rounded-full bg-[var(--color-accent-primary)] opacity-20 transform-gpu will-change-transform"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
          }}
        />
      ))}
    </div>
  );
}
