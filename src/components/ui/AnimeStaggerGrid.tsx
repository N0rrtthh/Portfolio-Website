"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";

interface AnimeStaggerGridProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export default function AnimeStaggerGrid({
  rows = 8,
  columns = 16,
  className = "",
}: AnimeStaggerGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    // Stagger wave animation on mount
    const anim = anime({
      targets: gridRef.current.querySelectorAll(".anime-dot"),
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
      delay: anime.stagger(60, { grid: [columns, rows], from: "center" }),
      loop: true,
      direction: "alternate",
    });

    return () => {
      anim.pause();
    };
  }, [rows, columns]);

  function handleDotHover(index: number) {
    if (!gridRef.current) return;
    anime({
      targets: gridRef.current.querySelectorAll(".anime-dot"),
      scale: [
        { value: 2.2, easing: "easeOutExpo", duration: 300 },
        { value: 1, easing: "spring(1, 80, 10, 0)", duration: 800 },
      ],
      opacity: [1, 0.4],
      delay: anime.stagger(40, { grid: [columns, rows], from: index }),
    });
  }

  const total = rows * columns;

  return (
    <div
      ref={gridRef}
      className={`grid gap-3 pointer-events-auto ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          onMouseEnter={() => handleDotHover(i)}
          className="anime-dot h-2 w-2 rounded-full bg-[var(--color-accent-primary)] opacity-40 transition-colors hover:bg-[var(--color-accent-warm)] cursor-pointer"
        />
      ))}
    </div>
  );
}
