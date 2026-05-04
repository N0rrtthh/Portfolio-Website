"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor({ design }: { design: "classic" | "eva" }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) {
      setTimeout(() => setIsCoarse(true), 0);
      return;
    }

    const ring = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let raf: number;

    function onMove(e: MouseEvent) {
      target = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    }

    function onMouseOver(e: MouseEvent) {
      const el = e.target as HTMLElement;
      if (el?.closest("a, button, [data-cursor-hover]")) {
        setIsPointer(true);
      }
    }

    function onMouseOut(e: MouseEvent) {
      const el = e.target as HTMLElement;
      // If we move to a child of the interactive element, we are still hovering it
      const related = e.relatedTarget as HTMLElement;
      if (el?.closest("a, button, [data-cursor-hover]") && !related?.closest("a, button, [data-cursor-hover]")) {
        setIsPointer(false);
      }
    }

    function animateRing() {
      ring.x += (target.x - ring.x) * 0.14; // Slower spring easing for a smoother trail
      ring.y += (target.y - ring.y) * 0.14;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(animateRing);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    window.addEventListener("mouseout", onMouseOut, { passive: true });
    raf = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mouseout", onMouseOut);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (isCoarse) return null;

  const isEva = design === "eva";

  return (
    <>
      {/* Center Dot */}
      <div
        ref={dotRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9998] h-1.5 w-1.5 rounded-full transition-opacity duration-300 ${
          isEva ? "bg-[var(--color-accent-warm)]" : "bg-[var(--color-starlight)]"
        }`}
        style={{ opacity: isVisible ? 1 : 0 }}
        aria-hidden="true"
      />
      {/* Smooth Outer Ring */}
      <div
        ref={ringRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9998] border transition-[background-color,border-color,transform,width,height,opacity] duration-150 ease-out will-change-transform transform-gpu ${
          isEva
            ? "border-[var(--color-accent-primary)] rounded-none"
            : "border-[var(--color-accent-primary)]/40 rounded-full"
        }`}
        style={{
          width: isPointer ? (isEva ? 44 : 52) : (isEva ? 24 : 32),
          height: isPointer ? (isEva ? 44 : 52) : (isEva ? 24 : 32),
          opacity: isVisible ? (isPointer ? 0.9 : 0.45) : 0,
          backgroundColor: isPointer
            ? isEva
              ? "rgba(122, 0, 255, 0.08)"
              : "rgba(67, 97, 238, 0.08)"
            : "transparent",
          transform: isEva ? "rotate(45deg)" : "none",
        }}
        aria-hidden="true"
      />
    </>
  );
}
