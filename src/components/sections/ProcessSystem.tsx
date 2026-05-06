"use client";

import { motion } from "framer-motion";
import { Search, Cpu, Palette, Rocket } from "lucide-react";
import RevealText from "@/components/ui/RevealText";
import ChapterLabel from "@/components/ui/ChapterLabel";

const EASING = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    num: "01",
    icon: Search,
    title: "Problem Definition & User Personas",
    desc: "Mapping pain points, user personas, and target business metrics before writing a single line of code.",
  },
  {
    num: "02",
    icon: Cpu,
    title: "Architecture & System Design",
    desc: "Selecting modular tech stacks (React, Flutter, Node.js) structured for maintainability and 99.9% uptime.",
  },
  {
    num: "03",
    icon: Palette,
    title: "Motion & UI Craft",
    desc: "Designing responsive interfaces in Figma with spring physics, glassmorphism, and WCAG AA accessibility.",
  },
  {
    num: "04",
    icon: Rocket,
    title: "Testing & Deployment",
    desc: "Automated test runs, Lighthouse performance optimization, and zero-downtime shipping to production.",
  },
];

export default function ProcessSystem() {
  return (
    <section id="process" className="section-padding relative min-h-[85vh] flex flex-col justify-center">
      <div className="container-narrow">
        <ChapterLabel index={3} classic="How I Build" eva="OPERATIONAL PROTOCOL" className="mb-8" />
        
        <RevealText
          as="h2"
          className="text-section-title mb-16 font-display text-[var(--color-starlight)]"
        >
          Engineering Method & Process.
        </RevealText>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: EASING }}
                className="glass group rounded-3xl p-8 border border-[var(--color-glass-border)] hover:border-[var(--color-accent-primary)]/40 transition-[border-color,box-shadow,transform] will-change-transform transform-gpu duration-[250ms] ease-out hover:shadow-[0_12px_40px_rgba(67,97,238,0.1)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs font-bold text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 px-3 py-1 rounded-full border border-[var(--color-accent-primary)]/20">
                      STEP {step.num}
                    </span>
                    <Icon size={20} className="text-[var(--color-accent-primary)] group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-body text-lg font-bold text-[var(--color-starlight)] mb-3">
                    {step.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-[var(--color-silver)]">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
