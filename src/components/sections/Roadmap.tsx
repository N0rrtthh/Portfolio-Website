"use client";

import { motion } from "framer-motion";
import { Gamepad2, Code2, Sparkles, ArrowRight } from "lucide-react";
import RevealText from "@/components/ui/RevealText";
import ChapterLabel from "@/components/ui/ChapterLabel";

const EASING = [0.22, 1, 0.36, 1] as const;

const GOALS = [
  {
    icon: Gamepad2,
    tag: "Game Architecture",
    title: "Godot 3D Shader & Physics Systems",
    desc: "Expanding custom HLSL/GDShader visual effects and procedural generation mechanics in Godot 4.",
  },
  {
    icon: Code2,
    tag: "Open Source",
    title: "Developer Productivity Tools",
    desc: "Building lightweight, zero-dependency developer tools that optimize workflow speed and UI design precision.",
  },
  {
    icon: Sparkles,
    tag: "Creative WebGL",
    title: "Three.js & WebGPU Shaders",
    desc: "Exploring real-time volumetric lighting and particle physics shaders for immersive web environments.",
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="section-padding relative">
      <div className="container-narrow">
        <ChapterLabel index={9} classic="Looking Ahead" eva="FUTURE DIRECTIVES" className="mb-8" />
        <RevealText
          as="h2"
          className="text-section-title mb-16 font-display text-[var(--color-starlight)]"
        >
          Future Horizons & Experiments.
        </RevealText>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GOALS.map((goal, i) => {
            const Icon = goal.icon;
            return (
              <motion.div
                key={goal.title}
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.0, delay: i * 0.12, ease: EASING }}
                className="glass group rounded-3xl p-8 border border-[var(--color-glass-border)] hover:border-[var(--color-accent-primary)]/40 transition-[border-color,box-shadow,transform] will-change-transform transform-gpu duration-[250ms] ease-out hover:shadow-[0_12px_40px_rgba(67,97,238,0.08)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]">
                      <Icon size={20} />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 px-2.5 py-1 rounded-full">
                      {goal.tag}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[var(--color-starlight)] mb-3">
                    {goal.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-[var(--color-silver)]">
                    {goal.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[var(--color-glass-border)] flex items-center gap-2 font-mono text-xs text-[var(--color-ash)] group-hover:text-[var(--color-starlight)] transition-colors">
                  <span>In Active R&D</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
