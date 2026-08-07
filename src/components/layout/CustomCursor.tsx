"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Imperative cursor — no React re-renders on mousemove.
 * Ring size uses CSS scale (compositor-only) instead of width/height layout thrash.
 */
export default function CustomCursor({ design }: { design: "classic" | "eva" }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isCoarse, setIsCoarse] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer to avoid cascading renders from synchronous setState in effect
    const id = requestAnimationFrame(() => {
      setMounted(true);
      setIsCoarse(window.matchMedia("(pointer: coarse)").matches);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (isCoarse) return;

    const ring = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let raf = 0;
    let isPointer = false;
    let isVisible = false;
    let lastPointer = false;

    const setVisible = (v: boolean) => {
      if (isVisible === v) return;
      isVisible = v;
      const opacity = v ? "1" : "0";
      if (dotRef.current) dotRef.current.style.opacity = opacity;
      if (ringRef.current) {
        ringRef.current.style.opacity = v ? (isPointer ? "0.9" : "0.45") : "0";
      }
    };

    const applyPointerState = (next: boolean) => {
      if (lastPointer === next) return;
      lastPointer = next;
      isPointer = next;
      if (!ringRef.current) return;
      // Scale instead of width/height — pure transform, no layout
      const scale = next ? (design === "eva" ? 1.83 : 1.625) : 1;
      ringRef.current.style.setProperty("--cursor-scale", String(scale));
      ringRef.current.style.opacity = isVisible ? (next ? "0.9" : "0.45") : "0";
      ringRef.current.style.backgroundColor = next
        ? design === "eva"
          ? "rgba(122, 0, 255, 0.08)"
          : "rgba(67, 97, 238, 0.08)"
        : "transparent";
    };

    function onMove(e: MouseEvent) {
      target = { x: e.clientX, y: e.clientY };
      setVisible(true);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    }

    function onMouseOver(e: MouseEvent) {
      const el = e.target as HTMLElement;
      if (el?.closest("a, button, [data-cursor-hover]")) {
        applyPointerState(true);
      }
    }

    function onMouseOut(e: MouseEvent) {
      const el = e.target as HTMLElement;
      const related = e.relatedTarget as HTMLElement;
      if (
        el?.closest("a, button, [data-cursor-hover]") &&
        !related?.closest("a, button, [data-cursor-hover]")
      ) {
        applyPointerState(false);
      }
    }

    function animateRing() {
      ring.x += (target.x - ring.x) * 0.14;
      ring.y += (target.y - ring.y) * 0.14;
      if (ringRef.current) {
        const baseRotate = design === "eva" ? " rotate(45deg)" : "";
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%) scale(var(--cursor-scale, 1))${baseRotate}`;
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
  }, [design, isCoarse]);

  if (!mounted || isCoarse) return null;

  const isEva = design === "eva";
  const baseSize = isEva ? 24 : 32;

  return (
    <>
      <div
        ref={dotRef}
        className={`pointer-events-none fixed top-0 left-0 z-[999999] h-1.5 w-1.5 rounded-full ${
          isEva ? "bg-[var(--color-accent-warm)]" : "bg-[var(--color-starlight)]"
        }`}
        style={{ opacity: 0, willChange: "transform" }}
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className={`pointer-events-none fixed top-0 left-0 z-[999999] border will-change-transform transform-gpu ${
          isEva
            ? "border-[var(--color-accent-primary)] rounded-none"
            : "border-[var(--color-accent-primary)]/40 rounded-full"
        }`}
        style={{
          width: baseSize,
          height: baseSize,
          opacity: 0,
          // CSS variable driven scale — no layout on hover
          ["--cursor-scale" as string]: 1,
          transition:
            "opacity 150ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out",
        }}
        aria-hidden="true"
      />
    </>
  );
}
