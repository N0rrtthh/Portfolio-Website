"use client";

import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, X, ExternalLink, Sparkles, Layers, Image as ImageIcon } from "lucide-react";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import RevealText from "@/components/ui/RevealText";
import ChapterLabel from "@/components/ui/ChapterLabel";
import { PROJECTS, type Project } from "@/lib/data";

const EASING = [0.22, 1, 0.36, 1] as const;
const featured = PROJECTS.filter((p) => p.featured);

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [viewportH, setViewportH] = useState(900);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Measure track overflow for horizontal scroll
  useEffect(() => {
    function measure() {
      if (!trackRef.current) return;
      setTrackWidth(trackRef.current.scrollWidth - window.innerWidth);
      setViewportH(window.innerHeight);
    }
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Scroll progress for the pinned section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Map vertical scroll to horizontal position
  const x = useTransform(scrollYProgress, [0, 1], [0, -trackWidth]);
  const sectionHeight = Math.max(300, trackWidth + viewportH);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative"
      style={{ height: sectionHeight }}
    >
      {/* Pinned viewport */}
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Header — always visible, positioned safely below sticky navbar */}
        <div className="container-narrow relative z-20 pt-24 sm:pt-28 md:pt-32">
          <ChapterLabel index={7} classic="Selected Work" eva="OPERATION LOG" className="mb-3" />
          <RevealText
            as="h2"
            className="text-section-title font-display text-[var(--color-starlight)]"
          >
            Projects, built with craft.
          </RevealText>
        </div>

        {/* Horizontal track — vertically centered scroll track with original spacing */}
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="absolute top-0 left-0 flex h-full items-center gap-12 pl-[clamp(1.5rem,5vw,4rem)] pr-[50vw] pt-20 pb-10 z-10"
        >
          {/* Original spacer for the header area */}
          <div className="w-[40vw] shrink-0" />

          {featured.map((project, i) => (
            <motion.article
              key={project.id}
              whileHover={{ scale: 1.02, y: -6 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={() => setSelectedProject(project)}
              className="group relative flex h-[70vh] w-[75vw] max-w-[900px] shrink-0 flex-col justify-end overflow-hidden rounded-3xl border border-[var(--color-glass-border)] bg-[var(--color-obsidian)] p-10 md:p-14 transition-[border-color,box-shadow] duration-300 ease-out shadow-[0_20px_50px_rgba(0,0,0,0.55)] cursor-pointer hover:border-indigo-500/50 hover:shadow-[0_25px_60px_rgba(99,102,241,0.2)]"
              data-hoverable
              data-cursor-hover
            >
              {/* Background gradient glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(ellipse at 30% 70%, ${project.color}25, transparent 60%)`,
                }}
                aria-hidden="true"
              />

              {/* Project image */}
              {project.image && (
                <div className="absolute inset-0 opacity-20 group-hover:opacity-35 transition-opacity duration-700">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 900px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-obsidian)] via-[var(--color-obsidian)]/80 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full animate-pulse"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="chapter-label">
                      {project.type} · {project.year}
                    </span>
                  </div>

                  {/* VIEW PROJECT DETAILS BUTTON BADGE */}
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-950/60 px-4 py-1.5 font-mono text-[11px] font-bold text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md">
                    <span>VIEW PROJECT DETAILS</span>
                    <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </div>

                <h3 className="font-display text-4xl font-bold text-[var(--color-starlight)] md:text-5xl group-hover:text-indigo-300 transition-colors">
                  {project.title}
                </h3>
                <p className="mt-2 font-body text-lg text-[var(--color-silver)]">
                  {project.subtitle}
                </p>

                <p className="mt-4 max-w-lg font-body text-sm leading-relaxed text-[var(--color-ash)] line-clamp-3">
                  {project.description}
                </p>

                {/* Tech tags */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-[var(--color-glass-border)] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-silver)] bg-white/[0.03]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}

          {/* Experiments / non-featured — final scene */}
          <div className="flex h-[70vh] w-[60vw] max-w-[700px] shrink-0 flex-col justify-center">
            <span className="chapter-label mb-6">Experiments & Prototypes</span>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {PROJECTS.filter((p) => !p.featured).map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="glass group flex flex-col gap-3 rounded-2xl p-5 transition-all duration-300 hover:border-indigo-500/40 hover:bg-white/[0.06] cursor-pointer"
                  data-cursor-hover
                  data-hoverable
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <ArrowUpRight
                      size={14}
                      className="text-[var(--color-ash)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-400"
                    />
                  </div>
                  <h4 className="font-display text-lg text-[var(--color-starlight)] group-hover:text-white transition-colors">
                    {project.title}
                  </h4>
                  <p className="font-body text-xs text-[var(--color-silver)]">
                    {project.subtitle}
                  </p>
                  <div className="mt-auto flex gap-2">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-ash)]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Progress indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
          <span className="chapter-label">
            Scroll to explore
          </span>
          <div className="h-[1px] w-16 bg-[var(--color-glass-border)] overflow-hidden">
            <motion.div
              className="h-full bg-[var(--color-accent-primary)]"
              style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
            />
          </div>
        </div>
      </div>

      {/* PORTAL PROJECT INSPECTOR MODAL WITH PHOTO PREVIEW — Mounted to document.body */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedProject && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setSelectedProject(null)}
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md select-none pointer-events-auto overflow-hidden"
              >
                <motion.div
                  initial={{ scale: 0.94, opacity: 0, y: 16 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.94, opacity: 0, y: 16 }}
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-none rounded-[2rem] border border-white/10 bg-[#0a0a12]/98 p-6 sm:p-8 text-white shadow-[0_32px_100px_rgba(0,0,0,0.9)] flex flex-col z-[100000]"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10 mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full animate-pulse"
                          style={{ backgroundColor: selectedProject.color }}
                        />
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-indigo-400">
                          {selectedProject.type} · {selectedProject.year}
                        </span>
                      </div>
                      <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                        {selectedProject.title}
                      </h3>
                      <p className="font-body text-sm sm:text-base text-slate-300 mt-0.5">
                        {selectedProject.subtitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedProject(null)}
                      className="shrink-0 h-10 px-4 rounded-full bg-white/10 hover:bg-white/15 flex items-center gap-2 text-slate-300 hover:text-white transition-all font-mono text-xs font-bold uppercase tracking-wider cursor-pointer border border-white/10"
                    >
                      <X size={16} />
                      Close
                    </button>
                  </div>

                  {/* HIGH-END MAC BROWSER WINDOW SHOWCASE PREVIEW */}
                  <div className="relative w-full rounded-2xl border border-white/15 bg-slate-950 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] mb-6 shrink-0">
                    {/* Window Controls & Address Bar */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-white/10 select-none">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                        <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                        <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                      </div>

                      <div className="flex-1 max-w-sm mx-4 bg-slate-950/90 rounded-lg px-3.5 py-1 border border-white/10 text-center flex items-center justify-center gap-2 shadow-inner">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-mono text-[11px] text-slate-300 truncate">
                          {selectedProject.live
                            ? selectedProject.live.replace("https://", "")
                            : `https://${selectedProject.id}.app`}
                        </span>
                      </div>

                      <div className="hidden sm:block text-right">
                        <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          HD 1080P SHOWCASE
                        </span>
                      </div>
                    </div>

                    {/* Image Viewport Container */}
                    <div className="relative w-full aspect-[16/9] min-h-[260px] sm:min-h-[340px] md:min-h-[400px] bg-slate-950 overflow-hidden group/browser flex items-center justify-center">
                      {selectedProject.image ? (
                        <Image
                          src={selectedProject.image}
                          alt={`${selectedProject.title} screenshot`}
                          fill
                          sizes="(max-width: 768px) 100vw, 900px"
                          className="object-cover object-top group-hover/browser:scale-105 transition-all duration-700"
                          priority
                        />
                      ) : (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden"
                          style={{
                            background: `radial-gradient(ellipse at 50% 50%, ${selectedProject.color}40, #07070e 85%)`,
                          }}
                        >
                          <span className="font-mono text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3 border border-indigo-500/30 bg-indigo-950/70 px-4 py-1.5 rounded-full flex items-center gap-2">
                            <ImageIcon size={14} /> LIVE APPLICATION PREVIEW
                          </span>
                          <h4 className="font-display text-3xl sm:text-5xl font-black text-white text-center tracking-tight">
                            {selectedProject.title}
                          </h4>
                          <p className="font-body text-sm text-slate-300 mt-2 max-w-lg text-center leading-relaxed">
                            {selectedProject.subtitle}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Grid: Problem, Solution, Outcome */}
                  <div className="space-y-6 flex-1">
                    <div>
                      <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                        Project Summary
                      </h4>
                      <p className="font-body text-sm sm:text-base leading-relaxed text-slate-200">
                        {selectedProject.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                        <h5 className="font-mono text-[11px] font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                          The Problem
                        </h5>
                        <p className="font-body text-xs text-slate-300 leading-relaxed">
                          {selectedProject.problem}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                        <h5 className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                          The Solution
                        </h5>
                        <p className="font-body text-xs text-slate-300 leading-relaxed">
                          {selectedProject.solution}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                        <h5 className="font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          The Outcome
                        </h5>
                        <p className="font-body text-xs text-slate-300 leading-relaxed">
                          {selectedProject.outcome}
                        </p>
                      </div>
                    </div>

                    {/* Tech Stack Badges */}
                    <div className="pt-2">
                      <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                        Technologies & Frameworks
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3 py-1 font-mono text-xs font-semibold text-indigo-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Links */}
                  <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {selectedProject.github && (
                        <a
                          href={selectedProject.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 font-mono text-xs font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
                        >
                          <GitHubIcon size={14} /> View GitHub Source
                        </a>
                      )}
                      {selectedProject.live && (
                        <a
                          href={selectedProject.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 font-mono text-xs font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                        >
                          Launch Live Site <ArrowUpRight size={14} />
                        </a>
                      )}
                    </div>

                    <span className="font-mono text-[11px] text-slate-400">
                      AUTHENTICATED PROJECT DOSSIER // NRTH
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}
