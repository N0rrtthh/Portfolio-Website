/**
 * Runtime performance tier detection for adaptive visual quality.
 * Keeps cinematic richness on capable machines while protecting mid-range laptops.
 */

export type PerformanceTier = "high" | "medium" | "low";

export interface AdaptiveQuality {
  tier: PerformanceTier;
  dpr: number;
  sparkleCount: number;
  particleBg: number;
  particleMid: number;
  particleFg: number;
  antialias: boolean;
  enableBlur: boolean;
  reduceContinuousFx: boolean;
}

let cached: AdaptiveQuality | null = null;

function detectTier(): PerformanceTier {
  if (typeof window === "undefined") return "medium";

  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowDpr = window.devicePixelRatio <= 1.25;
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData === true;

  if (reducedMotion || saveData) return "low";
  if (isCoarse && cores <= 4) return "low";
  if (cores <= 4 || (memory !== undefined && memory <= 4) || lowDpr) return "medium";
  if (cores >= 8 && (memory === undefined || memory >= 8)) return "high";
  return "medium";
}

export function getAdaptiveQuality(forceRefresh = false): AdaptiveQuality {
  if (cached && !forceRefresh) return cached;

  const tier = detectTier();
  const dprCap = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;

  const table: Record<PerformanceTier, AdaptiveQuality> = {
    high: {
      tier: "high",
      dpr: Math.min(dprCap, 1.5),
      sparkleCount: 90,
      particleBg: 420,
      particleMid: 200,
      particleFg: 60,
      antialias: false,
      enableBlur: true,
      reduceContinuousFx: false,
    },
    medium: {
      tier: "medium",
      dpr: 1,
      sparkleCount: 48,
      particleBg: 280,
      particleMid: 140,
      particleFg: 40,
      antialias: false,
      enableBlur: true,
      reduceContinuousFx: false,
    },
    low: {
      tier: "low",
      dpr: 1,
      sparkleCount: 24,
      particleBg: 140,
      particleMid: 70,
      particleFg: 20,
      antialias: false,
      enableBlur: false,
      reduceContinuousFx: true,
    },
  };

  cached = table[tier];
  return cached;
}

/** True when the element is near/in the viewport (with rootMargin slack). */
export function observeVisibility(
  element: Element,
  onChange: (visible: boolean) => void,
  rootMargin = "20% 0px"
): () => void {
  if (typeof IntersectionObserver === "undefined") {
    onChange(true);
    return () => undefined;
  }

  const observer = new IntersectionObserver(
    ([entry]) => onChange(entry.isIntersecting),
    { rootMargin, threshold: 0 }
  );
  observer.observe(element);
  return () => observer.disconnect();
}
