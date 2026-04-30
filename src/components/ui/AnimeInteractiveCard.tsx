"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
import { Sparkles, Code2, Layers, Cpu } from "lucide-react";

export default function AnimeInteractiveCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Anime.js ambient subtle floating animation
    const floatAnim = anime({
      targets: containerRef.current,
      translateY: [-6, 6],
      rotateZ: [-1, 1],
      duration: 3500,
      direction: "alternate",
      loop: true,
      easing: "easeInOutSine",
    });

    return () => {
      floatAnim.pause();
    };
  }, []);

  function handleMouseEnter() {
    if (!iconRef.current) return;

    // Anime.js elastic spring rotation on hover
    anime({
      targets: iconRef.current,
      rotate: "1turn",
      scale: [1, 1.25, 1],
      duration: 1000,
      easing: "easeOutElastic(1, .5)",
    });
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      className="glass group rounded-3xl p-6 border border-[var(--color-glass-border)] hover:border-[var(--color-accent-primary)]/50 transition-[border-color,box-shadow,transform] duration-[250ms] ease-out shadow-[0_10px_30px_rgba(0,0,0,0.2)] cursor-pointer will-change-transform transform-gpu"
      data-cursor-hover
    >
      <div className="flex items-center justify-between mb-4">
        <div
          ref={iconRef}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20"
        >
          <Sparkles size={22} />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 px-2.5 py-1 rounded-full">
          Anime.js Interactive Node
        </span>
      </div>

      <h4 className="font-body text-base font-bold text-[var(--color-starlight)] mb-2">
        Spring-Physics Interaction
      </h4>
      <p className="font-body text-xs text-[var(--color-silver)] leading-relaxed">
        Hover to trigger real-time Anime.js spring physics rotation and scale interpolation.
      </p>
    </div>
  );
}
