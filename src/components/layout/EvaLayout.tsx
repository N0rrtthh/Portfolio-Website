"use client";

import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import EvaNavbar from "@/components/eva/EvaNavbar";
import EvaHero from "@/components/eva/EvaHero";
import EvaAbout from "@/components/eva/EvaAbout";
import EvaProjects from "@/components/eva/EvaProjects";
import EvaTechStack from "@/components/eva/EvaTechStack";
import EvaExperience from "@/components/eva/EvaExperience";
import GithubContributions from "@/components/sections/GithubContributions";
import Certifications from "@/components/sections/Certifications";
import EvaContact from "@/components/eva/EvaContact";

export default function EvaLayout() {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[var(--color-void)] text-[var(--color-pearl)] font-mono relative overflow-hidden">
        {/* MAGI Hexagon Grid Background */}
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='103.92' viewBox='0 0 60 103.92' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64L30 69.28 0 51.96V17.32zM30 103.92l30-17.32V51.96l-30-17.32-30 17.32v34.64z' fill='%234361ee' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 103px",
          }}
        />

        {/* Vertical Tactical Scanning Line */}
        <div className="pointer-events-none fixed left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent-primary)] to-transparent z-[2] opacity-20 animate-[scan-down_10s_linear_infinite]" />

        {/* Tactical HUD Corner Warning Borders */}
        <div className="pointer-events-none fixed inset-0 z-[2] border-[1px] border-[var(--color-accent-primary)]/10" />

        <EvaNavbar />

        <main className="relative z-10">
          {/* Phase 1: System Boot → Identity */}
          <EvaHero />
          {/* Phase 2: Pilot Profile */}
          <EvaAbout />
          {/* Phase 3: Mission Archive */}
          <EvaProjects />
          {/* Phase 4: Equipment Manifest */}
          <EvaTechStack />
          {/* Phase 5: Deployment History */}
          <EvaExperience />
          {/* Phase 6: GitHub GraphQL Activity Stream */}
          <GithubContributions />
          {/* Phase 7: Credential Vault & Certifications */}
          <Certifications />
          {/* Phase 8: Comms Uplink */}
          <EvaContact />
        </main>
      </div>
    </SmoothScrollProvider>
  );
}
