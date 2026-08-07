"use client";

import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, AdaptiveDpr } from "@react-three/drei";
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

/* ─── Hologram shader material ──────────────────────────── */
class HologramMaterial extends THREE.ShaderMaterial {
  constructor(accent: string) {
    const color = new THREE.Color(accent);
    super({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: color },
        uOpacity: { value: 0.0 },
        uScanY: { value: 0.0 },
        uGlitch: { value: 0.0 },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uGlitch;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vFresnel;

        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);

          vec3 pos = position;
          // subtle vertex glitch on x
          float glitchOffset = sin(pos.y * 40.0 + uTime * 8.0) * uGlitch * 0.012;
          pos.x += glitchOffset;

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          vFresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.5);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uScanY;
        uniform float uGlitch;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vFresnel;

        void main() {
          // scanline bands
          float scan = sin(vPosition.y * 80.0 + uTime * 2.0) * 0.5 + 0.5;
          float scanFine = sin(vPosition.y * 300.0) * 0.5 + 0.5;
          float bands = mix(0.55, 1.0, scan) * mix(0.8, 1.0, scanFine);

          // moving scan beam
          float beam = smoothstep(0.04, 0.0, abs(vPosition.y - uScanY));
          beam += smoothstep(0.12, 0.0, abs(vPosition.y - uScanY)) * 0.3;

          // fresnel rim
          float rim = vFresnel * 1.4;

          // flicker
          float flicker = 0.92 + 0.08 * sin(uTime * 17.3);

          // glitch color shift
          vec3 col = uColor;
          col.r += uGlitch * sin(uTime * 23.0) * 0.3;
          col.b += uGlitch * cos(uTime * 19.0) * 0.3;

          float alpha = (bands * 0.55 + rim * 0.45 + beam * 0.6) * uOpacity * flicker;
          gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }
}

/* ─── Single hologram model ─────────────────────────────── */
function HologramModel({
  url,
  accent,
  active,
  autoRotate,
}: {
  url: string;
  accent: string;
  active: boolean;
  autoRotate: boolean;
}) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<HologramMaterial | null>(null);
  const targetOpacity = useRef(0);
  const glitchTimer = useRef(0);

  // Clone scene and apply hologram material to all meshes
  const cloned = useMemo(() => {
    const mat = new HologramMaterial(accent);
    matRef.current = mat;
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        (obj as THREE.Mesh).material = mat;
      }
    });
    // Normalise scale — fit inside a ~2.2 unit bounding box
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.2 / maxDim;
    clone.scale.setScalar(scale);
    // Centre vertically
    const centre = box.getCenter(new THREE.Vector3());
    clone.position.set(-centre.x * scale, -centre.y * scale, -centre.z * scale);
    return clone;
  }, [scene, accent]);

  useEffect(() => {
    targetOpacity.current = active ? 1 : 0;
  }, [active]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const mat = matRef.current;
    if (!mat) return;

    // Fade in/out
    mat.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      mat.uniforms.uOpacity.value,
      targetOpacity.current,
      0.06
    );
    mat.uniforms.uTime.value = t;

    // Scan beam sweeps up
    mat.uniforms.uScanY.value = ((t * 0.4) % 2) - 1;

    // Random glitch burst every ~4s
    glitchTimer.current -= 1 / 60;
    if (glitchTimer.current <= 0) {
      mat.uniforms.uGlitch.value = Math.random() > 0.7 ? 1.0 : 0.0;
      glitchTimer.current = 2 + Math.random() * 4;
    }
    mat.uniforms.uGlitch.value = THREE.MathUtils.lerp(
      mat.uniforms.uGlitch.value,
      0,
      0.12
    );

    // Slow auto-rotate
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = t * 0.18;
    }
  });

  return <primitive ref={groupRef} object={cloned} />;
}

/* ─── Scan-line floor plane ─────────────────────────────── */
function FloorGrid({ accent }: { accent: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(accent) },
        },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor;
          varying vec2 vUv;
          void main(){
            float grid = max(
              step(0.97, mod(vUv.x * 14.0, 1.0)),
              step(0.97, mod(vUv.y * 14.0, 1.0))
            );
            float fade = (1.0 - vUv.y) * smoothstep(0.0, 0.3, vUv.y);
            float pulse = 0.5 + 0.5 * sin(uTime * 0.8);
            gl_FragColor = vec4(uColor, grid * fade * 0.18 * (0.7 + 0.3 * pulse));
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [accent]
  );

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.getElapsedTime();
    mat.uniforms.uColor.value.set(accent);
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]}>
      <planeGeometry args={[6, 6]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/* ─── Scene wrapper ─────────────────────────────────────── */
function Scene({
  activeIdx,
  autoRotate,
}: {
  activeIdx: number;
  autoRotate: boolean;
}) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0.2, 4.2);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.05} />
      <FloorGrid accent={SLOTS[activeIdx].accent} />
      {SLOTS.map((slot, i) => (
        <HologramModel
          key={slot.id}
          url={slot.model}
          accent={slot.accent}
          active={i === activeIdx}
          autoRotate={autoRotate}
        />
      ))}
    </>
  );
}

/* ─── HUD overlay elements ──────────────────────────────── */
function HudCorners({ accent }: { accent: string }) {
  return (
    <>
      {/* TL */}
      <span
        className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 pointer-events-none"
        style={{ borderColor: accent }}
      />
      {/* TR */}
      <span
        className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 pointer-events-none"
        style={{ borderColor: accent }}
      />
      {/* BL */}
      <span
        className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 pointer-events-none"
        style={{ borderColor: accent }}
      />
      {/* BR */}
      <span
        className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 pointer-events-none"
        style={{ borderColor: accent }}
      />
    </>
  );
}

/* ─── Main section ──────────────────────────────────────── */
export default function HologramShowcase() {
  const [active, setActive] = useState(0);
  const [canvasActive, setCanvasActive] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const quality = useMemo(() => getAdaptiveQuality(), []);
  const slot = SLOTS[active];

  // Only run canvas when in viewport
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    return observeVisibility(el, setCanvasActive, "10% 0px");
  }, []);

  return (
    <section
      id="hologram"
      ref={wrapRef}
      className="relative section-padding overflow-hidden bg-[var(--color-void)]"
    >
      {/* Ambient glow behind canvas */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-700"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${slot.accent}18 0%, transparent 70%)`,
        }}
      />

      <div className="container-narrow relative z-10">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="chapter-label mb-3">3D / HOLOGRAM SHOWCASE</p>
            <h2 className="text-section-title font-display">
              WHAT I BUILD
            </h2>
          </div>
          <p className="hidden md:block text-[var(--color-ash)] font-mono text-xs max-w-xs text-right leading-relaxed">
            REAL PROJECTS. REAL STACK.
            <br />
            RENDERED IN REAL-TIME 3D.
          </p>
        </div>

        {/* Main layout: tabs left + canvas centre + info right */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_220px] gap-6 items-stretch">

          {/* ── Left: slot selector ── */}
          <div className="flex md:flex-col gap-3 md:gap-4 justify-center md:justify-start md:pt-8">
            {SLOTS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className="group text-left transition-all duration-300"
              >
                <span
                  className="font-mono text-[10px] tracking-widest block mb-0.5 transition-colors duration-300"
                  style={{ color: i === active ? s.accent : "var(--color-ash)" }}
                >
                  {s.index}
                </span>
                <span
                  className="font-mono text-xs font-semibold tracking-wider transition-colors duration-300"
                  style={{
                    color: i === active ? s.accent : "var(--color-silver)",
                  }}
                >
                  {s.label}
                </span>
                {/* active bar */}
                <span
                  className="block h-px mt-1.5 transition-all duration-500 origin-left"
                  style={{
                    backgroundColor: s.accent,
                    transform: i === active ? "scaleX(1)" : "scaleX(0.2)",
                    opacity: i === active ? 1 : 0.25,
                    width: "100%",
                  }}
                />
              </button>
            ))}
          </div>

          {/* ── Centre: 3D canvas ── */}
          <div className="relative aspect-[3/4] md:aspect-auto md:min-h-[480px] rounded-sm overflow-hidden border border-white/5">
            <HudCorners accent={slot.accent} />

            {/* scan line sweep */}
            <div
              className="absolute inset-x-0 h-px pointer-events-none z-10 animate-[scan-down_3s_linear_infinite]"
              style={{
                background: `linear-gradient(90deg, transparent, ${slot.accent}88, transparent)`,
              }}
            />

            {/* index label */}
            <span
              className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-widest z-10 pointer-events-none"
              style={{ color: slot.accent + "99" }}
            >
              SCAN {slot.index} — SUBJECT: {slot.title}
            </span>

            {/* R3F Canvas */}
            {canvasActive && (
              <Canvas
                camera={{ position: [0, 0.2, 4.2], fov: 38 }}
                dpr={quality.dpr}
                frameloop="always"
                gl={{
                  antialias: false,
                  alpha: true,
                  powerPreference: "high-performance",
                  stencil: false,
                  depth: true,
                }}
                className="absolute! inset-0"
              >
                <AdaptiveDpr pixelated />
                <Suspense fallback={null}>
                  <Scene activeIdx={active} autoRotate={!quality.reduceContinuousFx} />
                </Suspense>
              </Canvas>
            )}

            {/* Fallback while loading */}
            {!canvasActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-xs tracking-widest" style={{ color: slot.accent + "66" }}>
                  INITIALISING...
                </span>
              </div>
            )}
          </div>

          {/* ── Right: info panel ── */}
          <div className="flex flex-col justify-center gap-6 md:pl-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <p
                  className="font-mono text-[10px] tracking-widest mb-2"
                  style={{ color: slot.accent }}
                >
                  {slot.index} — {slot.label}
                </p>
                <h3 className="font-display text-2xl font-bold text-[var(--color-starlight)] mb-3 tracking-wide">
                  {slot.title}
                </h3>
                <p className="text-[var(--color-silver)] text-sm leading-relaxed">
                  {slot.body}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* HUD data rows */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              {[
                { k: "SIGNAL", v: "ACTIVE" },
                { k: "OUTPUT", v: "PRODUCTION" },
                { k: "RENDER", v: "REAL-TIME 3D" },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between font-mono text-[10px] tracking-widest">
                  <span className="text-[var(--color-ash)]">{k}</span>
                  <span style={{ color: slot.accent }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Dot nav */}
            <div className="flex gap-2">
              {SLOTS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActive(i)}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i === active ? s.accent : "var(--color-smoke)",
                    transform: i === active ? "scale(1.4)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom caption */}
        <p className="mt-10 text-center font-mono text-[10px] tracking-widest text-[var(--color-ash)]">
          HOLOGRAM RENDERED IN REAL-TIME — THREE.JS / REACT THREE FIBER — RUNS ON A POTATO
        </p>
      </div>
    </section>
  );
}
