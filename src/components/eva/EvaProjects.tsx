"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PROJECTS } from "@/lib/data";
import { ArrowUpRight } from "lucide-react";

export default function EvaProjects() {
  return (
    <section id="projects" className="relative">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="mb-12 border-b-2 border-[var(--color-accent-primary)] pb-4 flex items-end justify-between"
      >
        <h2 className="font-display text-3xl font-bold text-[var(--color-accent-primary)] uppercase tracking-wider">
          Archive // Projects
        </h2>
        <span className="font-mono text-xs text-[var(--color-ash)]">RECORD COUNT: {PROJECTS.length}</span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {PROJECTS.map((project, index) => (
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            key={project.id}
            className="group relative border border-[var(--color-accent-primary)]/40 bg-[var(--color-obsidian)] p-7 hover:border-[var(--color-accent-warm)] transition-colors duration-200"
            data-cursor-hover
          >
            {/* HUD Corner Brackets */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--color-accent-warm)] opacity-60 group-hover:opacity-100" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--color-accent-warm)] opacity-60 group-hover:opacity-100" />
            
            {project.image && (
              <div className="relative w-full aspect-video mb-6 border border-[var(--color-glass-border)] overflow-hidden opacity-70 group-hover:opacity-100 transition-all duration-300">
                <Image 
                  src={project.image} 
                  alt={project.title} 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[var(--color-accent-primary)]/15 mix-blend-color pointer-events-none" />
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-[var(--color-accent-warm)] tracking-widest">
                FILE_{String(index + 1).padStart(2, '0')}
              </span>
              <span className="font-mono text-[10px] bg-[var(--color-accent-primary)]/20 px-2.5 py-1 text-[var(--color-pearl)] border border-[var(--color-accent-primary)]/30">
                {project.type.toUpperCase()}
              </span>
            </div>

            <h3 className="font-display text-2xl font-bold text-white uppercase mb-2">
              {project.title}
            </h3>
            
            <p className="font-mono text-xs text-[var(--color-silver)] mb-6 leading-relaxed">
              {project.subtitle}
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {project.technologies.map((tech) => (
                <span key={tech} className="text-[10px] uppercase font-mono tracking-wider border border-[var(--color-glass-border)] px-2.5 py-1 text-[var(--color-ash)]">
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex gap-4">
              {project.live && (
                <a 
                  href={project.live} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-white bg-[var(--color-accent-primary)] px-4 py-2 hover:bg-[var(--color-accent-warm)] hover:text-black flex items-center gap-2 transition-colors duration-200"
                >
                  DEPLOYMENT <ArrowUpRight size={14} />
                </a>
              )}
              {project.github && (
                <a 
                  href={project.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[var(--color-pearl)] border border-[var(--color-glass-border)] px-4 py-2 hover:border-[var(--color-accent-primary)] hover:text-white flex items-center gap-2 transition-colors duration-200"
                >
                  SOURCE_CODE
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
