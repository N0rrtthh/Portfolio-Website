"use client";

import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECTS, Project } from "@/lib/data";
import { ArrowUpRight, Cpu, Layers, Gamepad2, X, ExternalLink, Code2, Sparkles, Filter } from "lucide-react";
import { GitHubIcon } from "@/components/ui/BrandIcons";

import resumakerImg from "@/../public/projects/resumaker.png";
import jasfocusImg from "@/../public/projects/jasfocus.png";
import wavelengthImg from "@/../public/projects/wavelength.png";

const PROJECT_IMAGE_MAP: Record<string, StaticImageData> = {
  resumaker: resumakerImg,
  jasfocus: jasfocusImg,
  wavelength: wavelengthImg,
};

const CATEGORIES = ["ALL", "WEB APPS", "MOBILE", "GAMES"] as const;

export default function EvaProjects() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = PROJECTS.filter((project) => {
    if (activeCategory === "ALL") return true;
    if (activeCategory === "WEB APPS") return project.type.toLowerCase().includes("web") || project.type.toLowerCase().includes("full-stack");
    if (activeCategory === "MOBILE") return project.type.toLowerCase().includes("mobile");
    if (activeCategory === "GAMES") return project.type.toLowerCase().includes("game");
    return true;
  });

  return (
    <section id="projects" className="relative py-24">
      <div className="container-narrow">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-8 border-b-2 border-[var(--color-accent-primary)] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <h2 className="font-display text-3xl font-bold text-[var(--color-accent-primary)] uppercase tracking-wider">
              Archive // Projects Matrix
            </h2>
            <p className="font-mono text-xs text-[var(--color-silver)] mt-1">
              Interactive MAGI Data Repository — Click any file for full tactical schematic
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--color-ash)]">
            DISPLAYING: {filteredProjects.length} / {PROJECTS.length} RECORDS
          </span>
        </motion.div>

        {/* Filter Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-12 p-1.5 rounded-2xl border border-[var(--color-accent-primary)]/30 bg-[var(--color-obsidian)]/80 backdrop-blur-lg w-fit">
          <Filter size={14} className="text-[var(--color-accent-warm)] ml-2 mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              data-cursor-hover
              className={`relative px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider transition-all duration-300 ${
                activeCategory === cat
                  ? "text-black font-extrabold"
                  : "text-[var(--color-pearl)]/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {activeCategory === cat && (
                <motion.div
                  layoutId="eva-project-filter"
                  className="absolute inset-0 bg-[var(--color-accent-warm)] rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.5)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </div>

        {/* Projects Grid with Smooth Enlargement & Blur Hover Effects */}
        <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => {
              const mappedImg = PROJECT_IMAGE_MAP[project.id];

              return (
                <motion.article
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.035, y: -6 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="group relative border border-[var(--color-accent-primary)]/40 bg-[var(--color-obsidian)]/90 backdrop-blur-md p-7 hover:border-[var(--color-accent-warm)] hover:bg-[#080b18]/95 hover:backdrop-blur-2xl transition-all duration-500 rounded-2xl cursor-pointer shadow-xl hover:shadow-[0_15px_45px_rgba(122,0,255,0.35)]"
                  data-cursor-hover
                >
                  {/* HUD Corner Brackets */}
                  <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[var(--color-accent-warm)] opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[var(--color-accent-warm)] opacity-60 group-hover:opacity-100 transition-opacity" />

                  {/* Project Image Preview with smooth zoom and subtle ambient blur overlay */}
                  <div className="relative w-full aspect-video mb-6 border border-[var(--color-accent-primary)]/30 rounded-xl overflow-hidden bg-black group-hover:border-[var(--color-accent-warm)]/70 transition-colors">
                    {mappedImg ? (
                      <div className="relative w-full h-full overflow-hidden">
                        <Image
                          src={mappedImg}
                          alt={project.title}
                          width={800}
                          height={450}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-obsidian)] via-transparent to-transparent pointer-events-none z-10 opacity-70 group-hover:opacity-40 transition-opacity" />

                        {/* Interactive Smooth Blur Click Prompt Overlay */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-2 font-mono text-xs text-[var(--color-accent-warm)] font-bold tracking-widest z-20">
                          <Sparkles size={16} className="animate-spin" />
                          <span>CLICK FOR FULL SCHEMATIC</span>
                        </div>
                      </div>
                    ) : (
                      /* Tactical MAGI Blueprint Card for Projects without static image file */
                      <div
                        className="w-full h-full flex flex-col justify-between p-6 relative overflow-hidden"
                        style={{
                          background: `radial-gradient(circle at 50% 50%, ${project.color}25, #05070f 85%)`,
                        }}
                      >
                        {/* Background Grid Pattern */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

                        <div className="flex justify-between items-start z-10 font-mono text-[10px] text-[var(--color-accent-warm)]">
                          <span className="flex items-center gap-1.5 bg-black/70 px-2.5 py-1 border border-white/10 rounded-lg">
                            {project.type.includes("Game") ? (
                              <Gamepad2 size={12} className="text-purple-400" />
                            ) : project.type.includes("Mobile") ? (
                              <Layers size={12} className="text-cyan-400" />
                            ) : (
                              <Cpu size={12} className="text-blue-400" />
                            )}
                            {project.type.toUpperCase()}
                          </span>
                          <span className="text-[var(--color-ash)]">[SCHEMATIC_v{project.year}]</span>
                        </div>

                        <div className="z-10">
                          <h4 className="font-display text-xl font-black text-white tracking-wider uppercase drop-shadow-md">
                            {project.title}
                          </h4>
                          <p className="font-mono text-[11px] text-[var(--color-silver)] mt-1">
                            {project.subtitle}
                          </p>
                        </div>

                        <div className="flex items-center justify-between z-10 pt-2 border-t border-white/10 font-mono text-[9px] text-[var(--color-ash)]">
                          <span>STATUS: DEPLOYED</span>
                          <span className="text-emerald-400">ENCRYPTION: VERIFIED</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <span className="font-mono text-xs text-[var(--color-accent-warm)] tracking-widest">
                      FILE_{String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[10px] bg-[var(--color-accent-primary)]/20 px-2.5 py-1 text-[var(--color-pearl)] border border-[var(--color-accent-primary)]/30 rounded-md">
                      {project.type.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-white uppercase mb-2 group-hover:text-[var(--color-accent-warm)] transition-colors">
                    {project.title}
                  </h3>

                  <p className="font-mono text-xs text-[var(--color-silver)] mb-6 leading-relaxed line-clamp-2">
                    {project.subtitle}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] uppercase font-mono tracking-wider border border-[var(--color-glass-border)] px-2.5 py-1 text-[var(--color-ash)] rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="text-[10px] font-mono text-[var(--color-accent-warm)] px-2 py-1">
                        +{project.technologies.length - 4} MORE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10 font-mono text-xs text-[var(--color-accent-warm)]">
                    <span className="flex items-center gap-1 group-hover:underline">
                      VIEW TACTICAL DATA <ArrowUpRight size={14} />
                    </span>
                    <span className="text-[var(--color-ash)] text-[10px]">[{project.year}]</span>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Interactive Tactical Modal / Drawer when Project is clicked */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#070913] border-2 border-[var(--color-accent-warm)] p-6 sm:p-8 rounded-3xl shadow-[0_0_50px_rgba(57,255,20,0.3)] text-white scrollbar-thin"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-5 right-5 h-10 w-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white hover:bg-[var(--color-accent-warm)] hover:text-black transition-colors z-30"
                >
                  <X size={18} />
                </button>

                {/* Modal Title & Badges */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 font-mono text-xs text-[var(--color-accent-warm)] mb-2">
                    <Code2 size={16} />
                    <span>MAGI ANALYSIS // {selectedProject.id.toUpperCase()}</span>
                    <span className="text-[var(--color-ash)]">[{selectedProject.year}]</span>
                  </div>
                  <h3 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white">
                    {selectedProject.title}
                  </h3>
                  <p className="font-mono text-sm text-[var(--color-silver)] mt-1">
                    {selectedProject.subtitle}
                  </p>
                </div>

                {/* Modal Image / Preview */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 mb-6 bg-black">
                  {PROJECT_IMAGE_MAP[selectedProject.id] ? (
                    <Image
                      src={PROJECT_IMAGE_MAP[selectedProject.id]}
                      alt={selectedProject.title}
                      width={1000}
                      height={560}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col justify-center items-center p-8 text-center"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${selectedProject.color}35, #05070f 90%)`,
                      }}
                    >
                      <Cpu size={48} className="text-[var(--color-accent-warm)] mb-4 animate-pulse" />
                      <h4 className="font-display text-2xl font-bold uppercase">{selectedProject.title}</h4>
                      <p className="font-mono text-xs text-[var(--color-silver)] mt-2 max-w-md">
                        {selectedProject.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Extended Description */}
                <div className="space-y-4 mb-8 font-mono text-sm text-[var(--color-pearl)] leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h5 className="text-xs font-bold text-[var(--color-accent-warm)] uppercase tracking-wider">
                    &gt; ARCHITECTURAL OVERVIEW & PROBLEM SOLVED
                  </h5>
                  <p>{selectedProject.description}</p>
                </div>

                {/* Tech Stack List */}
                <div className="mb-8">
                  <h5 className="font-mono text-xs font-bold text-[var(--color-accent-warm)] uppercase tracking-wider mb-3">
                    MODULE TECH STACK
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-xs border border-[var(--color-accent-primary)]/50 bg-[var(--color-accent-primary)]/10 px-3.5 py-1.5 text-white rounded-xl font-semibold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* External Action Links */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                  {selectedProject.live && (
                    <a
                      href={selectedProject.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-xl bg-[var(--color-accent-warm)] text-black font-mono text-xs font-bold flex items-center gap-2 hover:bg-white transition-colors shadow-[0_0_20px_rgba(57,255,20,0.5)]"
                    >
                      <ExternalLink size={16} /> LIVE DEPLOYMENT
                    </a>
                  )}
                  {selectedProject.github && (
                    <a
                      href={selectedProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-white font-mono text-xs font-bold flex items-center gap-2 hover:border-[var(--color-accent-warm)] hover:text-[var(--color-accent-warm)] transition-colors"
                    >
                      <GitHubIcon className="w-4 h-4" /> VIEW SOURCE CODE
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
