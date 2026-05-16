"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InkTransitionProps {
  isAnimating: boolean;
  origin: { x: number; y: number };
  targetTheme: string;
  onMidpoint: () => void;
  onComplete: () => void;
}

export default function InkSplatterTransition({
  isAnimating,
  origin,
  targetTheme,
  onMidpoint,
  onComplete,
}: InkTransitionProps) {
  const [stage, setStage] = useState<"idle" | "expanding" | "dissipating">("idle");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isAnimating) {
      setStage("idle");
      return;
    }

    setStage("expanding");

    // At 320ms, execute the theme state change behind the ink mask
    const midpointTimer = setTimeout(() => {
      onMidpoint();
      setStage("dissipating");
    }, 350);

    // At 680ms, complete the transition
    const endTimer = setTimeout(() => {
      setStage("idle");
      onComplete();
    }, 680);

    return () => {
      clearTimeout(midpointTimer);
      clearTimeout(endTimer);
    };
  }, [isAnimating, onMidpoint, onComplete]);

  if (!isAnimating && stage === "idle") return null;

  // Determine liquid fill color based on target mode/theme
  const fillColor =
    targetTheme === "eva"
      ? "#39ff14"
      : targetTheme === "light"
      ? "#f4f4f6"
      : "#050508";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pointer-events-auto fixed inset-0 z-[99999] overflow-hidden"
      >
        {/* Organic Liquid SVG Mask Layer */}
        <svg className="h-full w-full">
          <defs>
            <filter id="gooey">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>

          {/* Organic Expanding Blobs */}
          <g filter="url(#gooey)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const dist = stage === "expanding" ? 180 : 400;
              const cx = origin.x + Math.cos(rad) * dist * (i % 2 === 0 ? 1 : 1.4);
              const cy = origin.y + Math.sin(rad) * dist * (i % 2 === 0 ? 1 : 1.4);

              return (
                <motion.circle
                  key={i}
                  cx={origin.x}
                  cy={origin.y}
                  initial={{ r: 0, cx: origin.x, cy: origin.y }}
                  animate={{
                    r: stage === "expanding" ? [0, 180, 1200] : [1200, 1400, 0],
                    cx: [origin.x, cx, origin.x],
                    cy: [origin.y, cy, origin.y],
                  }}
                  transition={{
                    duration: stage === "expanding" ? 0.38 : 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  fill={fillColor}
                />
              );
            })}

            {/* Core Center Surge Circle */}
            <motion.circle
              cx={origin.x}
              cy={origin.y}
              initial={{ r: 0 }}
              animate={{
                r: stage === "expanding" ? 1600 : [1600, 0],
                opacity: stage === "dissipating" ? [1, 0] : 1,
              }}
              transition={{
                duration: stage === "expanding" ? 0.35 : 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              fill={fillColor}
            />
          </g>
        </svg>

        {/* Subtle Organic Telemetry Text when switching to EVA mode */}
        {targetTheme === "eva" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.05, 1.1] }}
            transition={{ duration: 0.6 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-sm tracking-widest text-[#39ff14] font-bold uppercase pointer-events-none"
          >
            // INITIATING NERV SYNCHRONIZATION //
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
