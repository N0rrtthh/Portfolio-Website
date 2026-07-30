"use client";

import dynamic from "next/dynamic";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import AboutStory from "@/components/sections/AboutStory";
import ProcessSystem from "@/components/sections/ProcessSystem";
import PhilosophyView from "@/components/sections/PhilosophyView";
import TechStack from "@/components/sections/TechStack";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";

// Heavy / below-fold sections: defer JS parse+eval until after first paint.
const Experience = dynamic(() => import("@/components/sections/Experience"), {
  ssr: false,
  loading: () => (
    <div
      id="experience"
      className="relative h-[40vh] w-full bg-[#05060b]"
      aria-hidden
    />
  ),
});
const GithubContributions = dynamic(
  () => import("@/components/sections/GithubContributions"),
  { ssr: false }
);
const Certifications = dynamic(
  () => import("@/components/sections/Certifications"),
  { ssr: false }
);
const Achievements = dynamic(() => import("@/components/sections/Achievements"), {
  ssr: false,
});
const Roadmap = dynamic(() => import("@/components/sections/Roadmap"), {
  ssr: false,
});

export default function ClassicLayout() {
  return (
    <SmoothScrollProvider>
      <Navbar />
      <main>
        {/* Chapter 1 — Arrival */}
        <Hero />
        {/* Chapter 2 — Who I Am */}
        <AboutStory />
        {/* Chapter 3 — How I Build */}
        <ProcessSystem />
        {/* Chapter 4 — Core Philosophy */}
        <PhilosophyView />
        {/* Chapter 5 — Live GitHub Commit Stream & Activity Archive */}
        <GithubContributions />
        {/* Chapter 6 — The Expedition Journey (3D floating cards timeline) */}
        <Experience />
        {/* Chapter 7 — Tech Stack (Unified Moving Conveyor System) */}
        <TechStack />
        {/* Chapter 8 — Featured Work (Case Study Scenes) */}
        <Projects />
        {/* Chapter 9 — Certifications & Honors */}
        <Certifications />
        {/* Chapter 10 — Achievements & Impact Metrics */}
        <Achievements />
        {/* Chapter 11 — Looking Ahead (Future R&D Roadmap) */}
        <Roadmap />
        {/* Chapter 12 — Contact & Conclusion */}
        <Contact />
      </main>
    </SmoothScrollProvider>
  );
}
