"use client";

import { useMemo, useRef, useState, useEffect, memo } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { useScroll, motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Award,
  Code2,
  Gamepad2,
  Calendar,
  MapPin,
  X,
  CornerDownRight,
  Layers,
  Activity,
  Zap,
  Target,
  Crosshair,
  Radio,
  Terminal,
  Cpu,
  Globe,
  Lock,
  FileText,
} from "lucide-react";
import ChapterLabel from "@/components/ui/ChapterLabel";
import {
  getAdaptiveQuality,
  observeVisibility,
  type AdaptiveQuality,
} from "@/lib/performance";

// --- DATA ---
const TIMELINE_DATA = [
  {
    id: "exp-1",
    number: "01",
    role: "Software Engineer Intern",
    company: "BidaBoss Inc.",
    period: "2025 – Present",
    location: "Manila, Philippines",
    coordinates: '14°35\'53"N 120°58\'47"E',
    clearance: "TOP SECRET // LEVEL 4 DEPLOYMENT",
    operationCode: "OP-MANILA-NEXUS",
    description:
      "Engineered production-grade operations web portal and companion mobile app serving live internal teams with real-time synchronization.",
    highlights: [
      "Engineered React & Node.js internal portal with sub-second response times",
      "Built cross-platform Flutter companion mobile app for field operations",
      "Integrated real-time Firebase & WebSockets live telemetry synchronization",
      "Streamlined internal data workflows, cutting operational manual steps by 40%",
    ],
    tech: ["React", "Node.js", "Flutter", "Firebase", "TypeScript", "Tailwind CSS"],
    icon: ShieldCheck,
    badge: "PRODUCTION OUTPOST",
    details: {
      architecture:
        "Micro-frontend web client + Flutter mobile app connected to Express REST API & Firebase RTDB.",
      impact:
        "Serving daily active operational teams with 99.9% uptime real-time status reporting.",
    },
    scrollTarget: 0.14,
  },
  {
    id: "exp-2",
    number: "02",
    role: "Undergraduate Capstone Lead",
    company: "WaterWise Thesis Project",
    period: "2024 – 2025",
    location: "Calapan, Philippines",
    coordinates: '13°24\'40"N 121°10\'48"E',
    clearance: "CLASSIFIED // GOLD MEDAL HONORS",
    operationCode: "OP-FLUID-SIMULATION",
    description:
      "Award-winning 2D/3D Godot game engine thesis project featuring custom shader pipeline, fluid dynamics, and environmental networking.",
    highlights: [
      "Awarded top honors & 1st Place for Undergraduate Capstone Excellence",
      "Designed custom HLSL/GDShader fluid physics and environmental shader graph",
      "Built low-latency multiplayer networking mechanics for interactive simulation",
      "Optimized 3D asset pipeline in Blender to maintain 60 FPS on low-tier hardware",
    ],
    tech: ["Godot 4", "GDShader", "HLSL", "C#", "Blender 3D", "Multiplayer Netcode"],
    icon: Award,
    badge: "CAPSTONE EXCELLENCE",
    details: {
      architecture:
        "Godot Engine 4.x custom GDExtension pipeline with custom vertex/fragment shaders.",
      impact:
        "Honored with Best Technical Capstone Project for eco-simulation gameplay.",
    },
    scrollTarget: 0.38,
  },
  {
    id: "exp-3",
    number: "03",
    role: "Open Source Maintainer",
    company: "GitHub Community",
    period: "2024 – Present",
    location: "Global / Remote",
    coordinates: '00°00\'00"N 000°00\'00"E',
    clearance: "PUBLIC RELEASE // OPEN SOURCE INTEL",
    operationCode: "OP-GLOBAL-FORGE",
    description:
      "Published and maintained developer productivity tools including ResuMaker ATS resume builder and JasFocus Pomodoro applications.",
    highlights: [
      "Published ResuMaker markdown resume tool with real-time PDF generation",
      "Created JasFocus minimal Pomodoro timer with custom audio ambient engines",
      "Maintained zero-dependency dev utility libraries downloaded by developer peers",
      "Fostered open-source documentation, automated CI/CD builds, and release packaging",
    ],
    tech: ["Next.js", "Tailwind CSS", "Framer Motion", "TypeScript", "Markdown AST"],
    icon: Code2,
    badge: "OPEN SOURCE OUTPOST",
    details: {
      architecture:
        "Client-side Next.js App Router with offline LocalStorage & Web Workers.",
      impact:
        "100+ GitHub stars across developer tools with active community forks.",
    },
    scrollTarget: 0.64,
  },
  {
    id: "exp-4",
    number: "04",
    role: "Creative Technologist",
    company: "Godot 3D & WebGPU R&D",
    period: "2025 – Future",
    location: "R&D Lab",
    coordinates: '37°46\'30"N 122°25\'00"W',
    clearance: "RESTRICTED // FUTURE TECH DIVISION",
    operationCode: "OP-QUANTUM-GRAPHICS",
    description:
      "Exploring cutting-edge WebGL/WebGPU shaders, procedural mesh generation, real-time lighting physics, and Godot 4 architecture.",
    highlights: [
      "Real-time volumetric lighting physics & custom post-processing Bloom pipelines",
      "Procedural terrain generation using Perlin Noise & GPU compute shaders",
      "Cross-platform WebGPU rendering experiments targeting next-gen browsers",
      "Hybrid R3F (React Three Fiber) + Anime.js micro-interaction frameworks",
    ],
    tech: ["Three.js", "WebGPU", "GLSL", "Godot Engine", "Anime.js", "WebGL"],
    icon: Gamepad2,
    badge: "FUTURE R&D LAB",
    details: {
      architecture:
        "Experimental WebGPU compute shader pipeline + R3F postprocessing canvas.",
      impact:
        "Pioneering immersive 3D web experiences and next-gen browser graphics.",
    },
    scrollTarget: 0.88,
  },
];

// --- LIGHTWEIGHT ZERO-DEPRECATION STARFIELD ---
const Starfield = memo(function Starfield({ count = 60 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 60;
      pos[i + 1] = (Math.random() - 0.5) * 60;
      pos[i + 2] = (Math.random() - 0.5) * 160 - 45;
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.z += delta * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.25}
        color="#ff3b3b"
        transparent
        opacity={0.75}
        sizeAttenuation
      />
    </points>
  );
});

// --- 3D NEON DIRECTIONAL ARROW POINTER ---
const TimelineArrowPointer = memo(function TimelineArrowPointer({
  scrollRef,
  curve,
}: {
  scrollRef: React.MutableRefObject<number>;
  curve: THREE.CatmullRomCurve3;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const currentPos = useMemo(() => new THREE.Vector3(), []);
  const forwardPoint = useMemo(() => new THREE.Vector3(), []);
  const smoothProgress = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetProgress = Math.max(0, Math.min(scrollRef.current, 1.0));
    smoothProgress.current = THREE.MathUtils.damp(
      smoothProgress.current,
      targetProgress,
      14,
      delta
    );

    curve.getPoint(smoothProgress.current, currentPos);
    curve.getPoint(Math.min(smoothProgress.current + 0.05, 0.98), forwardPoint);

    groupRef.current.position.copy(currentPos);

    dummy.position.copy(currentPos);
    dummy.lookAt(forwardPoint);
    groupRef.current.quaternion.copy(dummy.quaternion);
  });

  return (
    <group ref={groupRef}>
      {/* Cone Head */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.4]}>
        <coneGeometry args={[0.38, 1.0, 4]} />
        <meshStandardMaterial
          color="#ff3b3b"
          emissive="#ff3b3b"
          emissiveIntensity={2.8}
          metalness={0.9}
          roughness={0.1}
          flatShading
        />
      </mesh>

      {/* Shaft */}
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[0.22, 0.14, 0.85]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.95}
          roughness={0.15}
          emissive="#1e1b4b"
        />
      </mesh>

      {/* Rear Wing Fins */}
      <mesh position={[0, 0, 0.5]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.75, 0.06, 0.35]} />
        <meshStandardMaterial
          color="#ff3b3b"
          emissive="#dc2626"
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
});

// --- 3D FLOATING TECH OBJECTS ---
const SpatialTechObjects = memo(function SpatialTechObjects() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[-6, 4, -15]} rotation={[0.4, 0.5, 0]}>
        <octahedronGeometry args={[1.2]} />
        <meshStandardMaterial
          color="#ff3b3b"
          emissive="#ff3b3b"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      <mesh position={[7, -3, -45]} rotation={[0.2, 0.8, 0]}>
        <octahedronGeometry args={[1.4]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      <mesh position={[-7, -4, -75]} rotation={[0.6, 0.2, 0]}>
        <octahedronGeometry args={[1.1]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#d97706"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
});

// --- 3D SCENE ---
const Scene = memo(function Scene({
  scrollRef,
  activeNode,
  onInspectNode,
  quality,
}: {
  scrollRef: React.MutableRefObject<number>;
  activeNode: number;
  onInspectNode: (index: number) => void;
  quality: AdaptiveQuality;
}) {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 14),
      new THREE.Vector3(4.8, 2.2, 0),
      new THREE.Vector3(-3.9, -1.8, -30),
      new THREE.Vector3(5.5, 1.9, -60),
      new THREE.Vector3(-4.5, -2.4, -90),
      new THREE.Vector3(0, 0, -115),
    ]);
  }, []);

  const linePoints = useMemo(() => curve.getPoints(120), [curve]);

  const nodePositions = useMemo(() => {
    const fractions = [0.14, 0.38, 0.64, 0.88];
    return fractions.map((f) => curve.getPoint(f));
  }, [curve]);

  const currentShipPoint = useMemo(() => new THREE.Vector3(), []);
  const cameraPOV = useMemo(() => new THREE.Vector3(), []);
  const smoothProgress = useRef(0);

  useFrame((state, delta) => {
    const targetProgress = Math.max(0, Math.min(scrollRef.current, 1.0));
    smoothProgress.current = THREE.MathUtils.damp(
      smoothProgress.current,
      targetProgress,
      18,
      delta
    );

    curve.getPoint(smoothProgress.current, currentShipPoint);

    cameraPOV.set(
      currentShipPoint.x,
      currentShipPoint.y + 0.6,
      currentShipPoint.z - 8.5
    );

    state.camera.position.lerp(cameraPOV, 0.18);
    state.camera.lookAt(currentShipPoint);
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 20, 15]} intensity={2.0} color="#ff3b3b" />
      <directionalLight position={[-10, -10, -10]} intensity={1.0} color="#38bdf8" />

      {/* Floating Spatial Tech Beacons */}
      <SpatialTechObjects />

      {/* Lightweight Zero-Deprecation Starfield */}
      <Starfield count={quality.sparkleCount || 60} />

      {/* 3D Laser Path Line */}
      <Line
        points={linePoints}
        color="#ff3b3b"
        lineWidth={3.5}
        transparent
        opacity={0.85}
      />

      {/* 3D Directional Arrow Pointer */}
      <TimelineArrowPointer scrollRef={scrollRef} curve={curve} />

      {/* RENDER 4 FLOATING 3D ENVIRONMENT TILES ATTACHED TO NODES ALONG 3D PATH */}
      {TIMELINE_DATA.map((item, index) => {
        const pos = nodePositions[index];
        const Icon = item.icon;
        const isActive = activeNode === index;

        return (
          <group key={item.id} position={pos}>
            {/* Glowing Hoop */}
            <mesh rotation={[0, 0, 0]}>
              <torusGeometry args={[4.8, 0.04, 8, 16]} />
              <meshBasicMaterial
                color={isActive ? "#fbbf24" : "#ff3b3b"}
                transparent
                opacity={isActive ? 0.9 : 0.4}
              />
            </mesh>

            {/* Node Marker */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[isActive ? 0.6 : 0.35, 12, 12]} />
              <meshStandardMaterial
                color={isActive ? "#ff3b3b" : "#475569"}
                emissive={isActive ? "#ff3b3b" : "#1e293b"}
                emissiveIntensity={isActive ? 3.0 : 0.4}
                roughness={0.1}
              />
            </mesh>

            {/* 3D FLOATING HTML ENVIRONMENT CARD — Attached in 3D space to node */}
            <Html
              position={[0, 0, 0]}
              distanceFactor={32}
              center
              zIndexRange={[80, 0]}
              style={{
                display: isActive ? "block" : "none",
                pointerEvents: isActive ? "auto" : "none",
                opacity: isActive ? 1 : 0,
                transition: "opacity 200ms ease-out, transform 200ms ease-out",
              }}
            >
              <div
                onClick={() => isActive && onInspectNode(index)}
                className={`relative group/card w-[22rem] md:w-[26rem] rounded-3xl border transition-all duration-300 ease-out p-6 will-change-transform transform-gpu ${
                  isActive
                    ? "border-red-500 bg-slate-950/95 shadow-lg shadow-red-500/20 scale-105 cursor-pointer pointer-events-auto opacity-100"
                    : "border-slate-800/80 bg-slate-950/80 opacity-40 scale-95 pointer-events-none"
                }`}
              >
                {/* Badge & Checkpoint Number */}
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/20 px-2.5 py-0.5 font-mono text-[9px] font-bold text-red-400 tracking-widest uppercase">
                    <span
                      className={`h-1.5 w-1.5 rounded-full bg-red-500 ${isActive ? "animate-ping" : ""
                        }`}
                    />
                    {item.badge}
                  </span>
                  <span className="font-mono text-2xl font-black text-red-400">
                    {item.number}
                  </span>
                </div>

                {/* Role Title */}
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/50 bg-red-500/20 text-red-400 shadow-inner">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-brand text-lg font-extrabold text-white leading-snug group-hover/card:text-amber-300 transition-colors">
                      {item.role}
                    </h3>
                    <p className="font-mono text-xs font-bold tracking-wider text-red-400 mt-0.5">
                      {item.company}
                    </p>
                  </div>
                </div>

                {/* Period & Location */}
                <div className="flex items-center justify-between mb-2.5 py-1.5 px-2.5 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-[11px] text-slate-300">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-red-400" />
                    <span className="font-semibold text-white">{item.period}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <MapPin size={12} className="text-red-400" />
                    <span>{item.location}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="mb-3 font-sans text-xs leading-relaxed text-slate-200 line-clamp-3">
                  {item.description}
                </p>

                {/* Tech Stack & CLICK ME BUTTON */}
                <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-slate-800/80 justify-between items-center">
                  <div className="flex flex-wrap gap-1">
                    {item.tech.slice(0, 3).map((t, i) => (
                      <span
                        key={i}
                        className="rounded-md border border-red-500/30 bg-red-950/40 px-2 py-0.5 font-mono text-[9px] text-red-200 font-semibold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* HIGH-END TACTICAL INSPECT DOSSIER BUTTON */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectNode(index);
                    }}
                    className="group/btn px-3.5 py-1.5 rounded-full border border-red-500/40 bg-slate-950/80 backdrop-blur-md text-red-300 font-mono text-[11px] font-bold tracking-wider shadow-[0_0_18px_rgba(239,68,68,0.25)] hover:bg-red-950/70 hover:border-red-400 hover:text-white hover:shadow-[0_0_24px_rgba(239,68,68,0.5)] hover:scale-105 transition-all duration-200 ease-out active:scale-[0.97] flex items-center gap-2 cursor-pointer will-change-transform transform-gpu"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    <span>INSPECT DOSSIER</span>
                    <span className="text-red-400 group-hover/btn:translate-x-0.5 transition-transform font-sans">→</span>
                  </button>
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
});

// --- MAIN WRAPPER COMPONENT ---
export default function Cinematic3DTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeNode, setActiveNode] = useState(0);
  const [inspectedNode, setInspectedNode] = useState<number | null>(null);
  const [canvasActive, setCanvasActive] = useState(false);
  const [canvasMounted, setCanvasMounted] = useState(false);

  const scrollRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const quality = useMemo(() => getAdaptiveQuality(), []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCanvasMounted(true);
    setMounted(true);
  }, []);

  // Pause WebGL rendering loop when offscreen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    return observeVisibility(el, (visible) => setCanvasActive(visible), "30% 0px");
  }, []);

  // Lock body scroll while inspecting briefing modal
  useEffect(() => {
    if (inspectedNode !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [inspectedNode]);

  // Active node update
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      scrollRef.current = latest;

      let nextNode = 0;
      if (latest < 0.26) nextNode = 0;
      else if (latest < 0.51) nextNode = 1;
      else if (latest < 0.76) nextNode = 2;
      else nextNode = 3;

      setActiveNode((prev) => (prev !== nextNode ? nextNode : prev));
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  // Waypoint click handler
  const handleWaypointClick = (index: number) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const containerHeight = containerRef.current.offsetHeight - window.innerHeight;
    const targetScroll = containerTop + TIMELINE_DATA[index].scrollTarget * containerHeight;

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  const inspectedItem = inspectedNode !== null ? TIMELINE_DATA[inspectedNode] : null;

  return (
    <section
      id="experience"
      ref={containerRef}
      className="relative w-full h-[320vh] bg-[#05060b]"
    >
      {/* PORTAL MOUNTED CINEMATIC DOSSIER MODAL */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {inspectedItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setInspectedNode(null)}
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-2xl font-sans select-none pointer-events-auto"
              >
                {/* Soft Ambient Radial Lighting */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[140px] bg-indigo-500/15" />

                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 16 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 16 }}
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  onClick={(e) => e.stopPropagation()}
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  className="relative w-full max-w-3xl bg-[#0a0a10]/95 border border-white/15 rounded-[2.25rem] p-6 sm:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.85)] text-slate-100 overflow-y-auto max-h-[86vh] scrollbar-none z-[100000]"
                >
                  {/* TOP BAR */}
                  <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">
                        {inspectedItem.operationCode} • {inspectedItem.period}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setInspectedNode(null)}
                      className="group/close h-9 px-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all duration-200 cursor-pointer active:scale-95"
                    >
                      <X size={15} className="group-hover/close:rotate-90 transition-transform duration-200" />
                      <span>Close</span>
                    </button>
                  </div>

                  {/* HERO HEADER */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                      <inspectedItem.icon size={28} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1 font-mono text-xs text-indigo-400 font-bold uppercase tracking-wide">
                        <span>MISSION 0{inspectedItem.number}</span>
                        <span>•</span>
                        <span>{inspectedItem.company}</span>
                      </div>
                      <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                        {inspectedItem.role}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 mt-2 font-mono text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <MapPin size={12} className="text-indigo-400" />
                          {inspectedItem.location}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">{inspectedItem.coordinates}</span>
                      </div>
                    </div>
                  </div>

                  {/* EXECUTIVE SUMMARY */}
                  <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                    <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-2 flex items-center gap-2">
                      <Terminal size={13} /> Mission Briefing & Context
                    </h3>
                    <p className="font-sans text-sm text-slate-200 leading-relaxed">
                      {inspectedItem.description}
                    </p>
                  </div>

                  {/* KEY OBJECTIVES */}
                  <div className="mb-6">
                    <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                      <FileText size={13} className="text-amber-400" /> Key Deliverables & Impact
                    </h3>
                    <div className="grid gap-2.5">
                      {inspectedItem.highlights.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-colors"
                        >
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shrink-0">
                            0{i + 1}
                          </span>
                          <span className="font-sans text-xs sm:text-sm text-slate-200 leading-snug">
                            {h}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ARCHITECTURE & TELEMETRY */}
                  <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-300 block mb-1.5 flex items-center gap-1.5">
                        <Layers size={13} className="text-cyan-400" /> Architecture Schematic
                      </span>
                      <p className="font-sans text-xs text-slate-300 leading-relaxed">
                        {inspectedItem.details.architecture}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-300 block mb-1.5 flex items-center gap-1.5">
                        <Activity size={13} className="text-emerald-400" /> Measured Telemetry
                      </span>
                      <p className="font-sans text-xs text-slate-300 leading-relaxed">
                        {inspectedItem.details.impact}
                      </p>
                    </div>
                  </div>

                  {/* ARSENAL TECH STACK */}
                  <div className="pt-4 border-t border-white/10">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2.5 flex items-center gap-2">
                      <Cpu size={13} className="text-indigo-400" /> Deployed Arsenal:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {inspectedItem.tech.map((t, i) => (
                        <span
                          key={i}
                          className="font-mono text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Sticky Viewport Frame */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        {/* Header Overlay */}
        <div className="absolute top-16 md:top-20 left-0 z-20 w-full px-6 md:px-12 pointer-events-none">
          <div className="max-w-7xl mx-auto flex items-end justify-between">
            <div>
              <ChapterLabel
                index={5}
                classic="Expedition Timeline"
                eva="MISSION LOG"
                className="mb-1"
              />
              <h2 className="font-brand text-2xl md:text-3xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                My Experience
              </h2>
            </div>

            {/* Active Checkpoint Telemetry Badge */}
            <div className="hidden md:flex items-center gap-3 rounded-full border border-red-500/40 bg-slate-950/90 px-3.5 py-1.5 backdrop-blur-xl font-mono text-xs shadow-lg">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-slate-400">ACTIVE CHECKPOINT:</span>
              <span className="font-bold text-red-400">
                0{activeNode + 1} / 04
              </span>
            </div>
          </div>
        </div>

        {/* Floating Side Waypoint Navigation Buttons */}
        <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4 pointer-events-auto">
          {TIMELINE_DATA.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleWaypointClick(idx)}
              title={`Pilot to ${item.company}`}
              className={`flex items-center justify-end gap-3 group text-left cursor-pointer transition-[transform,opacity] duration-[250ms] ease-out will-change-transform transform-gpu ${activeNode === idx
                  ? "opacity-100 scale-110"
                  : "opacity-40 hover:opacity-90"
                }`}
            >
              <span
                className={`hidden md:inline font-mono text-[11px] font-bold tracking-widest uppercase transition-colors ${activeNode === idx
                    ? "text-amber-300 drop-shadow-[0_0_10px_#fbbf24]"
                    : "text-slate-300 group-hover:text-white"
                  }`}
              >
                {item.company}
              </span>
              <div
                className={`h-4 w-4 rounded-full border transition-[border-color,background-color,transform,box-shadow] duration-[250ms] ease-out group-active:scale-[0.95] flex items-center justify-center ${activeNode === idx
                    ? "bg-red-500 border-amber-400 shadow-[0_0_20px_#ff3b3b]"
                    : "bg-slate-900 border-slate-700 group-hover:border-red-400"
                  }`}
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full ${activeNode === idx ? "bg-white animate-ping" : "bg-transparent"
                    }`}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Interactive Scroll Guidance Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 font-mono text-[11px] text-slate-400 pointer-events-none animate-bounce">
          <span>
            SCROLL TO PILOT REAR-VIEW MIRROR RECEDING JOURNEY // WARPS TO TECH STACK
          </span>
          <CornerDownRight className="h-3.5 w-3.5 text-red-500" />
        </div>

        {/* 3D WebGL Canvas */}
        <div className="absolute inset-0 z-0">
          {canvasMounted && (
            <Canvas
              camera={{ position: [0, 0, 14], fov: 60 }}
              dpr={1}
              frameloop={canvasActive ? "always" : "never"}
              gl={{
                antialias: quality.antialias,
                alpha: false,
                powerPreference: "high-performance",
                stencil: false,
                depth: true,
              }}
              style={{ touchAction: "none" }}
            >
              <Scene
                scrollRef={scrollRef}
                activeNode={activeNode}
                onInspectNode={(idx) => setInspectedNode(idx)}
                quality={quality}
              />
            </Canvas>
          )}
        </div>
      </div>
    </section>
  );
}
