"use client";

import RevealText from "@/components/ui/RevealText";
import ChapterLabel from "@/components/ui/ChapterLabel";
import TechStackConveyor from "@/components/ui/TechStackConveyor";
import AnimeStaggerGrid from "@/components/ui/AnimeStaggerGrid";

export default function TechStack() {
  return (
    <section id="techstack" className="section-padding relative overflow-hidden">
      <div id="tech-stack" className="scroll-mt-24" />
      <div className="container-narrow">
        <ChapterLabel index={6} classic="Tech Stack" eva="EQUIPMENT MANIFEST" className="mb-8" />
        <RevealText
          as="h2"
          className="text-section-title mb-6 font-display text-[var(--color-starlight)]"
        >
          Tools & Tech Stack.
        </RevealText>
        <p className="font-body text-base text-[var(--color-silver)] max-w-prose mb-8">
          A continuous moving ecosystem of technologies I engineer with daily — across full-stack, mobile, game engines, and design systems.
        </p>

        {/* Premium Continuous Moving Horizontal Conveyor System */}
        <TechStackConveyor />

        {/* Interactive Anime.js Motion Grid Matrix */}
        <div className="mt-16 glass rounded-2xl p-8 border border-[var(--color-glass-border)] flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="chapter-label block mb-2">Anime.js Motion Stagger Matrix</span>
            <p className="font-body text-sm text-[var(--color-silver)] max-w-md">
              Hover over matrix nodes to trigger coordinate ripple waves powered by Anime.js spring physics algorithms.
            </p>
          </div>
          <div className="flex justify-center overflow-hidden p-2">
            <AnimeStaggerGrid rows={6} columns={14} />
          </div>
        </div>
      </div>
    </section>
  );
}
