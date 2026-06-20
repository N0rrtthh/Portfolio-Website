"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Sparkles, Line } from "@react-three/drei";
import { useScroll, MotionValue, motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Award,
  Code2,
  Gamepad2,
  Calendar,
  MapPin,
  X,
  Sparkles as SparklesIcon,
  ChevronRight,
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

// --- DATA ---
const TIMELINE_DATA = [
  {
    id: "exp-1",
    number: "01",
    role: "Software Engineer Intern",
    company: "BidaBoss Inc.",
    period: "2025 – Present",
    location: "Manila, Philippines",
    coordinates: "14°35'53\"N 120°58'47\"E",
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
      architecture: "Micro-frontend web client + Flutter mobile app connected to Express REST API & Firebase RTDB.",
      impact: "Serving daily active operational teams with 99.9% uptime real-time status reporting.",
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
    coordinates: "13°24'40\"N 121°10'48\"E",
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
      architecture: "Godot Engine 4.x custom GDExtension pipeline with custom vertex/fragment shaders.",
      impact: "Honored with Best Technical Capstone Project for eco-simulation gameplay.",
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
    coordinates: "00°00'00\"N 000°00'00\"E",
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
      architecture: "Client-side Next.js App Router with offline LocalStorage & Web Workers.",
      impact: "100+ GitHub stars across developer tools with active community forks.",
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
    coordinates: "37°46'30\"N 122°25'00\"W",
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
      architecture: "Experimental WebGPU compute shader pipeline + R3F postprocessing canvas.",
      impact: "Pioneering immersive 3D web experiences and next-gen browser graphics.",
    },
    scrollTarget: 0.88,
  },
];

// --- 3D NEON DIRECTIONAL ARROW POINTER ---
function TimelineArrowPointer({
  scrollYProgress,
  curve,
}: {
  scrollYProgress: MotionValue<number>;
  curve: THREE.CatmullRomCurve3;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const currentPos = useMemo(() => new THREE.Vector3(), []);
  const forwardPoint = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!groupRef.current) return;
    const rawProgress = Math.max(0, Math.min(scrollYProgress.get() || 0, 1.0));
    const curveProgress = rawProgress * 0.90;

    curve.getPoint(curveProgress, currentPos);
    curve.getPoint(Math.min(curveProgress + 0.05, 0.98), forwardPoint);

    groupRef.current.position.lerp(currentPos, 0.2);

    dummy.position.copy(currentPos);
    dummy.lookAt(forwardPoint);
    groupRef.current.quaternion.slerp(dummy.quaternion, 0.2);
  });

  return (
    <group ref={groupRef}>
      {/* Sleek Arrow Tip / Cone Head */}
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

      {/* Arrow Shaft / Core Body */}
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

      {/* Glowing Energy Point Light */}
      <pointLight position={[0, 0, 0]} color="#ff3b3b" intensity={4.0} distance={8} />

      {/* Trail Sparkles */}
      <Sparkles
        count={35}
        scale={[0.6, 0.6, 1.8]}
        position={[0, 0, 1.0]}
        size={2.2}
        speed={1.5}
        color="#ff3b3b"
        opacity={0.8}
      />
    </group>
  );
}

// --- 3D FLOATING TECH OBJECTS (NO PLANETS) ---
function SpatialTechObjects() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Floating Spatial Polyhedron Beacon 1 */}
      <mesh position={[-6, 4, -15]} rotation={[0.4, 0.5, 0]}>
        <octahedronGeometry args={[1.2]} />
        <meshStandardMaterial color="#ff3b3b" wireframe emissive="#ff3b3b" emissiveIntensity={1.5} />
      </mesh>

      {/* Floating Spatial Polyhedron Beacon 2 */}
      <mesh position={[7, -3, -40]} rotation={[0.2, 0.8, 0]}>
        <icosahedronGeometry args={[1.4]} />
        <meshStandardMaterial color="#38bdf8" wireframe emissive="#0284c7" emissiveIntensity={1.5} />
      </mesh>

      {/* Floating Spatial Energy Crystal 3 */}
      <mesh position={[-7, -4, -65]} rotation={[0.6, 0.2, 0]}>
        <dodecahedronGeometry args={[1.0]} />
        <meshStandardMaterial color="#fbbf24" wireframe emissive="#d97706" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

// --- 3D SCENE ---
function Scene({
  scrollYProgress,
  activeNode,
  onInspectNode,
}: {
  scrollYProgress: MotionValue<number>;
  activeNode: number;
  onInspectNode: (index: number) => void;
}) {
  // Dynamic 3D curve winding through space
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 14),             // Start
      new THREE.Vector3(4.8, 2.2, 0),          // Checkpoint 01
      new THREE.Vector3(-3.9, -1.8, -25),      // Checkpoint 02
      new THREE.Vector3(5.5, 1.9, -50),        // Checkpoint 03
      new THREE.Vector3(-4.5, -2.4, -75),      // Checkpoint 04
      new THREE.Vector3(0, 0, -100),          // Deep Space End
    ]);
  }, []);

  const linePoints = useMemo(() => curve.getPoints(300), [curve]);

  const nodePositions = useMemo(() => {
    const fractions = [0.14, 0.38, 0.64, 0.88];
    return fractions.map((f) => curve.getPoint(f));
  }, [curve]);

  const currentShipPoint = useMemo(() => new THREE.Vector3(), []);
  const cameraPOV = useMemo(() => new THREE.Vector3(), []);

  // Frame Loop: REAR-VIEW MIRROR RECEDING MOVEMENT (Zero state updates, butter-smooth 60 FPS)
  useFrame((state) => {
    const rawProgress = Math.max(0, Math.min(scrollYProgress.get() || 0, 1.0));
    const curveProgress = rawProgress * 0.90;
    
    curve.getPoint(curveProgress, currentShipPoint);

    cameraPOV.set(
      currentShipPoint.x,
      currentShipPoint.y + 0.6,
      currentShipPoint.z - 8.5
    );

    state.camera.position.lerp(cameraPOV, 0.12);
    state.camera.lookAt(currentShipPoint);
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[10, 20, 15]} intensity={2.5} color="#ff3b3b" />
      <directionalLight position={[-15, -10, -10]} intensity={1.2} color="#3b82f6" />
      <pointLight position={[0, 0, -30]} intensity={3} color="#ff3b3b" distance={60} />

      {/* Floating Spatial Tech Polyhedron Beacons */}
      <SpatialTechObjects />

      {/* Floating Space Starfield */}
      <Sparkles
        count={150}
        scale={45}
        size={3.0}
        speed={0.8}
        color="#ff3b3b"
        opacity={0.8}
      />

      {/* Clean Winding 3D Laser Path Line */}
      <Line
        points={linePoints}
        color="#ff3b3b"
        lineWidth={3.5}
        transparent
        opacity={0.85}
      />

      {/* 3D NEON DIRECTIONAL ARROW POINTER */}
      <TimelineArrowPointer
        scrollYProgress={scrollYProgress}
        curve={curve}
      />

      {/* RENDER 4 TILES & PLAIN GLOWING CIRCLES THAT TILES & CAMERA PASS THROUGH */}
      {TIMELINE_DATA.map((item, index) => {
        const pos = nodePositions[index];
        const Icon = item.icon;
        const isActive = activeNode === index;

        return (
          <group key={item.id} position={pos}>
            {/* PLAIN GLOWING CIRCLE HOOP SURROUNDING WAYPOINT TILE FOR PASS-THROUGH */}
            <mesh rotation={[0, 0, 0]}>
              <torusGeometry args={[4.8, 0.05, 12, 32]} />
              <meshBasicMaterial
                color={isActive ? "#fbbf24" : "#ff3b3b"}
                transparent
                opacity={isActive ? 0.9 : 0.4}
              />
            </mesh>

            {/* Core Glowing Node Marker on Line */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[isActive ? 0.6 : 0.35, 16, 16]} />
              <meshStandardMaterial
                color={isActive ? "#ff3b3b" : "#475569"}
                emissive={isActive ? "#ff3b3b" : "#1e293b"}
                emissiveIntensity={isActive ? 3.0 : 0.4}
                roughness={0.1}
              />
            </mesh>

            {/* 3D ENVIRONMENT TILE — Always mounted to prevent layout thrashing lag spikes */}
            <Html
              position={[0, 0, 0]}
              distanceFactor={32}
              center
              zIndexRange={[100, 0]}
            >
              <div
                onClick={() => isActive && onInspectNode(index)}
                className={`relative group/card w-[22rem] md:w-[26rem] rounded-3xl border transition-[border-color,box-shadow,transform,opacity,background-color] duration-[250ms] ease-out p-6 will-change-transform transform-gpu ${
                  isActive
                    ? "border-red-500 bg-slate-950/95 shadow-lg shadow-red-500/20 scale-105 cursor-pointer pointer-events-auto opacity-100"
                    : "border-slate-800/80 bg-slate-950/80 opacity-0 scale-95 pointer-events-none"
                }`}
              >
                {/* Badge & Checkpoint Number */}
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/20 px-2.5 py-0.5 font-mono text-[9px] font-bold text-red-400 tracking-widest uppercase">
                    <span className={`h-1.5 w-1.5 rounded-full bg-red-500 ${isActive ? "animate-ping" : ""}`} />
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

                {/* Tech Stack & HIGHLIGHTED CLICK ME BUTTON BUILT INTO TILE */}
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

                  {/* PROMINENT HIGHLIGHTED CLICK ME ACTION BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectNode(index);
                    }}
                    className="px-3 py-1.5 rounded-full border-2 border-amber-400 bg-amber-950 text-amber-300 font-mono text-xs font-black shadow-[0_0_20px_rgba(251,191,36,0.9)] hover:scale-110 transition-[transform,background-color] duration-[250ms] ease-out active:scale-[0.97] flex items-center gap-1.5 animate-pulse cursor-pointer will-change-transform transform-gpu"
                  >
                    <Zap size={13} className="text-amber-400 fill-amber-400" />
                    <span>[ ✦ CLICK ME ✦ ]</span>
                  </button>
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}

// --- MAIN WRAPPER COMPONENT ---
export default function Cinematic3DTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeNode, setActiveNode] = useState(0);
  const [inspectedNode, setInspectedNode] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // LOCK BODY SCROLL WHILE INSPECTING BRIEFING
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

  // Active node update & smooth scroll transition to Toolkit (#techstack) at timeline end
  useEffect(() => {
    let hasWarped = false;

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      let nextNode = 0;
      if (latest < 0.25) nextNode = 0;
      else if (latest < 0.50) nextNode = 1;
      else if (latest < 0.75) nextNode = 2;
      else nextNode = 3;

      setActiveNode((prev) => (prev !== nextNode ? nextNode : prev));

      // Reaching the end of 3D timeline -> smooth scroll into Toolkit (#techstack)
      if (latest >= 0.98 && !hasWarped) {
        hasWarped = true;
        const toolkitSection = document.getElementById("techstack") || document.getElementById("tech-stack");
        if (toolkitSection) {
          toolkitSection.scrollIntoView({ behavior: "smooth" });
        }
      } else if (latest < 0.92) {
        hasWarped = false;
      }
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
      {/* --- CALL OF DUTY STYLE TACTICAL MISSION BRIEFING OVERLAY --- */}
      <AnimatePresence>
        {inspectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInspectedNode(null)}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6 bg-slate-950/95 backdrop-blur-3xl font-mono"
          >
            {/* Background Grid & Scanline FX */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,6,11,0.95)_100%)] pointer-events-none" />

            <motion.div
              initial={{ transform: "scale(0.92) translateY(20px)" }}
              animate={{ transform: "scale(1) translateY(0px)" }}
              exit={{ scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-slate-950/90 border-2 border-red-500/80 rounded-2xl p-5 md:p-8 shadow-[0_0_80px_rgba(255,59,59,0.35)] text-slate-100 overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-red-500/50"
            >
              {/* Tactical Corner Crosshairs */}
              <div className="absolute top-2 left-2 text-red-500/60 pointer-events-none"><Crosshair size={18} /></div>
              <div className="absolute top-2 right-2 text-red-500/60 pointer-events-none"><Crosshair size={18} /></div>
              <div className="absolute bottom-2 left-2 text-red-500/60 pointer-events-none"><Crosshair size={18} /></div>
              <div className="absolute bottom-2 right-2 text-red-500/60 pointer-events-none"><Crosshair size={18} /></div>

              {/* TOP CLASSIFIED HEADER BAR */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-red-500/40">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-950/90 border border-red-500 rounded text-red-400 font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                    <Lock size={14} className="animate-pulse" />
                    <span>{inspectedItem.clearance}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Radio size={14} className="animate-ping text-amber-400" />
                    <span>SECURE SATELLITE FEED // LIVE</span>
                  </div>
                </div>

                {/* Abort Briefing Button */}
                <button
                  onClick={() => setInspectedNode(null)}
                  className="flex items-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded border border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.7)] transition-[background-color,transform,box-shadow] duration-200 ease-out active:scale-[0.97] cursor-pointer"
                >
                  <X size={16} />
                  <span>[ ABORT BRIEFING ]</span>
                </button>
              </div>

              {/* TELEMETRY METADATA STRIP */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-500 block">OPERATION CODE:</span>
                  <span className="font-bold text-red-400">{inspectedItem.operationCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">COORDINATES:</span>
                  <span className="font-bold text-amber-300">{inspectedItem.coordinates}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">OPERATIVE LEVEL:</span>
                  <span className="font-bold text-cyan-400">{inspectedItem.badge}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">TIMELINE FRAME:</span>
                  <span className="font-bold text-emerald-400">{inspectedItem.period}</span>
                </div>
              </div>

              {/* MAIN MISSION TITLE BLOCK */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 p-5 bg-gradient-to-r from-red-950/40 via-slate-900/80 to-slate-950 border-l-4 border-red-500 border-y border-r border-slate-800 rounded-r-xl">
                <div>
                  <div className="flex items-center gap-2 text-xs text-red-400 font-bold mb-1">
                    <Target size={15} />
                    <span>MISSION OUTPOST 0{inspectedItem.number} // {inspectedItem.company}</span>
                  </div>
                  <h2 className="font-brand text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                    {inspectedItem.role}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <Globe size={13} className="text-amber-400" />
                    <span>LOCATION: {inspectedItem.location}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 shadow-lg">
                    <inspectedItem.icon size={30} />
                  </div>
                </div>
              </div>

              {/* EXECUTIVE BRIEFING SUMMARY */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-red-400 tracking-widest uppercase mb-2 flex items-center gap-2">
                  <Terminal size={14} /> EXECUTIVE SITUATION REPORT
                </h4>
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-xs md:text-sm leading-relaxed text-slate-200">
                  {inspectedItem.description}
                </div>
              </div>

              {/* KEY OPERATIONAL DELIVERABLES */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-3 flex items-center gap-2">
                  <FileText size={14} /> KEY OPERATIONAL OBJECTIVES & IMPACT
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {inspectedItem.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/90 border border-slate-800/90 rounded-xl text-xs text-slate-200">
                      <span className="px-2 py-0.5 bg-red-950 border border-red-500 text-red-400 font-bold text-[10px] rounded shrink-0">
                        ACT-{i + 1}
                      </span>
                      <span className="leading-snug">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TACTICAL SPECS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <span className="text-[11px] font-bold text-cyan-400 block mb-1.5 uppercase flex items-center gap-1.5">
                    <Layers size={14} /> ARCHITECTURE SCHEMATIC
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {inspectedItem.details.architecture}
                  </p>
                </div>
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <span className="text-[11px] font-bold text-emerald-400 block mb-1.5 uppercase flex items-center gap-1.5">
                    <Activity size={14} /> MEASURED IMPACT TELEMETRY
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {inspectedItem.details.impact}
                  </p>
                </div>
              </div>

              {/* ARSENAL / TECH STACK */}
              <div className="pt-4 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-400 block mb-3 uppercase flex items-center gap-2">
                  <Cpu size={14} className="text-red-400" /> DEPLOYED TACTICAL ARSENAL:
                </span>
                <div className="flex flex-wrap gap-2">
                  {inspectedItem.tech.map((t, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-red-950/80 border border-red-500/50 text-red-300 font-bold text-xs rounded-md shadow-sm"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Viewport Frame */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        
        {/* Header Overlay */}
        <div className="absolute top-16 md:top-20 left-0 z-20 w-full px-6 md:px-12 pointer-events-none">
          <div className="max-w-7xl mx-auto flex items-end justify-between">
            <div>
              <ChapterLabel index={5} classic="Expedition Timeline" eva="MISSION LOG" className="mb-1" />
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
              onClick={() => handleWaypointClick(idx)}
              title={`Pilot to ${item.company}`}
              className={`flex items-center justify-end gap-3 group text-left cursor-pointer transition-[transform,opacity] duration-[250ms] ease-out will-change-transform transform-gpu ${
                activeNode === idx ? "opacity-100 scale-110" : "opacity-40 hover:opacity-90"
              }`}
            >
              <span className={`hidden md:inline font-mono text-[11px] font-bold tracking-widest uppercase transition-colors ${
                activeNode === idx ? "text-amber-300 drop-shadow-[0_0_10px_#fbbf24]" : "text-slate-300 group-hover:text-white"
              }`}>
                {item.company}
              </span>
              <div
                className={`h-4 w-4 rounded-full border transition-[border-color,background-color,transform,box-shadow] duration-[250ms] ease-out group-active:scale-[0.95] flex items-center justify-center ${
                  activeNode === idx
                    ? "bg-red-500 border-amber-400 shadow-[0_0_20px_#ff3b3b]"
                    : "bg-slate-900 border-slate-700 group-hover:border-red-400"
                }`}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${activeNode === idx ? "bg-white animate-ping" : "bg-transparent"}`} />
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Interactive Scroll Guidance Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 font-mono text-[11px] text-slate-400 pointer-events-none animate-bounce">
          <span>SCROLL TO PILOT REAR-VIEW MIRROR RECEDING JOURNEY // WARPS TO TECH STACK</span>
          <CornerDownRight className="h-3.5 w-3.5 text-red-500" />
        </div>

        {/* 3D WebGL Canvas */}
        <div className="absolute inset-0 z-0">
          <Canvas
            camera={{ position: [0, 0, 14], fov: 60 }}
            dpr={1}
            gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          >
            <Scene
              scrollYProgress={scrollYProgress}
              activeNode={activeNode}
              onInspectNode={(idx) => setInspectedNode(idx)}
            />
          </Canvas>
        </div>
      </div>
    </section>
  );
}
