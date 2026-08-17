"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import anime from "animejs";
import { getAdaptiveQuality, observeVisibility } from "@/lib/performance";

/* ══════════════════════════════════════════════════════════
   AnimeRippleField
   ──────────────────────────────────────────────────────────
   The signal grid, promoted out of its little bordered card and into a
   full-bleed interactive band. No border, no glass, no panel — it reads as
   part of the page surface, which is the only way an ambient field like this
   stops looking like a stray demo widget.

   Interaction: the ripple originates from the cell nearest the pointer, so
   moving across the band feels like pushing through water. `anime.stagger`
   with `from: index` on a grid does the distance falloff for us.

   Cost control:
     · one anime instance at a time; a new ripple replaces the old one
     · pointer input is sampled per animation frame, not per mousemove event
     · density and the idle loop both drop on low-tier devices
     · nothing animates while the field is off-screen
   ══════════════════════════════════════════════════════════ */

interface Props {
  rows?: number;
  columns?: number;
  className?: string;
  /** Idle breathing loop between interactions. */
  ambient?: boolean;
}

export default function AnimeRippleField({
  rows = 9,
  columns = 42,

  className = "",
  ambient = true,
}: Props) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<anime.AnimeInstance | null>(null);
  const loopRef = useRef<anime.AnimeInstance | null>(null);
  const rafRef = useRef(0);
  const pendingRef = useRef<number | null>(null);
  const lastIndexRef = useRef(-1);

  // Conservative first paint, then adapt — keeps SSR/client markup identical.
  const [dims, setDims] = useState({ rows: Math.min(rows, 5), cols: Math.min(columns, 14) });
  const [interactive, setInteractive] = useState(true);

  useEffect(() => {
    const q = getAdaptiveQuality();
    const id = requestAnimationFrame(() => {
      setDims({
        rows: q.tier === "low" ? Math.min(rows, 4) : q.tier === "medium" ? Math.min(rows, 5) : rows,
        cols:
          q.tier === "low"
            ? Math.min(columns, 16)
            : q.tier === "medium"
              ? Math.min(columns, 26)
              : columns,

      });
      setInteractive(!q.reduceContinuousFx);
    });
    return () => cancelAnimationFrame(id);
  }, [rows, columns]);

  const total = dims.rows * dims.cols;

  const dots = useMemo(() => Array.from({ length: total }, (_, i) => i), [total]);

  /* Idle loop — a slow travelling swell so the band is alive before it is
     touched, paused whenever it leaves the viewport. */
  useEffect(() => {
    const el = fieldRef.current;
    if (!el || !ambient) return;

    const start = () => {
      loopRef.current?.pause();
      loopRef.current = anime({
        targets: el.querySelectorAll(".ripple-dot"),
        scale: [
          { value: 0.55, easing: "easeOutSine", duration: 700 },
          { value: 1, easing: "easeInOutQuad", duration: 1400 },
        ],
        opacity: [
          { value: 0.15, duration: 700 },
          { value: 0.5, duration: 1400 },
        ],
        delay: anime.stagger(45, { grid: [dims.cols, dims.rows], from: "center" }),
        loop: true,
        direction: "alternate",
      });
    };

    const unobserve = observeVisibility(
      el,
      (visible) => {
        if (visible) start();
        else {
          loopRef.current?.pause();
          loopRef.current = null;
        }
      },
      "10% 0px"
    );

    return () => {
      unobserve();
      loopRef.current?.pause();
      loopRef.current = null;
    };
  }, [dims.rows, dims.cols, ambient]);

  const fire = useCallback(
    (index: number, strong: boolean) => {
      const el = fieldRef.current;
      if (!el) return;
      rippleRef.current?.pause();
      loopRef.current?.pause();
      rippleRef.current = anime({
        targets: el.querySelectorAll(".ripple-dot"),
        scale: [
          { value: strong ? 4.6 : 3.4, easing: "easeOutExpo", duration: 260 },

          { value: 1, easing: "spring(1, 78, 11, 0)", duration: 900 },
        ],
        opacity: [
          { value: 1, duration: 200 },
          { value: 0.4, duration: 700 },
        ],
        delay: anime.stagger(strong ? 26 : 34, {
          grid: [dims.cols, dims.rows],
          from: index,
        }),
        complete: () => {
          rippleRef.current = null;
          loopRef.current?.play();
        },
      });
    },
    [dims.rows, dims.cols]
  );

  /* Pointer sampling: mousemove can fire far more often than the display
     refreshes, and each ripple builds a full target list. Latch the newest
     cell and act on it once per frame. */
  useEffect(() => {
    if (!interactive) return;
    const tick = () => {
      const next = pendingRef.current;
      if (next !== null && next !== lastIndexRef.current) {
        lastIndexRef.current = next;
        fire(next, false);
      }
      pendingRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [interactive, fire]);

  function indexFromEvent(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const col = Math.min(
      dims.cols - 1,
      Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * dims.cols))
    );
    const row = Math.min(
      dims.rows - 1,
      Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * dims.rows))
    );
    return row * dims.cols + col;
  }

  return (
    <div
      ref={fieldRef}
      onPointerMove={(e) => {
        if (!interactive) return;
        pendingRef.current = indexFromEvent(e);
      }}
      onPointerDown={(e) => fire(indexFromEvent(e), true)}
      onPointerLeave={() => {
        lastIndexRef.current = -1;
        pendingRef.current = null;
      }}
      className={`grid w-full touch-none select-none gap-x-1.5 gap-y-1.5 sm:gap-x-2 sm:gap-y-2 ${className}`}


      style={{
        gridTemplateColumns: `repeat(${dims.cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${dims.rows}, minmax(0, 1fr))`,
      }}
      data-cursor-hover
      aria-hidden="true"
    >
      {dots.map((i) => (
        <span
          key={i}
          /* 2px dots — a fine point cloud, closer to the hero mesh than to a
             row of buttons. The hit target is the whole band, not the dot, so
             shrinking these costs nothing in interactivity, and the 4.6x press
             scale still makes a 2px dot clearly visible in the wave. */
          className="ripple-dot mx-auto h-[2px] w-[2px] rounded-full bg-[var(--color-accent-primary)] opacity-40 transform-gpu will-change-transform"


        />
      ))}
    </div>
  );
}
