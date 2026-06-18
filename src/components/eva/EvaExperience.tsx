"use client";

import { motion } from "framer-motion";
import { EXPERIENCES } from "@/lib/data";

export default function EvaExperience() {
  return (
    <section id="experience" className="relative py-32">
      <div className="container-narrow">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-16 border-b-2 border-[var(--color-accent-primary)] pb-4 flex items-end justify-between"
        >
          <h2 className="font-display text-3xl font-bold text-[var(--color-accent-primary)] uppercase tracking-wider">
            Log // Deployment History
          </h2>
          <span className="font-mono text-xs text-[var(--color-ash)]">
            RECORDS: {EXPERIENCES.length}
          </span>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-[1px] bg-[var(--color-accent-primary)]/30" />

          <div className="space-y-12">
            {EXPERIENCES.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pl-12 md:pl-20"
              >
                {/* Timeline dot */}
                <div className="absolute left-2.5 md:left-6.5 top-2 w-3 h-3 border-2 border-[var(--color-accent-warm)] bg-[var(--color-obsidian)]" />

                {/* Content card */}
                <div className="border border-[var(--color-accent-primary)]/40 bg-[var(--color-obsidian)] p-6 relative hover:border-[var(--color-accent-warm)] transition-colors group">
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--color-accent-warm)] opacity-60 group-hover:opacity-100" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--color-accent-warm)] opacity-60 group-hover:opacity-100" />

                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="font-mono text-[10px] bg-[var(--color-accent-primary)]/20 px-2.5 py-1 text-[var(--color-accent-warm)] border border-[var(--color-accent-primary)]/30 tracking-widest">
                      {exp.type.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs text-[var(--color-ash)]">
                      {exp.period}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-white mb-1">
                    {exp.role}
                  </h3>
                  <p className="font-mono text-sm text-[var(--color-accent-primary)] mb-4">
                    @ {exp.company}
                  </p>
                  <p className="font-mono text-xs text-[var(--color-silver)] leading-relaxed mb-4">
                    {exp.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-1.5">
                    {exp.highlights.map((h, j) => (
                      <div key={j} className="flex gap-2 font-mono text-xs text-[var(--color-pearl)]">
                        <span className="text-[var(--color-accent-warm)] shrink-0">&gt;</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
