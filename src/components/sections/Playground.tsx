"use client";

import { motion } from "framer-motion";
import RevealText from "@/components/ui/RevealText";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import TiltCard from "@/components/ui/TiltCard";
import ChapterLabel from "@/components/ui/ChapterLabel";
import { PLAYGROUND } from "@/lib/data";

export default function Playground() {
  return (
    <section id="playground" className="section-padding relative">
      <div className="container-narrow">
        <ChapterLabel index={8} classic="Playground" eva="EXPERIMENTAL UNIT" className="mb-6" />
        <RevealText
          as="h2"
          className="text-section-title mb-4 font-display text-(--color-starlight)"
        >
          Where I experiment.
        </RevealText>
        <p className="mb-16 max-w-xl font-body text-(--color-silver)">
          Games, prototypes, and concepts built for the joy of building —
          no client, no deadline, just curiosity.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          {PLAYGROUND.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
              whileHover={{ y: -6 }}
            >
            <TiltCard
              max={5}
              className="group relative overflow-hidden rounded-2xl border border-(--color-glass-border) bg-(--color-obsidian) p-7"
            >
              <div
                className="pointer-events-none absolute -inset-16 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25"
                style={{
                  background: `radial-gradient(circle, ${item.color}, transparent 65%)`,
                }}
                aria-hidden="true"
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.github && (
                    <a
                      href={item.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${item.title} source code`}
                      className="text-(--color-ash) transition-colors hover:text-(--color-starlight)"
                      data-cursor-hover
                    >
                      <GitHubIcon size={16} />
                    </a>
                  )}
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-(--color-starlight)">
                  {item.title}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-(--color-silver)">
                  {item.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] uppercase tracking-wide text-(--color-ash)"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
