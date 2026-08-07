"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASING = [0.22, 1, 0.36, 1] as const;

const LOG_LINES = [
  "SYSTEM OVERRIDE ENGAGED...",
  "CONNECTING TO MAGI SYSTEM...",
  "CASPER-01: SYNC 400%",
  "BALTHASAR-02: SYNC 400%",
  "MELCHIOR-03: SYNC 400%",
  "NERV INTERFACE LOADED",
  "ALL SYSTEMS NOMINAL",
];

export default function EvaSideLoader({ onComplete }: { onComplete?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

    const startTime = Date.now();
    const duration = 2400; // 2.4s total duration

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setProgress(pct);

      const count = Math.min(
        Math.floor((elapsed / (duration * 0.85)) * (LOG_LINES.length + 1)) + 1,
        LOG_LINES.length + 1
      );
      setVisibleCount(count);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
          document.body.style.overflow = "";
          onCompleteRef.current?.();
        }, 350);
      }
    }, 30);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="eva-side-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: EASING } }}
          className="fixed inset-0 z-[99999] bg-black text-white select-none overflow-hidden flex flex-col justify-end p-10 sm:p-16"
        >
          {/* Main Container - Left Aligned at Bottom */}
          <div className="flex flex-col items-start gap-6 max-w-xl">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="font-mono text-3xl sm:text-4xl font-extrabold text-white tracking-widest uppercase"
            >
              PROJECT // UNIT-01
            </motion.h1>

            {/* Terminal Log Lines */}
            <div className="space-y-1.5 font-mono text-xs sm:text-sm tracking-widest text-[#a855f7]">
              {LOG_LINES.slice(0, Math.min(visibleCount, LOG_LINES.length)).map((text, idx) => {
                const lineNum = String(idx + 1).padStart(4, "0");
                return (
                  <motion.div
                    key={lineNum}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-[#a855f7]/50 font-normal">[{lineNum}]</span>
                    <span className="font-semibold">{text}</span>
                  </motion.div>
                );
              })}

              {/* Line [0008] empty prompt cursor when finished */}
              {visibleCount >= LOG_LINES.length + 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-[#a855f7]/50 font-normal">[0008]</span>
                  <span className="inline-block w-2 h-4 bg-[#a855f7] animate-pulse" />
                </motion.div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-64 sm:w-72 h-[3px] bg-purple-950/60 rounded-full overflow-hidden mt-2 relative">
              <motion.div
                className="h-full bg-[#a855f7] shadow-[0_0_12px_#a855f7]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
