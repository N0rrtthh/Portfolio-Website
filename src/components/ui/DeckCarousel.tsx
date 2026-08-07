"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import ChapterLabel from "@/components/ui/ChapterLabel";
import RevealText from "@/components/ui/RevealText";
import { PROJECTS } from "@/lib/data";

const CARDS = PROJECTS.filter((p) => p.featured);
const VISIBLE_STACK = 4; // how many cards show in the stack behind

// Per-card static offsets for the "resting stack" look
function getStackStyle(depth: number) {
  // depth 0 = top card, 1 = second, etc.
  return {
    y: depth * 10,
    rotate: depth % 2 === 0 ? depth * -1.8 : depth * 1.8,
    scale: 1 - depth * 0.04,
    zIndex: VISIBLE_STACK - depth,
    opacity: depth >= VISIBLE_STACK ? 0 : 1 - depth * 0.08,
  };
}

type Direction = "left" | "right";

export default function DeckCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>("left");
  const [isAnimating, setIsAnimating] = useState(false);
  const dragX = useMotionValue(0);
  const dragRotate = useTransform(dragX, [-300, 0, 300], [-25, 0, 25]);
  const dragOpacity = useTransform(dragX, [-200, -80, 0, 80, 200], [0, 1, 1, 1, 0]);

  const advance = useCallback((dir: Direction) => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    setIndex((prev) => (dir === "left"
      ? (prev + 1) % CARDS.length
      : (prev - 1 + CARDS.length) % CARDS.length
    ));
  }, [isAnimating]);

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 400) {
      advance(info.offset.x < 0 ? "left" : "right");
    }
    dragX.set(0);
  }, [advance, dragX]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") advance("right");
      if (e.key === "ArrowRight") advance("left");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance]);

  const project = CARDS[index];

  // Exit animation: card flies off in the swipe direction with arc
  const exitVariants = {
    left:  { x: -500, y: -80, rotate: -30, opacity: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    right: { x:  500, y: -80, rotate:  30, opacity: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container-narrow">
        <ChapterLabel index={8} classic="Quick Look" eva="DECK SCAN" className="mb-3" />
        <RevealText as="h2" className="text-section-title font-display text-[var(--color-starlight)] mb-4">
          Swipe through the work.
        </RevealText>
        <p className="font-body text-base text-[var(--color-silver)] mb-16 max-w-md">
          Drag, swipe, or use the arrows — each card is a project.
        </p>
      </div>

      <div className="relative flex flex-col items-center">
        {/* Card stack stage */}
        <div
          className="relative select-none"
          style={{ width: "clamp(300px, 42vw, 560px)", height: "clamp(380px, 52vw, 680px)" }}
        >
          {/* Render stack cards bottom-up (depth 3 → 1), then top card via AnimatePresence */}
          {Array.from({ length: Math.min(VISIBLE_STACK - 1, CARDS.length - 1) }).map((_, d) => {
            const depth = VISIBLE_STACK - 1 - d; // render deepest first
            const cardIndex = (index + depth) % CARDS.length;
            const card = CARDS[cardIndex];
            const s = getStackStyle(depth);
            return (
              <motion.div
                key={`stack-${depth}`}
                animate={{ y: s.y, rotate: s.rotate, scale: s.scale, opacity: s.opacity }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ zIndex: s.zIndex, position: "absolute", inset: 0 }}
                className="rounded-3xl overflow-hidden border border-[var(--color-glass-border)] bg-[var(--color-obsidian)] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              >
                {card.image && (
                  <Image src={card.image} alt={card.title} fill sizes="560px" className="object-cover opacity-30" />
                )}
                {!card.image && (
                  <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 40% 60%, ${card.color}18, transparent 70%)` }} />
                )}
              </motion.div>
            );
          })}

          {/* Top card — draggable, animated in/out */}
          <AnimatePresence
            mode="wait"
            onExitComplete={() => setIsAnimating(false)}
          >
            <motion.div
              key={project.id}
              style={{ x: dragX, rotate: dragRotate, opacity: dragOpacity, zIndex: VISIBLE_STACK + 1, position: "absolute", inset: 0 }}
              initial={{ scale: 0.88, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, rotate: 0, opacity: 1, x: 0 }}
              exit={exitVariants[direction]}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={handleDragEnd}
              className="rounded-3xl overflow-hidden border border-[var(--color-glass-border)] bg-[var(--color-obsidian)] shadow-[0_28px_80px_rgba(0,0,0,0.65)] cursor-grab active:cursor-grabbing"
              data-cursor-hover
            >
              {/* Project image */}
              {project.image && (
                <div className="absolute inset-0">
                  <Image src={project.image} alt={project.title} fill sizes="560px" className="object-cover opacity-40" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-obsidian)] via-[var(--color-obsidian)]/60 to-transparent" />
                </div>
              )}
              {!project.image && (
                <div
                  className="absolute inset-0"
                  style={{ background: `radial-gradient(ellipse at 35% 55%, ${project.color}28, transparent 65%)` }}
                />
              )}

              {/* Drag hint arrows */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-5 pointer-events-none opacity-20">
                <ChevronLeft size={28} className="text-white" />
                <ChevronRight size={28} className="text-white" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                {/* Color accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: project.color }} />

                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: project.color }} />
                  <span className="chapter-label">{project.type} · {project.year}</span>
                </div>

                <h3 className="font-display text-3xl font-bold text-[var(--color-starlight)] leading-tight">
                  {project.title}
                </h3>
                <p className="mt-1.5 font-body text-sm text-[var(--color-silver)] line-clamp-2">
                  {project.subtitle}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-[var(--color-glass-border)] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-silver)] bg-white/[0.04]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="flex gap-2">
                    {project.live && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 font-mono text-[11px] font-bold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
                      >
                        Live <ArrowUpRight size={11} />
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-glass-border)] bg-white/5 px-4 py-2 font-mono text-[11px] font-bold text-[var(--color-silver)] hover:text-white transition-colors"
                      >
                        GitHub <ArrowUpRight size={11} />
                      </a>
                    )}
                  </div>

                  <span className="font-mono text-[10px] text-[var(--color-ash)]">
                    {index + 1} / {CARDS.length}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="mt-10 flex items-center gap-5">
          <button
            onClick={() => advance("right")}
            disabled={isAnimating}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] text-[var(--color-silver)] hover:border-indigo-500/50 hover:text-white transition-all disabled:opacity-40"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {CARDS.map((_, i) => (
              <button
                key={i}
                onClick={() => { if (!isAnimating) { setDirection(i > index ? "left" : "right"); setIsAnimating(true); setIndex(i); } }}
                className={`rounded-full transition-all duration-300 ${
                  i === index ? "w-6 h-2 bg-indigo-400" : "w-2 h-2 bg-[var(--color-ash)] hover:bg-[var(--color-silver)]"
                }`}
                aria-label={`Go to ${CARDS[i].title}`}
              />
            ))}
          </div>

          <button
            onClick={() => advance("left")}
            disabled={isAnimating}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] text-[var(--color-silver)] hover:border-indigo-500/50 hover:text-white transition-all disabled:opacity-40"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <p className="mt-4 chapter-label">Drag or swipe the card</p>
      </div>
    </section>
  );
}
