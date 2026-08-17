"use client";

import dynamic from "next/dynamic";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import EvaNavbar from "@/components/eva/EvaNavbar";
import EvaHero from "@/components/eva/EvaHero";
import EvaAbout from "@/components/eva/EvaAbout";
import EvaProjects from "@/components/eva/EvaProjects";
import EvaTechStack from "@/components/eva/EvaTechStack";
import EvaExperience from "@/components/eva/EvaExperience";
import EvaContact from "@/components/eva/EvaContact";

// Heavy below-fold sections — defer parse until after first paint
const GithubContributions = dynamic(
  () => import("@/components/sections/GithubContributions"),
  { ssr: false }
);
const Certifications = dynamic(
  () => import("@/components/sections/Certifications"),
  { ssr: false }
);

export default function EvaLayout() {
  return (
    <SmoothScrollProvider weight="heavy">
      <div className="relative min-h-screen overflow-hidden bg-[var(--color-void)] font-mono text-[var(--color-pearl)]">
        {/* MAGI Hexagon Grid Background — static CSS, zero JS cost */}
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='103.92' viewBox='0 0 60 103.92' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64L30 69.28 0 51.96V17.32zM30 103.92l30-17.32V51.96l-30-17.32-30 17.32v34.64z' fill='%234361ee' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 103px",
          }}
          aria-hidden
        />

        {/* Vertical Tactical Scanning Line */}
        <div
          className="pointer-events-none fixed right-0 left-0 z-[2] h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent-primary)] to-transparent opacity-20 animate-[scan-down_10s_linear_infinite]"
          aria-hidden
        />

        {/* Tactical HUD Corner Warning Borders */}
        <div
          className="pointer-events-none fixed inset-0 z-[2] border border-[var(--color-accent-primary)]/10"
          aria-hidden
        />

        <EvaNavbar />

        {/* Same running order as Classic, so switching design themes never
            reshuffles the story. The commit archive follows IDENTITY in both
            modes: it reads as evidence for the profile that precedes it. */}
        <main className="relative z-10">
          {/* ACT I — INTRO */}
          <EvaHero />
          <EvaAbout />
          <GithubContributions />
          <EvaTechStack />

          {/* ACT II — CERTIFICATIONS */}
          <Certifications />

          {/* ACT III — PROJECTS */}
          <EvaProjects />

          {/* ACT IV — EXPERIENCE */}
          <EvaExperience />

          {/* ACT V — CONTACT */}
          <EvaContact />
        </main>
      </div>
    </SmoothScrollProvider>
  );
}
