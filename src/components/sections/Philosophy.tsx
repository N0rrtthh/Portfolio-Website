"use client";

import { motion } from "framer-motion";
import RevealText from "@/components/ui/RevealText";
import ChapterLabel from "@/components/ui/ChapterLabel";
import { PHILOSOPHY } from "@/lib/data";

export default function Philosophy() {
  return (
    <section id="philosophy" className="section-padding relative">
      <div className="container-narrow">
        <ChapterLabel index={7} classic="Philosophy" eva="DIRECTIVE" className="mb-6" />
        <RevealText
          as="h2"
          className="text-section-title mb-16 font-display text-(--color-starlight)"
        >
          How I think about the craft.
        </RevealText>

        <div className="flex flex-col divide-y divide-[var(--color-glass-border)]">
          {PHILOSOPHY.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group grid gap-4 py-10 transition-colors md:grid-cols-[auto_1fr] md:gap-12"
            >
              <span className="font-mono text-sm text-(--color-ash)">
                0{i + 1}
              </span>
              <div>
                <h3 className="font-display text-2xl font-semibold text-(--color-starlight) transition-colors group-hover:text-(--color-accent-cyan) md:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-2xl font-body text-(--color-silver)">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
