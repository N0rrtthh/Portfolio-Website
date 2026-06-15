"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Compass, MapPin, Flag, Award, Plane, ShieldCheck, Sparkles, BookOpen } from "lucide-react";

const EASING = [0.22, 1, 0.36, 1] as const;

export interface OutpostNode {
  id: string;
  name: string;
  location: string;
  coordinates: string;
  role: string;
  period: string;
  lat: number;
  lng: number;
  description: string;
  highlights: string[];
  artifact: string;
  badge: string;
}

const OUTPOSTS: OutpostNode[] = [
  {
    id: "outpost-1",
    name: "Outpost 01 — BidaBoss Production Outpost",
    location: "Manila, Philippines",
    coordinates: "14°35'N 121°00'E",
    role: "Software Engineer Intern",
    period: "2025 – Present",
    lat: 14.5995,
    lng: 120.9842,
    description: "Engineered production React + Node.js operations web portal & companion Flutter mobile application for internal teams.",
    highlights: [
      "Developed internal operations web portal with React & Node.js",
      "Built cross-platform Flutter companion mobile application",
      "Implemented real-time sync with Firebase and WebSocket telemetry",
    ],
    artifact: "Enterprise Operations Portal & Mobile Companion App",
    badge: "PRODUCTION GRADE",
  },
  {
    id: "outpost-2",
    name: "Outpost 02 — WaterWise Capstone & Shader Vault",
    location: "Calapan, Philippines",
    coordinates: "13°25'N 121°11'E",
    role: "Undergraduate Capstone Lead",
    period: "2024 – 2025",
    lat: 13.4117,
    lng: 121.1803,
    description: "Award-winning 2D/3D Godot game engine thesis project with custom shaders and environmental networking.",
    highlights: [
      "Top Undergraduate Capstone thesis award recipient",
      "Created custom GDShader HLSL visual effects and fluid mechanics",
      "Integrated multiplayer networking and gamified learning mechanics",
    ],
    artifact: "WaterWise 3D Godot Thesis Game & GDShaders",
    badge: "TOP CAPSTONE AWARD",
  },
  {
    id: "outpost-3",
    name: "Outpost 03 — Open Source Developer Tools",
    location: "San Francisco, USA (Remote)",
    coordinates: "37°46'N 122°25'W",
    role: "Open Source Maintainer",
    period: "2024 – Present",
    lat: 37.7749,
    lng: -122.4194,
    description: "Published and maintained developer productivity tools including ResuMaker and JasFocus timer applications.",
    highlights: [
      "Published ResuMaker — ATS-optimized markdown resume generator",
      "Created JasFocus — minimal Pomodoro timer with ambient sounds",
      "Contributed to WebGL and animation library ecosystems",
    ],
    artifact: "ResuMaker & JasFocus Developer Productivity Apps",
    badge: "GLOBAL OPEN SOURCE",
  },
  {
    id: "outpost-4",
    name: "Outpost 04 — Godot 3D Game Physics Lab",
    location: "Tokyo, Japan (R&D)",
    coordinates: "35°41'N 139°41'E",
    role: "Creative Technologist",
    period: "2025 – Future",
    lat: 35.6762,
    lng: 139.6503,
    description: "R&D lab for real-time WebGL/WebGPU shaders, procedural mesh generation, and Godot 4 game architecture.",
    highlights: [
      "Volumetric lighting and particle collision physics",
      "Procedural terrain and shader graph generation",
      "Cross-platform WebGPU rendering experiments",
    ],
    artifact: "Godot 4 WebGPU Shader & Physics Playground",
    badge: "ACTIVE EXPERIMENTAL R&D",
  },
];

/** Converts Latitude & Longitude to 3D Sphere Vector3 Coordinates */
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

/** 3D Interactive Indiana Jones Globe Sphere */
function ExpeditionGlobeSphere({ activeNode }: { activeNode: OutpostNode }) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (!globeGroupRef.current) return;
    // Smoothly rotate globe sphere to focus target outpost coordinates
    const targetY = (activeNode.lng * Math.PI) / 180 + Math.PI / 2;
    const targetX = (activeNode.lat * Math.PI) / 360;

    targetRotation.current.y += (targetY - targetRotation.current.y) * 0.05;
    targetRotation.current.x += (targetX - targetRotation.current.x) * 0.05;

    globeGroupRef.current.rotation.y = targetRotation.current.y;
    globeGroupRef.current.rotation.x = targetRotation.current.x;
  });

  return (
    <group ref={globeGroupRef}>
      {/* Globe Wireframe Graticule Sphere */}
      <mesh>
        <sphereGeometry args={[2.4, 24, 24]} />
        <meshBasicMaterial color="#4361ee" wireframe transparent opacity={0.15} />
      </mesh>

      {/* Solid Inner Core */}
      <mesh>
        <sphereGeometry args={[2.36, 32, 32]} />
        <meshBasicMaterial color="#080812" transparent opacity={0.85} />
      </mesh>

      {/* Outpost Waypoint Pins on Sphere */}
      {OUTPOSTS.map((outpost) => {
        const pos = latLngToVector3(outpost.lat, outpost.lng, 2.42);
        const isActive = outpost.id === activeNode.id;

        return (
          <group key={outpost.id} position={pos}>
            <mesh>
              <sphereGeometry args={[isActive ? 0.12 : 0.07, 16, 16]} />
              <meshBasicMaterial
                color={isActive ? "#ff6a00" : "#39ff14"}
                transparent
                opacity={isActive ? 1.0 : 0.7}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function IndianaJonesGlobeMap() {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeNode = OUTPOSTS[activeIdx];

  return (
    <div className="relative rounded-3xl glass p-6 md:p-10 border border-[var(--color-glass-border)] shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden">
      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-[var(--color-glass-border)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30">
            <Compass size={22} className="animate-spin-slow" />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-accent-primary)] block">
              NON-LINEAR EXPEDITION MAP
            </span>
            <h3 className="font-display text-xl font-bold text-[var(--color-starlight)]">
              Indiana Jones Adventure Sphere
            </h3>
          </div>
        </div>

        {/* Non-Linear Waypoint Outpost Selector Buttons */}
        <div className="flex flex-wrap gap-2">
          {OUTPOSTS.map((outpost, idx) => (
            <button
              key={outpost.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`rounded-full px-4 py-2 font-mono text-xs transition-[background-color,color,transform,box-shadow] duration-200 ease-out active:scale-[0.97] flex items-center gap-2 ${
                activeIdx === idx
                  ? "bg-[var(--color-accent-primary)] text-white font-bold shadow-[0_0_20px_rgba(67,97,238,0.4)]"
                  : "glass text-[var(--color-silver)] hover:text-[var(--color-starlight)]"
              }`}
              data-cursor-hover
            >
              <MapPin size={12} />
              <span>OUTPOST 0{idx + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Expedition Globe + Journal Card Grid */}
      <div className="grid gap-8 lg:grid-cols-12 items-center">
        {/* Left Column — 3D Expedition Globe Sphere */}
        <div className="lg:col-span-5 relative h-[320px] md:h-[380px] w-full rounded-2xl bg-[var(--color-void)]/60 border border-[var(--color-glass-border)] overflow-hidden flex items-center justify-center">
          {/* Animated 3D Three.js Globe */}
          <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <ExpeditionGlobeSphere activeNode={activeNode} />
          </Canvas>

          {/* HUD Target Overlay Badge */}
          <div className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-widest text-[var(--color-accent-primary)] bg-[var(--color-void)]/80 px-3 py-1 rounded-full border border-[var(--color-accent-primary)]/30 backdrop-blur-md">
            TARGET // {activeNode.coordinates}
          </div>

          <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] text-[var(--color-ash)]">
            <Plane size={14} className="text-[var(--color-accent-warm)] animate-pulse" />
            <span>INDIANA JONES FLIGHT TRAIL ACTIVE</span>
          </div>
        </div>

        {/* Right Column — Outpost Expedition Journal Card */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, transform: "translateX(24px)", filter: "blur(6px)" }}
              animate={{ opacity: 1, transform: "translateX(0px)", filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -24, filter: "blur(6px)" }}
              transition={{ duration: 0.4, ease: EASING }}
              className="space-y-6"
            >
              {/* Journal Card Top */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs font-bold tracking-widest text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 px-3 py-1 rounded-full border border-[var(--color-accent-primary)]/20">
                  {activeNode.badge}
                </span>
                <span className="font-mono text-xs text-[var(--color-ash)]">
                  {activeNode.period} · {activeNode.location}
                </span>
              </div>

              <div>
                <h4 className="font-display text-2xl font-bold text-[var(--color-starlight)] mb-2">
                  {activeNode.role}
                </h4>
                <p className="font-body text-sm leading-relaxed text-[var(--color-silver)]">
                  {activeNode.description}
                </p>
              </div>

              {/* Milestones / Discovered Logs */}
              <div className="space-y-2.5 pt-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-ash)] block">
                  DISCOVERED MILESTONES & LOGS:
                </span>
                {activeNode.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 font-body text-xs text-[var(--color-silver)]">
                    <Flag size={14} className="text-[var(--color-accent-primary)] shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* Artifact Discovered Badge */}
              <div className="pt-4 border-t border-[var(--color-glass-border)] flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-warm)]/15 text-[var(--color-accent-warm)]">
                  <Award size={16} />
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-accent-warm)] block">
                    ARTIFACT DISCOVERED:
                  </span>
                  <span className="font-body text-xs font-bold text-[var(--color-starlight)]">
                    {activeNode.artifact}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
