"use client";

import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { getAdaptiveQuality, observeVisibility } from "@/lib/performance";

/* ─── Data ─────────────────────────────────────────────── */
const BASE = process.env.NODE_ENV === "production" ? "/Portfolio-Website" : "";

const SLOTS = [
  {
    id: "web",
    index: "1/03",
    label: "WEB / FULLSTACK",
    title: "FULL-STACK WEB",
    body: "React, Next.js, Node.js, Firebase — production apps shipped and running in the wild.",
    model: `${BASE}/3d/model_a.glb`,
    accent: "#4361ee",
  },
  {
    id: "mobile",
    index: "2/03",
    label: "MOBILE",
    title: "MOBILE APPS",
    body: "Cross-platform Flutter apps with offline-first architecture and real-time sync.",
    model: `${BASE}/3d/model_b.glb`,
    accent: "#06b6d4",
  },
  {
    id: "creative",
    index: "3/03",
    label: "CREATIVE / 3D",
    title: "CREATIVE DEV",
    body: "Godot games, Blender models, motion design — where engineering meets craft.",
    model: `${BASE}/3d/model_c.glb`,
    accent: "#8b5cf6",
  },
];

/* ─── Hologram shader ───────────────────────────────────── */
const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uGlitch;
  varying vec3 vPos;
  varying float vFresnel;
  void main() {
    vPos = position;
    vec3 n = normalize(normalMatrix * normal);
    vFresnel = pow(1.0 - abs(dot(n, vec3(0.0,0.0,1.0))), 2.2);
    vec3 p = position;
    p.x += sin(p.y * 40.0 + uTime * 8.0) * uGlitch * 0.01;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3  uColor;
  uniform float uOpacity;
  uniform float uScanY;
  uniform float uGlitch;
  varying vec3  vPos;
  varying float vFresnel;
  void main() {
    float bands  = mix(0.5, 1.0, sin(vPos.y * 80.0 + uTime * 2.0) * 0.5 + 0.5);
    float fine   = mix(0.8, 1.0, sin(vPos.y * 320.0) * 0.5 + 0.5);
    float beam   = smoothstep(0.05, 0.0, abs(vPos.y - uScanY)) * 0.8;
    float rim    = vFresnel * 1.6;
    float flick  = 0.9 + 0.1 * sin(uTime * 17.3);
    vec3  col    = uColor;
    col.r += uGlitch * sin(uTime * 23.0) * 0.25;
    col.b += uGlitch * cos(uTime * 19.0) * 0.25;
    float a = (bands * fine * 0.5 + rim * 0.5 + beam) * uOpacity * flick;
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`;

/* ─── Single hologram model ─────────────────────────────── */
function HologramModel({
  url,
  accent,
  active,
}: {
  url: string;
  accent: string;
  active: boolean;
}) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const glitchTimer = useRef(2 + Math.random() * 3);

  // Build material once per accent colour
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime:    { value: 0 },
          uColor:   { value: new THREE.Color(accent) },
          uOpacity: { value: 0 },
          uScanY:   { value: 0 },
          uGlitch:  { value: 0 },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [accent]
  );

  // Clone + normalise scale + centre — runs once per scene+accent
  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    // Apply material
    clone.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = mat;
    });
    // Compute bounding box on the raw clone (scale=1)
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = 2.0 / maxDim;
    clone.scale.setScalar(s);
    // Re-centre after scaling
    const box2 = new THREE.Box3().setFromObject(clone);
    const centre = new THREE.Vector3();
    box2.getCenter(centre);
    clone.position.sub(centre);
    return clone;
  }, [scene, mat]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const u = mat.uniforms;

    // Smooth opacity fade
    const target = active ? 1 : 0;
    u.uOpacity.value += (target - u.uOpacity.value) * 0.07;

    u.uTime.value  = t;
    u.uScanY.value = ((t * 0.35) % 2.2) - 1.1;

    // Glitch burst
    glitchTimer.current -= 1 / 60;
    if (glitchTimer.current <= 0) {
      u.uGlitch.value = Math.random() > 0.65 ? 1 : 0;
      glitchTimer.current = 2 + Math.random() * 4;
    }
    u.uGlitch.value += (0 - u.uGlitch.value) * 0.1;

    // Slow Y rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.2;
    }
  });

  return <primitive ref={groupRef} object={cloned} />;
}

/* ─── Floor grid ────────────────────────────────────────── */
function FloorGrid({ accent }: { accent: string }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime:  { value: 0 },
          uColor: { value: new THREE.Color(accent) },
        },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
          uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
          void main(){
            float g = max(step(0.96,mod(vUv.x*16.0,1.0)), step(0.96,mod(vUv.y*16.0,1.0)));
            float fade = smoothstep(0.0,0.25,vUv.y)*(1.0-vUv.y);
            float pulse = 0.6+0.4*sin(uTime*0.9);
            gl_FragColor = vec4(uColor, g*fade*0.22*pulse);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.getElapsedTime();
    mat.uniforms.uColor.value.set(accent);
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
      <planeGeometry args={[7, 7]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/* ─── Scene ─────────────────────────────────────────────── */
function Scene({ activeIdx }: { activeIdx: number }) {
  const { camera } = useThree();
  useEffect(() => {
    (camera as THREE.PerspectiveCamera).fov = 38;
    camera.position.set(0, 0.3, 4.5);
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [camera]);

  return (
    <>
      <FloorGrid accent={SLOTS[activeIdx].accent} />
      {SLOTS.map((slot, i) => (
        <HologramModel
          key={slot.id}
          url={slot.model}
          accent={slot.accent}
          active={i === activeIdx}
        />
      ))}
    </>
  );
}

/* ─── HUD corners ───────────────────────────────────────── */
function HudCorners({ accent }: { accent: string }) {
  const cls = "absolute w-5 h-5 pointer-events-none";
  return (
    <>
      <span className={`${cls} top-3 left-3  border-t-2 border-l-2`} style={{ borderColor: accent }} />
      <span className={`${cls} top-3 right-3 border-t-2 border-r-2`} style={{ borderColor: accent }} />
      <span className={`${cls} bottom-3 left-3  border-b-2 border-l-2`} style={{ borderColor: accent }} />
      <span className={`${cls} bottom-3 right-3 border-b-2 border-r-2`} style={{ borderColor: accent }} />
    </>
  );
}

/* ─── Scan beam (CSS) ───────────────────────────────────── */
function ScanBeam({ accent }: { accent: string }) {
  return (
    <div
      className="absolute inset-x-0 h-px pointer-events-none z-10"
      style={{
        background: `linear-gradient(90deg, transparent, ${accent}cc, transparent)`,
        animation: "hologram-scan 3s linear infinite",
        top: 0,
      }}
    />
  );
}

/* ─── Main export ───────────────────────────────────────── */
export default function HologramShowcase() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const quality = useMemo(() => getAdaptiveQuality(), []);
  const slot = SLOTS[active];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    return observeVisibility(el, setVisible, "0px 0px -10% 0px");
  }, []);

  return (
    <>
      {/* Keyframe injected once */}
      <style>{`
        @keyframes hologram-scan {
          0%   { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>

      <section
        id="hologram"
        ref={sectionRef}
        className="relative section-padding overflow-hidden"
        style={{ background: "var(--color-void)" }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 55% 45% at 50% 65%, ${slot.accent}1a 0%, transparent 70%)`,
            transition: "background 0.7s ease",
          }}
        />

        <div className="container-narrow relative z-10">
          {/* Header */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="chapter-label mb-3">3D / HOLOGRAM SHOWCASE</p>
              <h2 className="text-section-title font-display">WHAT I BUILD</h2>
            </div>
            <p className="hidden md:block text-[var(--color-ash)] font-mono text-xs max-w-[200px] text-right leading-relaxed">
              REAL PROJECTS.
              <br />
              REAL-TIME 3D.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_200px] gap-6 items-stretch">

            {/* Left — slot tabs */}
            <div className="flex md:flex-col gap-4 justify-center md:justify-start md:pt-6">
              {SLOTS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActive(i)}
                  className="text-left"
                >
                  <span
                    className="font-mono text-[10px] tracking-widest block mb-0.5"
                    style={{ color: i === active ? s.accent : "var(--color-ash)" }}
                  >
                    {s.index}
                  </span>
                  <span
                    className="font-mono text-xs font-semibold tracking-wider"
                    style={{ color: i === active ? s.accent : "var(--color-silver)" }}
                  >
                    {s.label}
                  </span>
                  <span
                    className="block h-px mt-1.5 origin-left transition-transform duration-500"
                    style={{
                      backgroundColor: s.accent,
                      transform: `scaleX(${i === active ? 1 : 0.15})`,
                      opacity: i === active ? 1 : 0.3,
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Centre — canvas */}
            <div
              className="relative overflow-hidden rounded-sm"
              style={{
                aspectRatio: "3/4",
                minHeight: 420,
                border: `1px solid ${slot.accent}33`,
                transition: "border-color 0.5s ease",
              }}
            >
              <HudCorners accent={slot.accent} />
              <ScanBeam accent={slot.accent} />

              {/* Bottom label */}
              <span
                className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-widest z-10 pointer-events-none whitespace-nowrap"
                style={{ color: slot.accent + "99" }}
              >
                SCAN {slot.index} — {slot.title}
              </span>

              {/* Canvas — always mounted once section is visible */}
              {visible ? (
                <Canvas
                  camera={{ position: [0, 0.3, 4.5], fov: 38 }}
                  dpr={[1, quality.dpr]}
                  frameloop="always"
                  gl={{
                    antialias: false,
                    alpha: true,
                    powerPreference: "high-performance",
                    stencil: false,
                  }}
                  style={{ position: "absolute", inset: 0 }}
                >
                  <Suspense fallback={null}>
                    <Scene activeIdx={active} />
                  </Suspense>
                </Canvas>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="font-mono text-xs tracking-widest animate-pulse"
                    style={{ color: slot.accent + "66" }}
                  >
                    INITIALISING...
                  </span>
                </div>
              )}
            </div>

            {/* Right — info */}
            <div className="flex flex-col justify-center gap-5 md:pl-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p
                    className="font-mono text-[10px] tracking-widest mb-2"
                    style={{ color: slot.accent }}
                  >
                    {slot.index} — {slot.label}
                  </p>
                  <h3 className="font-display text-xl font-bold text-[var(--color-starlight)] mb-3 tracking-wide">
                    {slot.title}
                  </h3>
                  <p className="text-[var(--color-silver)] text-sm leading-relaxed">
                    {slot.body}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* HUD rows */}
              <div className="space-y-2 border-t pt-4" style={{ borderColor: slot.accent + "22" }}>
                {[
                  { k: "SIGNAL",  v: "ACTIVE" },
                  { k: "OUTPUT",  v: "PRODUCTION" },
                  { k: "RENDER",  v: "REAL-TIME 3D" },
                ].map(({ k, v }) => (
                  <div key={k} className="flex justify-between font-mono text-[10px] tracking-widest">
                    <span className="text-[var(--color-ash)]">{k}</span>
                    <span style={{ color: slot.accent }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Dot nav */}
              <div className="flex gap-2 pt-1">
                {SLOTS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setActive(i)}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: i === active ? s.accent : "var(--color-smoke)",
                      transform: i === active ? "scale(1.5)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <p className="mt-10 text-center font-mono text-[10px] tracking-widest text-[var(--color-ash)]">
            HOLOGRAM RENDERED IN REAL-TIME · THREE.JS / REACT THREE FIBER · RUNS ON A POTATO
          </p>
        </div>
      </section>
    </>
  );
}
