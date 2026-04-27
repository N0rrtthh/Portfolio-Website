"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ShieldCheck, Award, Code2, Gamepad2, Sparkles, ArrowRight } from "lucide-react";
import RevealText from "@/components/ui/RevealText";
import ChapterLabel from "@/components/ui/ChapterLabel";

const EASING = [0.22, 1, 0.36, 1] as const;

interface TimelineNode {
  id: string;
  number: string;
  role: string;
  company: string;
  period: string;
  location: string;
  description: string;
  highlights: string[];
  tech: string[];
  icon: React.ComponentType<{ size?: number }>;
  badge: string;
}

const TIMELINE_DATA: TimelineNode[] = [
  {
    id: "exp-1",
    number: "01",
    role: "Software Engineer Intern",
    company: "BidaBoss Inc.",
    period: "2025 – Present",
    location: "Manila, Philippines",
    description: "Built production-grade operations web portal and companion mobile app serving live internal teams.",
    highlights: [
      "Engineered React & Node.js internal management portal",
      "Built cross-platform Flutter companion mobile app",
      "Implemented real-time synchronization with Firebase & WebSockets",
    ],
    tech: ["React", "Node.js", "Flutter", "Firebase", "TypeScript"],
    icon: ShieldCheck,
    badge: "PRODUCTION OUTPOST",
  },
  {
    id: "exp-2",
    number: "02",
    role: "Undergraduate Capstone Lead",
    company: "WaterWise Thesis Project",
    period: "2024 – 2025",
    location: "Calapan, Philippines",
    description: "Award-winning 2D/3D Godot game engine thesis project with custom shaders & environmental networking.",
    highlights: [
      "Awarded top honors for Undergraduate Capstone Excellence",
      "Designed custom HLSL/GDShader visual effects and fluid physics",
      "Built multiplayer networking and gamified learning mechanics",
    ],
    tech: ["Godot 4", "GDShader", "HLSL", "C#", "Blender 3D"],
    icon: Award,
    badge: "CAPSTONE EXCELLENCE",
  },
  {
    id: "exp-3",
    number: "03",
    role: "Open Source Maintainer",
    company: "GitHub Community",
    period: "2024 – Present",
    location: "Global / Remote",
    description: "Published and maintained developer productivity tools including ResuMaker and JasFocus timer applications.",
    highlights: [
      "Published ResuMaker — ATS-optimized markdown resume tool",
      "Created JasFocus — minimal Pomodoro timer with ambient sounds",
      "Maintained zero-dependency developer tools used worldwide",
    ],
    tech: ["Next.js", "Tailwind CSS", "Framer Motion", "TypeScript"],
    icon: Code2,
    badge: "OPEN SOURCE OUTPOST",
  },
  {
    id: "exp-4",
    number: "04",
    role: "Creative Technologist",
    company: "Godot 3D & WebGPU R&D",
    period: "2025 – Future",
    location: "R&D Lab",
    description: "Exploring real-time WebGL/WebGPU shaders, procedural mesh generation, and Godot 4 game architecture.",
    highlights: [
      "Real-time volumetric lighting & particle collision physics",
      "Procedural terrain and shader graph generation",
      "Cross-platform WebGPU rendering experiments",
    ],
    tech: ["Three.js", "WebGPU", "GLSL", "Godot Engine", "Anime.js"],
    icon: Gamepad2,
    badge: "FUTURE R&D LAB",
  },
];

export default function IndianaJonesTravelTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 60%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 25,
    restDelta: 0.001,
  });

  // Glowing red route path length
  const pathLength = useTransform(smoothProgress, [0, 1], [0, 1]);

  // Traveling marker coordinate interpolation along the curved timeline
  const markerY = useTransform(smoothProgress, [0, 1], ["0%", "92%"]);

  return (
    <section ref={containerRef} id="experience" className="section-padding relative select-none">
      {/* Blueprint Grid & Soft Radial Lighting Background */}
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] bg-[#FF3B3B]/10 z-0" />

      <div className="container-narrow relative z-10">
        <ChapterLabel index={5} classic="Expedition Timeline" eva="MISSION LOG" className="mb-8" />
        
        <RevealText
          as="h2"
          className="text-section-title mb-6 font-display text-[var(--color-starlight)]"
        >
          The Indiana Jones Travel Route.
        </RevealText>
        <p className="font-body text-base text-[var(--color-silver)] max-w-prose mb-16">
          Scroll down to draw the glowing red travel route connecting milestones across my engineering journey.
        </p>

        {/* Curved Timeline Container */}
        <div className="relative">
          {/* SVG Curved Travel Path Line (Desktop & Mobile) */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 -translate-x-1/2 w-8 pointer-events-none z-0">
            <svg
              className="h-full w-full overflow-visible"
              viewBox="0 0 40 1200"
              fill="none"
              preserveAspectRatio="none"
            >
              {/* Inactive Muted Route Path */}
              <path
                d="M 20,0 C 40,300 -0,600 40,900 C 0,1100 20,1200 20,1200"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="3"
                strokeDasharray="6 6"
              />

              {/* Active Glowing Red Indiana Jones Route Path */}
              <motion.path
                d="M 20,0 C 40,300 -0,600 40,900 C 0,1100 20,1200 20,1200"
                stroke="#FF3B3B"
                strokeWidth="4"
                strokeLinecap="round"
                style={{ pathLength }}
                className="drop-shadow-[0_0_12px_#FF3B3B]"
              />
            </svg>

            {/* Traveling Indiana Jones Red Marker Circle */}
            <motion.div
              style={{ top: markerY }}
              className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center justify-center"
            >
              {/* Red Glow Bloom Ring */}
              <div className="h-7 w-7 rounded-full bg-[#FF3B3B]/30 animate-ping absolute" />
              {/* Inner Core Circle */}
              <div className="h-4 w-4 rounded-full bg-[#FF3B3B] border-2 border-white shadow-[0_0_20px_#FF3B3B]" />
              {/* Sparkle Icon */}
              <Sparkles size={12} className="absolute text-yellow-300 animate-pulse" />
            </motion.div>
          </div>

          {/* Experience Cards Stack */}
          <div className="space-y-16 md:space-y-24">
            {TIMELINE_DATA.map((item, idx) => {
              const isEven = idx % 2 === 0;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className={`relative flex flex-col md:flex-row items-center ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Empty Spacer Column on Desktop */}
                  <div className="hidden md:block w-1/2" />

                  {/* Node Waypoint Marker on Line */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-void)] border-2 border-[#FF3B3B] text-[#FF3B3B] shadow-[0_0_15px_#FF3B3B] group cursor-pointer">
                    <span className="font-mono text-[10px] font-bold">{item.number}</span>
                  </div>

                  {/* Experience Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.8, delay: idx * 0.1, ease: EASING }}
                    className="ml-16 md:ml-0 md:w-[45%] glass group rounded-3xl p-8 border border-[var(--color-glass-border)] hover:border-[#FF3B3B]/50 transition-[border-color,box-shadow,transform] duration-[250ms] ease-out hover:shadow-[0_12px_45px_rgba(255,59,59,0.15)] hover:-translate-y-1 will-change-transform transform-gpu"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--color-glass-border)]">
                      <span className="font-mono text-[10px] font-bold tracking-widest text-[#FF3B3B] bg-[#FF3B3B]/10 px-3 py-1 rounded-full border border-[#FF3B3B]/20">
                        {item.badge}
                      </span>
                      <span className="font-mono text-xs text-[var(--color-ash)]">
                        {item.period} · {item.location}
                      </span>
                    </div>

                    {/* Role & Company */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF3B3B]/10 text-[#FF3B3B]">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold text-[var(--color-starlight)]">
                          {item.role}
                        </h3>
                        <span className="font-mono text-xs text-[var(--color-accent-primary)]">
                          {item.company}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="font-body text-sm leading-relaxed text-[var(--color-silver)] mb-4">
                      {item.description}
                    </p>

                    {/* Highlights */}
                    <ul className="space-y-1.5 mb-6">
                      {item.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2 font-body text-xs text-[var(--color-silver)]">
                          <ArrowRight size={12} className="text-[#FF3B3B] shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--color-glass-border)]">
                      {item.tech.map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[10px] text-[var(--color-silver)] bg-[var(--color-void)] px-2.5 py-1 rounded-md border border-[var(--color-glass-border)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
