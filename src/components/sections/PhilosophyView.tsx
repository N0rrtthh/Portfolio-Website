"use client";

import { motion } from "framer-motion";
import RevealText from "@/components/ui/RevealText";
import ChapterLabel from "@/components/ui/ChapterLabel";
import { PHILOSOPHY } from "@/lib/data";

const EASING = [0.22, 1, 0.36, 1] as const;

export default function PhilosophyView() {
  return (
    <section id="philosophy" className="section-padding relative min-h-[85vh] flex flex-col justify-center">
      <div className="container-narrow">
        <ChapterLabel index={4} classic="Design Stance" eva="CORE PRINCIPLES" className="mb-8" />
        
        <RevealText
          as="h2"
          className="text-section-title mb-16 font-display text-[var(--color-starlight)]"
        >
          Design Philosophy.
        </RevealText>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PHILOSOPHY.map((item, i) => (
            <motion.blockquote
              key={item.title}
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1.0, delay: i * 0.15, ease: EASING }}
              className="glass group rounded-3xl p-8 border border-[var(--color-glass-border)] hover:border-[var(--color-accent-primary)]/40 transition-[border-color,box-shadow,transform] will-change-transform transform-gpu duration-[250ms] ease-out hover:shadow-[0_12px_40px_rgba(67,97,238,0.08)] flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs text-[var(--color-accent-primary)] block mb-4">
                  0{i + 1} // PRINCIPLE
                </span>
                <p className="font-display text-2xl font-bold text-[var(--color-starlight)] leading-snug mb-4">
                  &ldquo;{item.title}&rdquo;
                </p>
                <p className="font-body text-sm leading-relaxed text-[var(--color-silver)]">
                  {item.description}
                </p>
              </div>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
