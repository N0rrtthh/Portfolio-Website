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
    const instance = new Lenis({
      duration: isHeavy ? 2.2 : 1.2,
      easing: isHeavy
        ? (t) => 1 - Math.pow(1 - t, 4)          // quartic ease-out — heavy deceleration
        : (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: isHeavy ? 0.7 : 1,
      touchMultiplier: isHeavy ? 0.9 : 1.2,
    });

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
