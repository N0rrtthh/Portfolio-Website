"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import RevealText from "@/components/ui/RevealText";
import ChapterLabel from "@/components/ui/ChapterLabel";
import { PROJECTS } from "@/lib/data";

const EASING = [0.22, 1, 0.36, 1] as const;
const featured = PROJECTS.filter((p) => p.featured);

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  // Measure track overflow for horizontal scroll
  useEffect(() => {
    function measure() {
      if (!trackRef.current) return;
      setTrackWidth(trackRef.current.scrollWidth - window.innerWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Scroll progress for the pinned section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Map vertical scroll to horizontal position
  const x = useTransform(scrollYProgress, [0, 1], [0, -trackWidth]);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative"
      style={{ height: `${Math.max(300, trackWidth + window?.innerHeight || 2000)}px` }}
    >
      {/* Pinned viewport */}
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Header — always visible */}
        <div className="container-narrow relative z-10 pt-12">
          <ChapterLabel index={7} classic="Selected Work" eva="OPERATION LOG" className="mb-4" />
          <RevealText
            as="h2"
            className="text-section-title font-display text-[var(--color-starlight)]"
          >
            Case studies, built with craft.
          </RevealText>
        </div>

        {/* Horizontal track */}
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="absolute top-0 left-0 flex h-full items-center gap-12 pl-[clamp(1.5rem,5vw,4rem)] pr-[50vw] pt-36"
        >
          {/* Spacer for the header area */}
          <div className="w-[40vw] shrink-0" />

          {featured.map((project, i) => (
            <motion.article
              key={project.id}
              className="group relative flex h-[70vh] w-[75vw] max-w-[900px] shrink-0 flex-col justify-end overflow-hidden rounded-3xl border border-[var(--color-glass-border)] bg-[var(--color-obsidian)] p-10 md:p-14 transition-[border-color,box-shadow,transform] duration-[250ms] ease-out"
              data-hoverable
            >
              {/* Background gradient glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(ellipse at 30% 70%, ${project.color}15, transparent 60%)`,
                }}
                aria-hidden="true"
              />

              {/* Project image */}
              {project.image && (
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-obsidian)] via-[var(--color-obsidian)]/80 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="chapter-label">
                    {project.type} · {project.year}
                  </span>
                </div>

                <h3 className="font-display text-4xl font-bold text-[var(--color-starlight)] md:text-5xl">
                  {project.title}
                </h3>
                <p className="mt-2 font-body text-lg text-[var(--color-silver)]">
                  {project.subtitle}
                </p>

                <p className="mt-6 max-w-lg font-body text-sm leading-relaxed text-[var(--color-ash)]">
                  {project.description}
                </p>

                {/* Tech tags */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-[var(--color-glass-border)] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-silver)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="mt-8 flex items-center gap-4">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--color-glass-border)] px-5 py-2.5 font-body text-sm text-[var(--color-pearl)] transition-[border-color,box-shadow,transform] duration-[250ms] ease-out active:scale-[0.97] hover:border-[var(--color-accent-primary)] hover:shadow-[0_0_20px_rgba(67,97,238,0.1)]"
                      data-cursor-hover
                    >
                      <GitHubIcon size={14} /> Source
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--color-starlight)] px-5 py-2.5 font-body text-sm font-semibold text-[var(--color-void)] transition-[background-color,box-shadow,transform] duration-[250ms] ease-out active:scale-[0.97] hover:shadow-[0_8px_30px_rgba(240,240,250,0.15)]"
                      data-cursor-hover
                    >
                      Live site <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}

          {/* Experiments / non-featured — final scene */}
          <div className="flex h-[70vh] w-[60vw] max-w-[700px] shrink-0 flex-col justify-center">
            <span className="chapter-label mb-6">Experiments & Prototypes</span>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {PROJECTS.filter((p) => !p.featured).map((project) => (
                <a
                  key={project.id}
                  href={project.github ?? "#"}
                  target={project.github ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="glass group flex flex-col gap-3 rounded-xl p-5 transition-all duration-500 hover:border-white/15"
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
                      className="text-[var(--color-ash)] transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </div>
                  <h4 className="font-display text-lg text-[var(--color-starlight)]">
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
                </a>
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
    </section>
  );
}
