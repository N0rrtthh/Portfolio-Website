import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import AboutStory from "@/components/sections/AboutStory";
import ProcessSystem from "@/components/sections/ProcessSystem";
import PhilosophyView from "@/components/sections/PhilosophyView";
import Experience from "@/components/sections/Experience";
import TechStack from "@/components/sections/TechStack";
import Projects from "@/components/sections/Projects";
import Certifications from "@/components/sections/Certifications";
import Achievements from "@/components/sections/Achievements";
import Roadmap from "@/components/sections/Roadmap";
import Contact from "@/components/sections/Contact";

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
        {/* Chapter 5 — The Journey (Indiana Jones Adventure Map) */}
        <Experience />
        {/* Chapter 6 — Tech Stack (Unified Moving Conveyor System) */}
        <TechStack />
        {/* Chapter 7 — Featured Work (Case Study Scenes) */}
        <Projects />
        {/* Chapter 8 — Certifications & Honors */}
        <Certifications />
        {/* Chapter 9 — Achievements & Impact Metrics */}
        <Achievements />
        {/* Chapter 10 — Looking Ahead (Future R&D Roadmap) */}
        <Roadmap />
        {/* Chapter 11 — Contact & Conclusion */}
        <Contact />
      </main>
    </SmoothScrollProvider>
  );
}
