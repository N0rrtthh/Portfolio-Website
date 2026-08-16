"use client";

import { useCallback, useEffect, useInsertionEffect, useRef } from "react";

interface SectionMetrics {
  /** Document-space offset of the section top. */
  top: number;
  /** Scrollable travel of the section (height - viewport). */
  range: number;
}

/**
 * Scroll progress (0-1) for a tall sticky section, without per-frame layout reads.
 *
 * Geometry is measured once (and again on resize) instead of on every scroll
 * event, so scrolling never forces a synchronous layout. Progress is published
 * through a ref — the default path triggers zero React re-renders. `onChange`
 * is invoked at most once per animation frame for callers that need to derive
 * state (e.g. the active node index).
 */
export function useSectionProgress(
  ref: React.RefObject<HTMLElement | null>,
  onChange?: (progress: number) => void
) {
  const progressRef = useRef(0);
  const metricsRef = useRef<SectionMetrics>({ top: 0, range: 1 });
  const onChangeRef = useRef(onChange);

  // Keep the latest callback without re-subscribing the scroll listener.
  useInsertionEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      metricsRef.current = {
        top: rect.top + window.scrollY,
        range: Math.max(el.offsetHeight - window.innerHeight, 1),
      };
    };

    const commit = () => {
      frame = 0;
      const { top, range } = metricsRef.current;
      const raw = (window.scrollY - top) / range;
      const progress = raw < 0 ? 0 : raw > 1 ? 1 : raw;
      progressRef.current = progress;
      onChangeRef.current?.(progress);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(commit);
    };

    const remeasure = () => {
      measure();
      schedule();
    };

    measure();
    commit();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);

    // Section height can change once fonts/lazy content settle.
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(remeasure) : null;
    observer?.observe(el);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      observer?.disconnect();
    };
  }, [ref]);

  /** Scroll the window so the section sits at the given progress (0-1). */
  const scrollToProgress = useCallback(
    (progress: number, behavior: ScrollBehavior = "smooth") => {
      const { top, range } = metricsRef.current;
      window.scrollTo({ top: top + progress * range, behavior });
    },
    []
  );

  return { progressRef, scrollToProgress };
}
