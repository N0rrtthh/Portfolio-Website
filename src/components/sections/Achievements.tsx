"use client";

import { motion } from "framer-motion";
import { Trophy, Star, ShieldCheck, Zap } from "lucide-react";
import RevealText from "@/components/ui/RevealText";
import ChapterLabel from "@/components/ui/ChapterLabel";

const EASING = [0.22, 1, 0.36, 1] as const;

const ACHIEVEMENTS_DATA = [
  {
    icon: Trophy,
    title: "Thesis Capstone Excellence",
    organization: "Undergraduate Capstone 2026",
    description: "Awarded top honors for WaterWise — an end-to-end 2D/3D Godot game with multiplayer networking & thesis alignment.",
  },
  {
    icon: ShieldCheck,
    title: "Production System Reliability",
    organization: "BidaBoss Inc. Operations",
    description: "Built and deployed enterprise React + Node.js portal and companion Flutter app serving live internal teams.",
  },
  {
    icon: Star,
    title: "Open Source Contributor",
    organization: "GitHub Community",
    description: "Published and maintained open-source developer tools including ResuMaker and JasFocus timer apps.",
  },
];

const METRICS_COUNTERS = [
  { label: "Production Latency", value: "< 400ms" },
  { label: "UI Accessibility Score", value: "100%" },
  { label: "Build Reliability", value: "99.9%" },
  { label: "Active Users Served", value: "30,000+" },
];

export default function Achievements() {
  return (
    <section id="achievements" className="section-padding relative">
      <div className="container-narrow">
        <ChapterLabel index={8} classic="Achievements & Metrics" eva="VALUATION LOG" className="mb-8" />
        <RevealText
          as="h2"
          className="text-section-title mb-16 font-display text-[var(--color-starlight)]"
        >
          Impact & Proof of Craft.
        </RevealText>

        {/* Animated Impact Metrics Counters */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-16">
          {METRICS_COUNTERS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: EASING }}
              className="glass rounded-2xl p-6 border border-[var(--color-glass-border)] text-center group hover:border-[var(--color-accent-primary)]/40 transition-colors"
            >
              <Zap size={18} className="text-[var(--color-accent-primary)] mx-auto mb-2 opacity-60 group-hover:opacity-100 transition-opacity" />
              <p className="font-display text-3xl font-extrabold text-[var(--color-starlight)]">
                {m.value}
              </p>
              <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-ash)] mt-1">
                {m.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Achievements & Recognition Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ACHIEVEMENTS_DATA.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.0, delay: i * 0.12, ease: EASING }}
                className="glass group rounded-3xl p-8 border border-[var(--color-glass-border)] hover:border-[var(--color-accent-primary)]/40 transition-[border-color,box-shadow,transform] will-change-transform transform-gpu duration-[250ms] ease-out hover:shadow-[0_12px_40px_rgba(67,97,238,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] mb-6 group-hover:scale-110 transition-transform">
                  <Icon size={22} />
                </div>
                <h3 className="font-display text-xl font-bold text-[var(--color-starlight)] mb-1">
                  {item.title}
                </h3>
                <span className="font-mono text-xs text-[var(--color-accent-primary)] block mb-4">
                  {item.organization}
                </span>
                <p className="font-body text-sm leading-relaxed text-[var(--color-silver)]">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
