"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { getAdaptiveQuality, observeVisibility } from "@/lib/performance";

interface AnimeStaggerGridProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/**
 * Ambient dot grid. Loops only while visible; density scales with device tier
 * after mount (avoids SSR/client hydration mismatch).
 */
export default function AnimeStaggerGrid({
  rows = 8,
  columns = 16,
  className = "",
}: AnimeStaggerGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<anime.AnimeInstance | null>(null);
  // Start with medium density for stable hydration, then adapt client-side
  const [dims, setDims] = useState({ rows: Math.min(rows, 6), cols: Math.min(columns, 10) });
  const [allowHoverFx, setAllowHoverFx] = useState(true);

  useEffect(() => {
    const q = getAdaptiveQuality();
    const id = requestAnimationFrame(() => {
      setDims({
        rows:
          q.tier === "low" ? Math.min(rows, 4) : q.tier === "medium" ? Math.min(rows, 6) : rows,
        cols:
          q.tier === "low"
            ? Math.min(columns, 8)
            : q.tier === "medium"
              ? Math.min(columns, 10)
              : columns,
      });
      setAllowHoverFx(!q.reduceContinuousFx);
    });
    return () => cancelAnimationFrame(id);
  }, [rows, columns]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const start = () => {
      animRef.current?.pause();
      animRef.current = anime({
        targets: el.querySelectorAll(".anime-dot"),
        scale: [
          { value: 0.2, easing: "easeOutSine", duration: 500 },
          { value: 1, easing: "easeInOutQuad", duration: 1200 },
        ],
        translateY: [
          { value: -12, easing: "easeOutSine", duration: 500 },
          { value: 0, easing: "easeInOutQuad", duration: 1200 },
        ],
        opacity: [
          { value: 0.1, duration: 400 },
          { value: 0.4, duration: 1000 },
        ],
        delay: anime.stagger(60, {
          grid: [dims.cols, dims.rows],
          from: "center",
        }),
        loop: true,
        direction: "alternate",
      });
    };

    const stop = () => {
      animRef.current?.pause();
      animRef.current = null;
    };

    const unobserve = observeVisibility(
      el,
      (visible) => {
        if (visible) start();
        else stop();
      },
      "10% 0px"
    );

    return () => {
      unobserve();
      stop();
    };
  }, [dims.rows, dims.cols]);

  function handleDotHover(index: number) {
    if (!gridRef.current || !allowHoverFx) return;
    anime({
      targets: gridRef.current.querySelectorAll(".anime-dot"),
      scale: [
        { value: 2.2, easing: "easeOutExpo", duration: 300 },
        { value: 1, easing: "spring(1, 80, 10, 0)", duration: 800 },
      ],
      opacity: [1, 0.4],
      delay: anime.stagger(40, {
        grid: [dims.cols, dims.rows],
        from: index,
      }),
    });
  }

  const total = dims.rows * dims.cols;

  return (
    <div
      ref={gridRef}
      className={`grid gap-2 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${dims.cols}, 1fr)`,
        gridTemplateRows: `repeat(${dims.rows}, 1fr)`,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="anime-dot h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)] opacity-30 will-change-transform transform-gpu"
          onMouseEnter={() => handleDotHover(i)}
        />
      ))}
    </div>
  );
}
