"use client";

import { motion } from "framer-motion";
import { TECH_STACK } from "@/lib/data";

// Group by category
const categories = TECH_STACK.reduce((acc, tech) => {
  if (!acc[tech.category]) acc[tech.category] = [];
  acc[tech.category].push(tech);
  return acc;
}, {} as Record<string, typeof TECH_STACK>);

export default function EvaTechStack() {
  return (
    <section id="techstack" className="relative py-32">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-16 border-b-2 border-[var(--color-accent-primary)] pb-4 flex justify-between items-end"
        >
          <h2 className="font-display text-3xl font-bold text-[var(--color-accent-primary)] uppercase tracking-wider">
            Database // Technology Manifest
          </h2>
          <span className="font-mono text-xs text-[var(--color-ash)]">
            MODULES: {TECH_STACK.length}
          </span>
        </motion.div>

        {/* Categorized tech grid */}
        <div className="space-y-10">
          {Object.entries(categories).map(([category, techs], catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: catIndex * 0.08 }}
            >
              {/* Category header */}
              <div className="flex items-center gap-4 mb-4">
                <span className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-accent-warm)] bg-[var(--color-accent-warm)]/10 px-3 py-1 border border-[var(--color-accent-warm)]/30">
                  {category.toUpperCase()}
                </span>
                <div className="flex-1 h-[1px] bg-[var(--color-accent-primary)]/20" />
                <span className="font-mono text-[10px] text-[var(--color-ash)]">
                  [{techs.length}]
                </span>
              </div>

              {/* Tech items */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {techs.map((tech, i) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className="group border border-[var(--color-accent-primary)]/25 bg-[var(--color-obsidian)] p-3 hover:border-[var(--color-accent-warm)] transition-all duration-200 hover:shadow-[0_0_15px_rgba(122,0,255,0.1)]"
                    data-cursor-hover
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm shrink-0">{tech.icon}</span>
                      <span className="font-mono text-xs font-bold text-[var(--color-pearl)] group-hover:text-[var(--color-accent-warm)] transition-colors truncate">
                        {tech.name}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
