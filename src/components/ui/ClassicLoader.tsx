"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHRASES = [
  "Initializing Workspace",
  "Loading Assets",
  "Compiling Experience",
  "Elroni Quiñones"
];

export default function ClassicLoader({ onComplete }: { onComplete?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Cycle through phrases
    const interval = setInterval(() => {
      setPhraseIndex((prev) => {
        if (prev >= PHRASES.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 600); // Wait 600ms per phrase

    // Total load time = (PHRASES.length * 600) + a little buffer
    const totalTime = PHRASES.length * 600 + 400;

    const timeout = setTimeout(() => {
      setLoading(false);
      document.body.style.overflow = "";
      if (onComplete) {
        setTimeout(onComplete, 1000); // Wait for exit animation to finish
      }
    }, totalTime);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      document.body.style.overflow = "";
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="classic-loader"
          className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none select-none"
        >
          {/* Staggered Background Curtains */}
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
            className="absolute inset-0 bg-(--color-charcoal) z-10"
          />
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
            className="absolute inset-0 bg-(--color-ash) z-20"
          />
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0 }}
            className="absolute inset-0 bg-[var(--color-void)] z-30 flex flex-col items-center justify-center gap-6"
          >
            {/* Animated Logo Icon Badge */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "backOut" }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent-primary)]/15 border-2 border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] shadow-[0_0_30px_rgba(67,97,238,0.3)] animate-pulse"
            >
              <span className="font-mono text-xl font-black tracking-tighter">&lt;EQ/&gt;</span>
            </motion.div>

            {/* Typewriter Text Container */}
            <div className="overflow-hidden h-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phraseIndex}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className={`font-display text-lg tracking-widest text-[var(--color-pearl)] ${
                    phraseIndex === PHRASES.length - 1 ? "font-bold text-xl text-[var(--color-starlight)]" : "uppercase text-sm"
                  }`}
                >
                  {PHRASES[phraseIndex]}
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Progress Line */}
            <div className="absolute bottom-12 w-48 h-[1px] bg-(--color-glass-border) overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: ((PHRASES.length * 600) / 1000), ease: "linear" }}
                className="w-full h-full bg-(--color-accent-cyan)"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
