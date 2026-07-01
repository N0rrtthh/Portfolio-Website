"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASING = [0.22, 1, 0.36, 1] as const;

export default function CinematicLoader({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [phase, setPhase] = useState<
    "line" | "name" | "expand" | "done"
  >("line");

  const stableOnComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Phase timings — every moment builds anticipation
    const t1 = setTimeout(() => setPhase("name"), 800);      // line draws
    const t2 = setTimeout(() => setPhase("expand"), 2400);    // name revealed
    const t3 = setTimeout(() => {
      setPhase("done");
      document.body.style.overflow = "";
      stableOnComplete();
    }, 3200); // wipe completes

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      document.body.style.overflow = "";
    };
  }, [stableOnComplete]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="cinematic-loader"
          className="fixed inset-0 z-[99999] flex items-center justify-center select-none pointer-events-none"
        >
          {/* Background layer — slides up on expand */}
          <motion.div
            className="absolute inset-0 bg-[var(--color-void)]"
            initial={{ y: 0 }}
            animate={
              phase === "expand"
                ? { y: "-100%" }
                : { y: 0 }
            }
            transition={{
              duration: 0.9,
              ease: EASING,
              delay: phase === "expand" ? 0.1 : 0,
            }}
          />

          {/* Secondary curtain — charcoal tint, delays slightly */}
          <motion.div
            className="absolute inset-0 bg-[var(--color-abyss)]"
            initial={{ y: 0 }}
            animate={
              phase === "expand"
                ? { y: "-100%" }
                : { y: 0 }
            }
            transition={{
              duration: 0.9,
              ease: EASING,
              delay: phase === "expand" ? 0.2 : 0,
            }}
          />

          {/* Center content — line + name */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6"
            animate={
              phase === "expand"
                ? { opacity: 0, scale: 0.9, filter: "blur(10px)" }
                : { opacity: 1, scale: 1, filter: "blur(0px)" }
            }
            transition={{ duration: 0.5, ease: EASING }}
          >
            {/* Horizontal line — draws from center */}
            <motion.div
              className="h-[1px] bg-[var(--color-accent-primary)]"
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: phase === "line" ? 80 : 160,
                opacity: 1,
              }}
              transition={{ duration: 0.8, ease: EASING }}
            />

            {/* Name reveal — blur to focus */}
            <AnimatePresence>
              {(phase === "name" || phase === "expand") && (
                <motion.div
                  className="flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASING }}
                >
                  {"ELRONI".split("").map((char, i) => (
                    <motion.span
                      key={i}
                      className="font-display text-2xl tracking-[0.3em] text-[var(--color-starlight)]"
                      initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.06,
                        ease: EASING,
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                  <motion.span
                    className="font-display text-2xl text-[var(--color-accent-primary)] ml-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4, ease: EASING }}
                  >
                    .
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Progress line at bottom */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-[var(--color-glass-border)] overflow-hidden">
            <motion.div
              className="w-full h-full bg-[var(--color-accent-primary)]/60"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 2.8, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
