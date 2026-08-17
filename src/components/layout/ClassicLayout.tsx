"use client";

import dynamic from "next/dynamic";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import AboutStory from "@/components/sections/AboutStory";
import TechStack from "@/components/sections/TechStack";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";
import { TIMELINE_SCROLL_VH } from "@/data/experience";

/* ══════════════════════════════════════════════════════════
   Classic running order
   ──────────────────────────────────────────────────────────
   Five acts, in this order: INTRO → CERTIFICATIONS → PROJECTS →
   EXPERIENCE → CONTACT.

   The sections that aren't act headings sit with the act they
   support rather than standing alone: the GitHub archive follows
   "Who I Am" (the same identity claim, measured instead of
   narrated), Tech Stack closes the intro (what I work with), and
   the Hologram showcase closes Projects (it IS work).
   ══════════════════════════════════════════════════════════ */

// Heavy / below-fold sections: defer JS parse+eval until after first paint.
// The placeholder reserves the section's *real* height so resolving the chunk
// doesn't shift ~280vh of layout out from under an in-progress scroll.
const Experience = dynamic(() => import("@/components/sections/Experience"), {
  ssr: false,
  loading: () => (
    <div
      id="experience"
      className="relative w-full bg-[#05060b]"
      style={{ height: `${TIMELINE_SCROLL_VH}vh` }}
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
const HologramShowcase = dynamic(
  () => import("@/components/sections/HologramShowcase"),
  { ssr: false }
);

// Preload GLB models so they're cached before the section scrolls into view
if (typeof window !== "undefined") {
  const BASE = process.env.NODE_ENV === "production" ? "/Portfolio-Website" : "";
  import("@react-three/drei").then(({ useGLTF }) => {
    useGLTF.preload(`${BASE}/3d/model_a.glb`);
    useGLTF.preload(`${BASE}/3d/model_b.glb`);
    useGLTF.preload(`${BASE}/3d/model_c.glb`);
  });
}

export default function ClassicLayout() {
  return (
    <SmoothScrollProvider>
      <Navbar />
      <main>
        {/* ── ACT I — INTRO ──────────────────────────────── */}
        <Hero />
        <AboutStory />
        <GithubContributions />
        <TechStack />

        {/* ── ACT II — CERTIFICATIONS ────────────────────── */}
        <Certifications />

        {/* ── ACT III — PROJECTS ─────────────────────────── */}
        <Projects />
        <HologramShowcase />

        {/* ── ACT IV — EXPERIENCE ────────────────────────── */}
        <Experience />

        {/* ── ACT V — CONTACT ────────────────────────────── */}
        <Contact />
      </main>
    </SmoothScrollProvider>
  );
}
