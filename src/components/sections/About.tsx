"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Smartphone, Gamepad2, Layers, ChevronDown, CheckCircle2, Quote } from "lucide-react";
import RevealText from "@/components/ui/RevealText";
import ChapterLabel from "@/components/ui/ChapterLabel";
import TiltCard from "@/components/ui/TiltCard";
import { SERVICES, PHILOSOPHY } from "@/lib/data";
import profilePic from "@/../public/profile.jpg";

const EASING = [0.22, 1, 0.36, 1] as const;

const SERVICE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  globe: Globe,
  smartphone: Smartphone,
  gamepad: Gamepad2,
  layers: Layers,
};

const PROCESS_STEPS = [
  { step: "01", title: "Problem Definition & Personas", desc: "Mapping user needs, pain points, and core metrics before writing code." },
  { step: "02", title: "Architecture & System Specs", desc: "Selecting modular tech stacks (React, Flutter, Node.js) built for performance." },
  { step: "03", title: "Motion & UI Craft", desc: "Designing responsive interfaces in Figma with spring physics and accessibility." },
  { step: "04", title: "Testing & Deployment", desc: "Automated test runs, Lighthouse optimization, and zero-downtime shipping." },
];

export default function About() {
  const [openService, setOpenService] = useState<number | null>(null);

  return (
    <section id="about" className="section-padding relative">
      <div className="container-narrow">
        <ChapterLabel index={2} classic="About" eva="PILOT DATA" className="mb-8" />

        {/* ── Editorial Headline ── */}
        <div className="mb-20">
          <RevealText
            as="h2"
            className="text-section-title font-display text-[var(--color-starlight)]"
          >
            Software engineer
          </RevealText>
          <RevealText
            as="h2"
            delay={0.1}
            className="text-section-title font-display text-[var(--color-silver)]"
          >
            by trade.
          </RevealText>
          <RevealText
            as="h2"
            delay={0.2}
            className="text-section-title font-display italic text-[var(--color-accent-primary)]"
          >
            Designer by obsession.
          </RevealText>
        </div>

        {/* ── Two-Column Asymmetric Storytelling Layout ── */}
        <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          {/* Left Column — Portrait + Biography + Philosophy */}
          <div className="flex flex-col gap-12">
            <motion.div
              initial={{ opacity: 0, x: -40, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1.2, ease: EASING }}
              className="w-full max-w-md"
            >
              <TiltCard max={4} className="overflow-hidden rounded-2xl border border-[var(--color-glass-border)] shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
                <Image
                  src={profilePic}
                  alt="Elroni Quiñones — profile portrait photo"
                  width={800}
                  height={1000}
                  className="h-auto w-full object-cover"
                />
              </TiltCard>
            </motion.div>

            {/* Bio Paragraphs */}
            <motion.div
              initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1.0, delay: 0.2, ease: EASING }}
              className="space-y-6 font-body text-lg leading-relaxed text-[var(--color-silver)] max-w-prose"
            >
              <p>
                I started as a full-stack developer and never stopped asking
                why the interfaces I shipped didn&apos;t feel as good as the
                code behind them. That question sent me into Figma, Blender,
                and motion design — and it hasn&apos;t let go since.
              </p>
              <p>
                As a Software Engineer Intern at{" "}
                <span className="text-[var(--color-pearl)] font-semibold">BidaBoss Inc.</span>,
                I built production systems in React, Node.js, and Flutter that
                real teams rely on daily. Outside of work, I build games in
                Godot, model in Blender, and prototype interfaces that push
                past the default template.
              </p>
            </motion.div>

            {/* Philosophy Pull-Quotes */}
            <div className="flex flex-col gap-8 border-t border-[var(--color-glass-border)] pt-10">
              <span className="chapter-label">Core Philosophy</span>
              {PHILOSOPHY.map((item, i) => (
                <motion.blockquote
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 1.0, delay: i * 0.15, ease: EASING }}
                  className="group border-l-2 border-[var(--color-accent-primary)]/40 pl-6 transition-colors duration-700 hover:border-[var(--color-accent-primary)]"
                >
                  <p className="font-display text-xl italic text-[var(--color-pearl)] transition-colors duration-700 group-hover:text-[var(--color-starlight)] md:text-2xl">
                    &ldquo;{item.title}&rdquo;
                  </p>
                  <p className="mt-2 font-body text-sm text-[var(--color-ash)]">
                    {item.description}
                  </p>
                </motion.blockquote>
              ))}
            </div>
          </div>

          {/* Right Column — Process, Services Accordion & Testimonial */}
          <div className="flex flex-col gap-10">
            {/* Currently Card */}
            <motion.div
              initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1.0, ease: EASING }}
              className="glass rounded-2xl p-8 border border-[var(--color-glass-border)]"
            >
              <span className="chapter-label">Current Focus</span>
              <ul className="mt-5 space-y-4 font-body text-[var(--color-pearl)]">
                {["Curious & methodical", "Pixel-perfect execution", "Full-stack & mobile development", "Game systems in Godot"].map(
                  (trait) => (
                    <li key={trait} className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-[var(--color-accent-primary)]" />
                      {trait}
                    </li>
                  )
                )}
              </ul>
            </motion.div>

            {/* Design & Engineering Process Steps */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: EASING }}
              className="glass rounded-2xl p-8 border border-[var(--color-glass-border)]"
            >
              <span className="chapter-label mb-5 block">How I Build (Process)</span>
              <div className="flex flex-col gap-5">
                {PROCESS_STEPS.map((step) => (
                  <div key={step.step} className="flex items-start gap-4">
                    <span className="font-mono text-xs text-[var(--color-accent-primary)] font-bold pt-1">
                      {step.step}
                    </span>
                    <div>
                      <h4 className="font-body text-sm font-semibold text-[var(--color-starlight)]">
                        {step.title}
                      </h4>
                      <p className="font-body text-xs text-[var(--color-silver)] mt-1">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Services Accordion */}
            <div>
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASING }}
                className="chapter-label mb-6 block"
              >
                Capabilities & Services
              </motion.span>

              <div className="flex flex-col gap-3">
                {SERVICES.map((service, i) => {
                  const Icon = SERVICE_ICONS[service.icon] ?? Layers;
                  const isOpen = openService === i;

                  return (
                    <motion.div
                      key={service.title}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-5%" }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: EASING }}
                    >
                      <button
                        onClick={() => setOpenService(isOpen ? null : i)}
                        className="glass w-full flex items-center justify-between rounded-xl px-6 py-5 text-left transition-[border-color,background-color,transform] duration-[250ms] ease-out active:scale-[0.98] hover:border-[var(--color-accent-primary)]/40"
                        data-cursor-hover
                      >
                        <div className="flex items-center gap-4">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-[var(--color-accent-primary)]">
                            <Icon size={18} />
                          </span>
                          <span className="font-body font-medium text-[var(--color-pearl)]">
                            {service.title}
                          </span>
                        </div>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.4, ease: EASING }}
                        >
                          <ChevronDown size={16} className="text-[var(--color-ash)]" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.5, ease: EASING }}
                            className="overflow-hidden"
                          >
                            <p className="px-6 py-4 font-body text-sm leading-relaxed text-[var(--color-silver)]">
                              {service.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Testimonial Recommendation Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: EASING }}
              className="rounded-2xl bg-[var(--color-graphite)] p-8 border border-[var(--color-glass-border)] relative"
            >
              <Quote size={24} className="text-[var(--color-accent-primary)] opacity-40 mb-3" />
              <p className="font-body text-sm italic text-[var(--color-pearl)] leading-relaxed">
                &ldquo;Elroni brings exceptional attention to detail. His ability to bridge user interface aesthetics with production-grade engineering delivered measurable results for our portal.&rdquo;
              </p>
              <div className="mt-4 pt-4 border-t border-[var(--color-glass-border)] flex items-center justify-between">
                <div>
                  <p className="font-body text-xs font-semibold text-[var(--color-starlight)]">
                    Engineering Team Lead
                  </p>
                  <p className="font-mono text-[10px] text-[var(--color-ash)]">
                    BidaBoss Inc.
                  </p>
                </div>
                <span className="font-mono text-[10px] text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 px-2.5 py-1 rounded-full border border-[var(--color-accent-primary)]/20">
                  Verified Colleague
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
