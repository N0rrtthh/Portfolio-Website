"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Layers } from "lucide-react";
import { TECH_STACK, type TechItem } from "@/lib/data";

const EASING = [0.22, 1, 0.36, 1] as const;

export default function TechStackConveyor() {
  const [hoveredTech, setHoveredTech] = useState<TechItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TECH_STACK.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TECH_STACK.length) % TECH_STACK.length);
  };

  return (
    <div className="relative py-8 select-none">
      {/* Ambient background glow when hovering a card */}
      <AnimatePresence>
        {hoveredTech && (
          <motion.div
            initial={{ opacity: 0, transform: "scale(0.8)" }}
            animate={{ opacity: 0.3, transform: "scale(1.25)" }}
            exit={{ opacity: 0, transform: "scale(0.8)" }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-[130px] bg-[var(--color-accent-primary)] z-0"
          />
        )}
      </AnimatePresence>

      {/* Carousel Controls Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30">
            <Layers size={16} />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-starlight)] font-bold">
            Interactive Stack Carousel ({TECH_STACK.length} Core Tools)
          </span>
        </div>

        {/* Prev / Next Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="flex h-10 w-10 items-center justify-center rounded-full glass border border-[var(--color-glass-border)] text-[var(--color-starlight)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/20 transition-[background-color,border-color,color,transform] duration-200 ease-out active:scale-[0.97] cursor-pointer"
            aria-label="Previous tech item"
            data-cursor-hover
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex h-10 w-10 items-center justify-center rounded-full glass border border-[var(--color-glass-border)] text-[var(--color-starlight)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/20 transition-[background-color,border-color,color,transform] duration-200 ease-out active:scale-[0.97] cursor-pointer"
            aria-label="Next tech item"
            data-cursor-hover
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Interactive Carousel Track */}
      <div className="relative overflow-hidden rounded-3xl p-4 md:p-6 glass border border-[var(--color-glass-border)]">
        <motion.div
          ref={carouselRef}
          className="flex gap-4 cursor-grab active:cursor-grabbing py-4"
          drag="x"
          dragConstraints={{ left: -1200, right: 0 }}
          animate={{ x: -currentIndex * 240 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {TECH_STACK.map((tech) => {
            const isHovered = hoveredTech?.name === tech.name;
            const isAnyHovered = hoveredTech !== null;
            const isOtherHovered = isAnyHovered && !isHovered;

            return (
              <motion.div
                key={tech.name}
                onMouseEnter={() => setHoveredTech(tech)}
                onMouseLeave={() => setHoveredTech(null)}
                animate={{
                  scale: isHovered ? 1.05 : isOtherHovered ? 0.95 : 1,
                  opacity: isOtherHovered ? 0.35 : 1,
                }}
                transition={{ duration: 0.3, ease: EASING }}
                className={`relative shrink-0 w-[200px] md:w-[220px] rounded-2xl p-6 border transition-[background-color,border-color,box-shadow,transform,opacity] duration-[250ms] ease-out will-change-transform transform-gpu flex flex-col justify-between select-none ${
                  isHovered
                    ? "bg-[var(--color-obsidian)] border-[var(--color-accent-primary)] shadow-[0_0_40px_rgba(67,97,238,0.4)] z-30 scale-105"
                    : "glass border-[var(--color-glass-border)] hover:border-white/30"
                }`}
                data-cursor-hover
              >
                {/* Icon & Category Tag */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-4xl h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      {tech.icon}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 px-2.5 py-1 rounded-full border border-[var(--color-accent-primary)]/20">
                      {tech.category}
                    </span>
                  </div>

                  <h4 className="font-display text-lg font-bold text-[var(--color-starlight)] leading-snug">
                    {tech.name}
                  </h4>
                </div>

                {/* Footer telemetry */}
                <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-[var(--color-ash)]">
                  <span>MODULE // READY</span>
                  <span className="text-[var(--color-accent-primary)] font-bold">
                    {isHovered ? "ACTIVE ✦" : "INSPECT"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Selected / Hovered Detailed Node Breakdown Card */}
      <div className="min-h-[70px] mt-6 flex justify-center items-center">
        <AnimatePresence mode="wait">
          {hoveredTech ? (
            <motion.div
              key={hoveredTech.name}
              initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(6px)" }}
              transition={{ duration: 0.3, ease: EASING }}
              className="glass rounded-full px-8 py-3.5 border border-[var(--color-accent-primary)]/60 flex items-center gap-4 text-center shadow-[0_0_30px_rgba(67,97,238,0.25)]"
            >
              <span className="text-2xl">{hoveredTech.icon}</span>
              <span className="font-display text-base font-bold text-[var(--color-starlight)]">
                {hoveredTech.name}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)] animate-ping" />
              <span className="font-mono text-xs text-[var(--color-accent-primary)] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={14} />
                {hoveredTech.category} MODULE ACTIVE
              </span>
            </motion.div>
          ) : (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono text-xs text-[var(--color-ash)] tracking-widest uppercase flex items-center gap-2"
            >
              <Sparkles size={14} className="text-[var(--color-accent-primary)]" />
              Hover or drag any card to highlight technology & blur surrounding stack
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
