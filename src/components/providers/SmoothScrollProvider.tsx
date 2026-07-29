"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

export default function SmoothScrollProvider({
  children,
  weight = "normal",
}: {
  children: React.ReactNode;
  weight?: "normal" | "heavy";
}) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const isHeavy = weight === "heavy";

    // Premium heavy scroll — high travel distance, slow lerp momentum
    // lerp: how fast it catches up to target (lower = more lag/inertia)
    // wheelMultiplier: how far each scroll tick moves (higher = more travel)
    const instance = new Lenis(
      isHeavy
        ? {
            lerp: 0.06,              // very slow catch-up — heavy inertia tail
            wheelMultiplier: 1.4,    // each tick travels far
            touchMultiplier: 1.0,
            smoothWheel: true,
            syncTouch: false,
          }
        : {
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.2,
          }
    );

    setLenis(instance);

    function raf(time: number) {
      instance.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
