"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TECH_STACK, type TechItem } from "@/lib/data";
import { techIconUrl } from "@/lib/techIcons";

const EASING = [0.22, 1, 0.36, 1] as const;

/**
 * Dual-rail tech conveyor.
 *
 * Chrome removed on purpose: the tool count header, the "hover to pause" pill,
 * the "hover a tool for detail" hint and the glass box that wrapped the rails
 * were all scaffolding around the cards rather than content. Each one also
 * carried its own vertical rhythm (`py-8` outer, `mb-6` header, `p-6` box,
 * `gap-6` between rails, a `min-h-[70px]` detail row), which is where the dead
 * space in this section came from. The cards and their motion are unchanged.
 *
 * Spacing now: nothing outside the rails, `gap-3` between the two of them.
 * There are no negative margins compensating for the deletions.
 */

/** Brand mark, on a light chip so dark logos (Next.js, Vercel) stay readable
 *  in both themes. Falls back to the item's emoji if unmapped. */
function TechMark({ tech }: { tech: TechItem }) {
  const url = techIconUrl(tech.name);

  if (!url) {
    return (
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl shadow-inner">
        {tech.icon}
      </span>
    );
  }

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
      {/* Icon URLs come from multiple remote vendors; native img keeps this path simple. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`${tech.name} logo`}
        className="h-full w-full object-contain"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    </span>
  );
}

function TechCard({
  tech,
  hoveredTech,
  onHover,
}: {
  tech: TechItem;
  hoveredTech: TechItem | null;
  onHover: (tech: TechItem | null) => void;
}) {
  const isHovered = hoveredTech?.name === tech.name;
  const isOtherHovered = hoveredTech !== null && !isHovered;

  return (
    <motion.div
      onMouseEnter={() => onHover(tech)}
      onMouseLeave={() => onHover(null)}
      animate={{
        scale: isHovered ? 1.05 : isOtherHovered ? 0.95 : 1,
        opacity: isOtherHovered ? 0.35 : 1,
      }}
      transition={{ duration: 0.3, ease: EASING }}
      className={`relative flex shrink-0 w-[210px] md:w-[230px] flex-col justify-between rounded-2xl border p-5 transition-[background-color,border-color,box-shadow,opacity] duration-[250ms] ease-out will-change-transform transform-gpu cursor-pointer select-none ${
        isHovered
          ? "bg-[var(--color-obsidian)] border-[var(--color-accent-primary)] shadow-[0_0_40px_rgba(67,97,238,0.4)] z-30"
          : "glass border-[var(--color-glass-border)] hover:border-white/40"
      }`}
      data-cursor-hover
    >
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <TechMark tech={tech} />
          <span className="rounded-full border border-[var(--color-accent-primary)]/30 bg-[var(--color-accent-primary)]/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-[var(--color-accent-primary)]">
            {tech.category}
          </span>
        </div>

        <h4 className="font-display text-base font-bold leading-snug text-[var(--color-starlight)]">
          {tech.name}
        </h4>
      </div>

      <div className="mt-4 flex items-center justify-end border-t border-white/10 pt-2.5 font-mono text-[10px] text-[var(--color-ash)]">
        <span className="font-bold text-[var(--color-accent-primary)]">
          {isHovered ? "ACTIVE ✦" : "INSPECT"}
        </span>
      </div>
    </motion.div>
  );
}

export default function TechStackConveyor() {
  const [hoveredTech, setHoveredTech] = useState<TechItem | null>(null);

  // Two rails, split down the middle, travelling in opposite directions.
  const trackA = useMemo(() => TECH_STACK.slice(0, Math.ceil(TECH_STACK.length / 2)), []);
  const trackB = useMemo(() => TECH_STACK.slice(Math.ceil(TECH_STACK.length / 2)), []);

  // Tripled so the -33.333% loop point lands on an identical frame.
  const loopTrackA = useMemo(() => [...trackA, ...trackA, ...trackA], [trackA]);
  const loopTrackB = useMemo(() => [...trackB, ...trackB, ...trackB], [trackB]);

  return (
    <div className="relative select-none">
      {/* Ambient glow behind the hovered card */}
      <AnimatePresence>
        {hoveredTech && (
          <motion.div
            initial={{ opacity: 0, transform: "scale(0.8)" }}
            animate={{ opacity: 0.35, transform: "scale(1.25)" }}
            exit={{ opacity: 0, transform: "scale(0.8)" }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[400px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent-primary)] blur-[140px]"
          />
        )}
      </AnimatePresence>

      <div className="relative flex flex-col gap-3">
        {/* Rail 1 — travels left */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex w-max gap-5"
            animate={{ x: ["0%", "-33.333%"] }}
            transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
          >
            {loopTrackA.map((tech, idx) => (
              <TechCard
                key={`trackA-${tech.name}-${idx}`}
                tech={tech}
                hoveredTech={hoveredTech}
                onHover={setHoveredTech}
              />
            ))}
          </motion.div>
        </div>

        {/* Rail 2 — travels right */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex w-max gap-5"
            animate={{ x: ["-33.333%", "0%"] }}
            transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
          >
            {loopTrackB.map((tech, idx) => (
              <TechCard
                key={`trackB-${tech.name}-${idx}`}
                tech={tech}
                hoveredTech={hoveredTech}
                onHover={setHoveredTech}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
