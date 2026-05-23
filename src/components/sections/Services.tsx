"use client";

import { motion } from "framer-motion";
import { Globe, Smartphone, Gamepad2, Layers } from "lucide-react";
import RevealText from "@/components/ui/RevealText";
import TiltCard from "@/components/ui/TiltCard";
import ChapterLabel from "@/components/ui/ChapterLabel";
import { SERVICES } from "@/lib/data";

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  globe: Globe,
  smartphone: Smartphone,
  gamepad: Gamepad2,
  layers: Layers,
};

export default function Services() {
  return (
    <section id="services" className="section-padding relative">
      <div className="container-narrow">
        <ChapterLabel index={6} classic="Services" eva="CAPABILITIES" className="mb-6" />
        <RevealText
          as="h2"
          className="text-section-title mb-16 font-display text-(--color-starlight)"
        >
          What I can build for you.
        </RevealText>

        <div className="grid gap-6 sm:grid-cols-2">
          {SERVICES.map((service, i) => {
            const Icon = ICONS[service.icon] ?? Layers;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
              >
                <TiltCard max={6} className="glass h-full rounded-3xl p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-(--color-accent-cyan)">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-lg text-(--color-starlight)">
                    {service.title}
                  </h3>
                  <p className="mt-3 font-body text-(--color-silver)">
                    {service.description}
                  </p>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
