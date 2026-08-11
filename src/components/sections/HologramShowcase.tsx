"use client";

import React, { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { getAdaptiveQuality, observeVisibility } from "@/lib/performance";

const BASE = process.env.NODE_ENV === "production" ? "/Portfolio-Website" : "";

const SLOTS = [
  {
    id: "web",
    index: "1/03",
    label: "WEB / FULLSTACK",
    title: "FULL-STACK WEB",
    body: "React, Next.js, Node.js, Firebase — production apps shipped and running in the wild.",
    model: `${BASE}/3d/model_a.glb`,
    footerK: "DIRECTION",
    footerV: "3D'S",
  },
  {
    id: "mobile",
    index: "2/03",
    label: "MOBILE",
    title: "MOBILE APPS",
    body: "Cross-platform Flutter apps with offline-first architecture and real-time sync.",
    model: `${BASE}/3d/model_b.glb`,
    footerK: "BRIEF",
    footerV: "SITE / BRAND",
  },
  {
    id: "creative",
    index: "3/03",
    label: "CREATIVE / 3D",
    title: "CREATIVE DEV",
    body: "Godot games, Blender models, motion design — where engineering meets craft.",
    model: `${BASE}/3d/model_c.glb`,
    footerK: "CLIENT",
    footerV: "COMMISSION",
  },
];

/* ─── Color presets — the "outside the box" customization control ──
   Lives in the right info panel, physically outside the canvas card. */
const COLOR_PRESETS = [
  { name: "CRIMSON", hex: "#ff2200" },
  { name: "CYAN", hex: "#00e5ff" },
  { name: "AMBER", hex: "#ffb000" },
  { name: "VIOLET", hex: "#b026ff" },
  { name: "ACID", hex: "#39ff14" },
];

/* ─── Shared scan-position formula ──────────────────────────
   Both the WebGL shader and the CSS overlay derive uScanY / top%
   from this SAME real-time clock (performance.now()), instead of
   one reading a ref written by the other's render loop. That's
   what was causing the drift ("scan light faster than scan line"):
   two independent rAF loops updating/reading a shared ref never
   land on the exact same frame. Deriving both from wall-clock time
   makes them mathematically identical at any instant. */
function computeScanY(startTime: number, offset: number) {
  const elapsed = (performance.now() - startTime) / 1000;
  const cycle = 16.0;
  const t = ((elapsed + offset) % cycle) / cycle; // 0..1 sawtooth
  // Triangle wave: 0 -> 1 (first half, top to bottom) -> 0 (second half,
  // bottom back to top) instead of snapping back to the top each loop.
  const tri = t < 0.5 ? t * 2.0 : (1.0 - t) * 2.0;
  // Quintic smootherstep (not cubic) — near-zero velocity right at the
  // top/bottom turnaround, so the reversal is obviously a bounce, not a
  // constant-speed line that happens to loop.
  const eased = tri * tri * tri * (tri * (tri * 6.0 - 15.0) + 10.0);
  return 1.2 - eased * 2.4;
}

/* ─── Shaders ───────────────────────────────────────────── */

// ── Idle point cloud ──────────────────────────────────────
const VERT_PTS = /* glsl */ `
  uniform float uTime;
  uniform float uGlitch;
  uniform float uOpacity;
  varying float vY;
  varying float vAlpha;
  varying float vOpacity;
  varying float vShade;
  void main() {
    vY = position.y;
    vOpacity = uOpacity;
    vec3 p = position;
    float jitter = sin(p.y * 37.0 + uTime * 9.0) * uGlitch * 0.04;
    p.x += jitter;

    vec3 N = normalize(normalMatrix * normal);
    vec3 lightDir = normalize(vec3(0.75, 0.55, 0.15));
    float ndotl = max(dot(N, lightDir), 0.0);
    vShade = mix(0.35, 1.0, pow(ndotl, 0.8));

    float flick = 0.75 + 0.25 * sin(p.y * 60.0 + uTime * 3.0);
    vAlpha = flick * uOpacity;
    vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = clamp((2.5 / -mvPos.z) * 80.0, 1.0, 3.5) * mix(0.75, 1.35, vShade);
    gl_Position  = projectionMatrix * mvPos;
  }
`;
const FRAG_PTS = /* glsl */ `
  uniform vec3  uColor;
  uniform float uTime;
  uniform float uScanY;
  varying float vY;
  varying float vAlpha;
  varying float vOpacity;
  varying float vShade;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    if (length(uv) > 0.5) discard;
    float soft = 1.0 - smoothstep(0.3, 0.5, length(uv));
    float beam = smoothstep(0.12, 0.0, abs(vY - uScanY));
    float band = mix(0.5, 1.0, sin(vY * 80.0 + uTime * 2.0) * 0.5 + 0.5);
    // Shadow-driven visibility — raised floor so idle points stay readable
    // instead of nearly vanishing, while shaded areas still read darker.
    float shadeAlpha = mix(0.4, 1.0, vShade);
    float a = soft * vAlpha * band * shadeAlpha + beam * 0.8 * soft * vOpacity;
    vec3 col = uColor * mix(0.65, 1.15, vShade);
    gl_FragColor = vec4(col + beam * 0.4 * vOpacity, clamp(a, 0.0, 1.0));
  }
`;

// ── Hover dither mesh ────────────────────────────────────
// Glitch is now a set of independent horizontal bars spanning the full
// width (Xerox/VHS-tear style) instead of a single square block — each
// bar has its own Y, thickness, and X-displacement, driven independently
// in JS below so several tear apart at once, staggered.
const VERT_DITHER = /* glsl */ `
  #define N_BARS 3
  uniform float uBarY[N_BARS];
  uniform float uBarH[N_BARS];
  uniform float uBarAmt[N_BARS];
  uniform float uRevealY;   // normalised Y wipe front (-1.5 hidden, +1.5 all shown)
  uniform float uNormScale;  // same scale used to normalise point cloud
  uniform vec3  uNormOffset; // same offset
  varying vec3  vNorm;
  varying vec3  vWorldPos;
  varying float vGlitch;
  varying float vClip;
  void main() {
    vNorm = normalize(normalMatrix * normal);
    vec3 p = position;
    float offsetX = 0.0;
    float glitchAmt = 0.0;
    for (int i = 0; i < N_BARS; i++) {
      float inBar = step(abs(p.y - uBarY[i]), uBarH[i]);
      offsetX += inBar * uBarAmt[i];
      glitchAmt += inBar * abs(uBarAmt[i]);
    }
    p.x += offsetX;
    vGlitch = clamp(glitchAmt, 0.0, 1.0);
    vec4 wp = modelMatrix * vec4(p, 1.0);
    vWorldPos = wp.xyz;
    // Compute normalised Y (same transform as point cloud) for wipe
    float normY = (wp.y - uNormOffset.y) * uNormScale;
    // Wipe bottom-to-top: discard if normY > uRevealY
    // Soft-edged wipe band instead of a hard cutoff
    vClip = smoothstep(uRevealY - 0.22, uRevealY + 0.05, normY);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const FRAG_DITHER = /* glsl */ `
  uniform float uTime;
  uniform vec3  uColor;
  uniform float uOpacity;
  uniform float uDitherScale;
  varying vec3  vNorm;
  varying vec3  vWorldPos;
  varying float vGlitch;
  varying float vClip;

  void main() {
    float wipeAlpha = 1.0 - vClip;
    if (wipeAlpha <= 0.001) discard;

    vec3 N = normalize(vNorm);
    float ndotv = dot(N, vec3(0.0, 0.0, 1.0));
    vec3 lightDir = normalize(vec3(0.75, 0.55, 0.15));
    float ndotl = max(dot(N, lightDir), 0.0);
    float fres = pow(1.0 - clamp(ndotv, 0.0, 1.0), 2.5);

    float surface = clamp(ndotv * 0.2 + ndotl * 0.55 + 0.18, 0.0, 1.0);
    surface = pow(surface, 1.5);

    // Square halftone: each cell draws a literal square whose size scales
    // with surface brightness (classic square-dot halftone, not a soft
    // per-pixel threshold) — reads as unmistakably square, not blobby.
    float cellSize = uDitherScale * 4.0;
    vec2  cellCoord = gl_FragCoord.xy / cellSize;
    vec2  localUV   = fract(cellCoord) - 0.5;
    float halfSize  = surface * 0.5;
    vec2  d = abs(localUV) - halfSize;
    float dot_a = 1.0 - smoothstep(-0.015, 0.015, max(d.x, d.y));
    if (dot_a <= 0.01) discard;

    float shade = mix(0.1, 1.0, pow(ndotl, 0.85));

    float flick = 0.95 + 0.05 * sin(uTime * 8.0 + vWorldPos.y * 8.0);
    vec3 col = uColor * shade + fres * 0.25;
    // Glitch flash: bright white-hot core over each torn bar, plus a
    // chromatic red edge, so each horizontal tear reads unmistakably —
    // slight X-shift per channel gives a cheap chromatic-aberration look.
    col = mix(col, vec3(1.0), clamp(vGlitch * 3.5, 0.0, 1.0));
    col = mix(col, vec3(1.0, 0.05, 0.0), clamp(vGlitch * 1.5, 0.0, 1.0));
    col = clamp(col, 0.0, 1.0);
    gl_FragColor = vec4(col * flick, uOpacity * dot_a * wipeAlpha * 0.92);
  }
`;

/* ─── HologramModel ─────────────────────────────────────── */
function HologramModel({
  url, active, hovered, dragRot, scanYRef, color,
}: {
  url: string;
  active: boolean;
  hovered: boolean;
  dragRot: React.MutableRefObject<number>;
  scanYRef: React.MutableRefObject<number>;
  color: string;
}) {
  const { scene }   = useGLTF(url);
  const groupRef      = useRef<THREE.Group>(null);
  const hoverSmooth   = useRef(0);
  const autoRot       = useRef(0);
  const dragRotSmooth = useRef(0);
  const [initGlitch] = useState(() => 0.3 + Math.random() * 0.3);
  const glitchHoverT  = useRef(initGlitch);
  // Independent per-bar timers so the 5 horizontal tears fire staggered,
  // not all in lockstep — reads as a real scanner glitch, not one blink.
  const [initBarTimers] = useState<number[]>(() =>
    Array.from({ length: 3 }, () => 0.02 + Math.random() * 0.18),
  );
  const barTimers = useRef<number[]>(initBarTimers);

  const ptsMatRef = useRef<THREE.ShaderMaterial>(null as unknown as THREE.ShaderMaterial);
  const ditherMatRef = useRef<THREE.ShaderMaterial>(null as unknown as THREE.ShaderMaterial);

  if (!ptsMatRef.current) {
    ptsMatRef.current = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uColor:   { value: new THREE.Color(color) },
        uOpacity: { value: 0 },
        uScanY:   { value: 0 },
        uGlitch:  { value: 0 },
      },
      vertexShader: VERT_PTS,
      fragmentShader: FRAG_PTS,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  if (!ditherMatRef.current) {
    ditherMatRef.current = new THREE.ShaderMaterial({
      uniforms: {
        uTime:        { value: 0 },
        uColor:       { value: new THREE.Color(color) },
        uOpacity:     { value: 0 },
        uRevealY:     { value: -1.5 },
        uNormScale:   { value: 1 },
        uNormOffset:  { value: new THREE.Vector3() },
        uBarY:        { value: new Array(3).fill(-99) },
        uBarH:        { value: new Array(3).fill(0) },
        uBarAmt:      { value: new Array(3).fill(0) },
        uDitherScale: { value: 1.8 },
      },
      vertexShader: VERT_DITHER,
      fragmentShader: FRAG_DITHER,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
    });
  }

  useEffect(() => {
    return () => {
      ptsMatRef.current?.dispose();
      ditherMatRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    (ptsMatRef.current.uniforms.uColor.value as THREE.Color).set(color);
    (ditherMatRef.current.uniforms.uColor.value as THREE.Color).set(color);
  }, [color]);

  const { ptsObj, meshObj, normScale, normOffset } = useMemo(() => {
    scene.updateMatrixWorld(true);
    const allMeshes: THREE.Mesh[] = [];
    scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) allMeshes.push(o as THREE.Mesh); });

    const worldBox = new THREE.Box3();
    allMeshes.forEach((m) => worldBox.expandByObject(m));
    const worldSize   = new THREE.Vector3(); worldBox.getSize(worldSize);
    const worldCenter = new THREE.Vector3(); worldBox.getCenter(worldCenter);
    const scale = 2.0 / (Math.max(worldSize.x, worldSize.y, worldSize.z) || 1);

    const posArrays: Float32Array[] = [];
    const normArrays: Float32Array[] = [];
    allMeshes.forEach((m) => {
      const pos = m.geometry.attributes.position;
      if (!pos) return;
      if (!m.geometry.attributes.normal) m.geometry.computeVertexNormals();
      const nrm = m.geometry.attributes.normal;
      const normalMatrixWorld = new THREE.Matrix3().getNormalMatrix(m.matrixWorld);
      const arr = new Float32Array(pos.count * 3);
      const narr = new Float32Array(pos.count * 3);
      const v = new THREE.Vector3();
      const n = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
        arr[i*3]   = (v.x - worldCenter.x) * scale;
        arr[i*3+1] = (v.y - worldCenter.y) * scale;
        arr[i*3+2] = (v.z - worldCenter.z) * scale;

        n.fromBufferAttribute(nrm, i).applyMatrix3(normalMatrixWorld).normalize();
        narr[i*3] = n.x; narr[i*3+1] = n.y; narr[i*3+2] = n.z;
      }
      posArrays.push(arr);
      normArrays.push(narr);
    });
    const total = posArrays.reduce((s,a)=>s+a.length,0);
    const merged = new Float32Array(total);
    const mergedNorm = new Float32Array(total);
    let off = 0;
    for (const a of posArrays) { merged.set(a,off); off+=a.length; }
    off = 0;
    for (const a of normArrays) { mergedNorm.set(a,off); off+=a.length; }
    const ptsGeo = new THREE.BufferGeometry();
    ptsGeo.setAttribute("position", new THREE.BufferAttribute(merged, 3));
    ptsGeo.setAttribute("normal", new THREE.BufferAttribute(mergedNorm, 3));
    const ptsObj = new THREE.Points(ptsGeo, ptsMatRef.current!);

    const meshRoot = new THREE.Group();
    allMeshes.forEach((m) => {
      const mesh = new THREE.Mesh(m.geometry.clone(), ditherMatRef.current!);
      mesh.matrixAutoUpdate = false;
      mesh.matrix.copy(m.matrixWorld);
      meshRoot.add(mesh);
    });
    meshRoot.scale.setScalar(scale);
    meshRoot.position.set(
      -worldCenter.x * scale,
      -worldCenter.y * scale,
      -worldCenter.z * scale,
    );

    return { ptsObj, meshObj: meshRoot, normScale: scale, normOffset: worldCenter };
  }, [scene]);

  useEffect(() => {
    ditherMatRef.current.uniforms.uNormScale.value = normScale;
    (ditherMatRef.current.uniforms.uNormOffset.value as THREE.Vector3).copy(normOffset);
  }, [normScale, normOffset]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const dt = Math.min(delta, 1 / 30);
    const smoothing = 1 - Math.exp(-dt / 0.16);
    hoverSmooth.current += ((hovered ? 1 : 0) - hoverSmooth.current) * smoothing;
    const raw = hoverSmooth.current;
    const h = raw * raw * (3 - 2 * raw);
    const targetOp = active ? 1 : 0;

    const ptsMat = ptsMatRef.current;
    const ditherMat = ditherMatRef.current;

    ptsMat.uniforms.uOpacity.value = targetOp * (1 - h * 0.85);
    ptsMat.uniforms.uTime.value  = t;
    ptsMat.uniforms.uScanY.value = scanYRef.current;

    if (h < 0.05) {
      glitchHoverT.current -= dt;
      if (glitchHoverT.current <= 0) {
        ptsMat.uniforms.uGlitch.value = Math.random() > 0.75 ? 1 : 0;
        glitchHoverT.current = 3 + Math.random() * 5;
      }
      ptsMat.uniforms.uGlitch.value += (0 - ptsMat.uniforms.uGlitch.value) * 0.1;
    }

    if (!active) {
      ditherMat.uniforms.uRevealY.value  = -1.5;
      ditherMat.uniforms.uOpacity.value  = 0;
      ditherMat.uniforms.uTime.value     = t;
    } else {
      const revealTarget = hovered ? 1.5 : -1.5;
      ditherMat.uniforms.uRevealY.value += (revealTarget - ditherMat.uniforms.uRevealY.value) * smoothing;
      const revealProgress = Math.max(0, Math.min(1, (ditherMat.uniforms.uRevealY.value + 1.5) / 3.0));
      ditherMat.uniforms.uOpacity.value = revealProgress * revealProgress * (3 - 2 * revealProgress);
      ditherMat.uniforms.uTime.value    = t;
    }

    const barY   = ditherMat.uniforms.uBarY.value as number[];
    const barH   = ditherMat.uniforms.uBarH.value as number[];
    const barAmt = ditherMat.uniforms.uBarAmt.value as number[];
    if (active && h > 0.5) {
      for (let i = 0; i < 3; i++) {
        barTimers.current[i] -= dt;
        if (barTimers.current[i] <= 0) {
          barY[i] = (Math.random() - 0.5) * 2.4;
          barH[i] = 0.01 + Math.random() * 0.025;
          barAmt[i] = (Math.random() > 0.5 ? 1 : -1) * (0.06 + Math.random() * 0.1);
          // hold at full strength for a short beat, then this bar's own
          // decay timer (separate from the re-trigger timer) fades it out
          barTimers.current[i] = 1.2 + Math.random() * 1.6;
        }
        // Time-based decay: holds near-full strength for ~1s, then fades —
        // a real glitch blip, not a frame-locked shudder.
        barAmt[i] *= Math.pow(0.02, dt / 1.0);
      }
    } else {
      for (let i = 0; i < 3; i++) {
        barY[i] = -99;
        barH[i] = 0;
        barAmt[i] = 0;
      }
    }

    if (groupRef.current) {
      autoRot.current += dt * 0.13;
      dragRotSmooth.current += (dragRot.current - dragRotSmooth.current) * (1 - Math.exp(-dt / 0.12));
      groupRef.current.rotation.y = autoRot.current + dragRotSmooth.current;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={ptsObj} />
      <primitive object={meshObj} />
    </group>
  );
}

/* ─── Preload all models ────────────────────────────────── */
SLOTS.forEach((s) => useGLTF.preload(s.model));

/* ─── ScanDriver ───────────────────────────────────────── */
function ScanDriver({
  scanYRef, offset, startTime,
}: {
  scanYRef: React.MutableRefObject<number>;
  offset: number;
  startTime: number;
}) {
  useFrame(() => {
    scanYRef.current = computeScanY(startTime, offset);
  });
  return null;
}

/* ─── ScanSync ──────────────────────────────────────────
   Real fix for the persistent line/beam desync: the DOM overlay line was
   using a LINEAR approximation ((1.2-y)/2.4 * 100%) to guess where a 3D
   Y value lands on screen — but the camera is a perspective camera, so
   that mapping is never exact. This projects the actual (0, scanY, 0)
   point through the SAME camera used to render the beam, every frame,
   and writes the resulting screen % directly to the DOM line via ref
   (no React re-render). Single source of truth, geometrically exact. */
function ScanSync({
  domRef, offset, startTime,
}: {
  domRef: React.RefObject<HTMLDivElement | null>;
  offset: number;
  startTime: number;
}) {
  const { camera } = useThree();
  const vec = useRef(new THREE.Vector3());
  useFrame(() => {
    const y = computeScanY(startTime, offset);
    vec.current.set(0, y, 0).project(camera);
    const pct = ((1 - vec.current.y) / 2) * 100;
    if (domRef.current) {
      domRef.current.style.top = `${Math.max(0, Math.min(100, pct))}%`;
    }
  });
  return null;
}

/* ─── Scene ─────────────────────────────────────────────── */
// 3D floor-plane grid removed entirely per request — it was the source of
// the background-bleed complaint and the user doesn't want it at all now.
// The only remaining grid is the flat 2D CardGrid (z-0, strictly behind
// the Canvas at z-1) inside the card.
function Scene({
  activeIdx, hovered, dragRot, scanYRef, scanOffset, startTime, color, scanDomRef,
}: {
  activeIdx: number;
  hovered: boolean;
  dragRot: React.MutableRefObject<number>;
  scanYRef: React.MutableRefObject<number>;
  scanOffset: number;
  startTime: number;
  color: string;
  scanDomRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <ScanDriver scanYRef={scanYRef} offset={scanOffset} startTime={startTime} />
      <ScanSync domRef={scanDomRef} offset={scanOffset} startTime={startTime} />
      {SLOTS.map((slot, i) => (
        <HologramModel
          key={slot.id}
          url={slot.model}
          active={i === activeIdx}
          hovered={i === activeIdx && hovered}
          dragRot={dragRot}
          scanYRef={scanYRef}
          color={color}
        />
      ))}
    </>
  );
}

/* ─── HUD corners ───────────────────────────────────────── */
function HudCorners({ hovered, color }: { hovered: boolean; color: string }) {
  const cls = "absolute w-6 h-6 pointer-events-none transition-all duration-300";
  const col = hovered ? `${color}cc` : `${color}33`;
  return (
    <>
      <span className={`${cls} top-2 left-2  border-t-2 border-l-2`} style={{ borderColor: col }} />
      <span className={`${cls} top-2 right-2 border-t-2 border-r-2`} style={{ borderColor: col }} />
      <span className={`${cls} bottom-2 left-2  border-b-2 border-l-2`} style={{ borderColor: col }} />
      <span className={`${cls} bottom-2 right-2 border-b-2 border-r-2`} style={{ borderColor: col }} />
    </>
  );
}

/* ─── CSS scan line — a dumb positioned element now. Its top% is written
   every frame by ScanSync (inside the Canvas, via camera.project), not
   computed here — that's what keeps it pixel-exact with the beam. */
function CssScanLine({
  domRef, hovered, color,
}: {
  domRef: React.RefObject<HTMLDivElement | null>;
  hovered: boolean;
  color: string;
}) {
  const sqSize = 5;
  const sqStyle: React.CSSProperties = {
    width: sqSize,
    height: sqSize,
    background: color,
    opacity: hovered ? 0.8 : 0.55,
    flexShrink: 0,
  };

  return (
    <div
      ref={domRef}
      className="absolute inset-x-0 pointer-events-none z-20"
      style={{ top: "0%" }}
    >
      {/* Scanner line with square bracket caps — flat, no glow/blur */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={sqStyle} />
        <div style={{
          flex: 1,
          height: 1,
          background: color,
          opacity: hovered ? 0.65 : 0.4,
        }} />
        <div style={sqStyle} />
      </div>
    </div>
  );
}

/* ─── Subtle grid inside the canvas card ───────────────── */
// Flat 2D CSS grid, sits strictly behind the canvas (z-0, canvas is z-1)
// so it never paints over the model. This is now the ONLY grid in the
// scene since the 3D floor plane was removed.
function CardGrid({ color }: { color: string }) {
  const alpha = "18";
  return (
    <div
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: [
          `linear-gradient(${color}${alpha} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${color}${alpha} 1px, transparent 1px)`,
        ].join(","),
        backgroundSize: "48px 48px",
      }}
    />
  );
}

/* ─── Main export ───────────────────────────────────────── */
export default function HologramShowcase() {
  const [active, setActive]   = useState(0);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [color, setColor]     = useState(COLOR_PRESETS[0].hex);
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasWrap = useRef<HTMLDivElement>(null);
  const quality    = useMemo(() => getAdaptiveQuality(), []);
  const slot       = SLOTS[active];

  const startTimeRef = useRef(performance.now());
  const scanYRef   = useRef(1.2);
  const scanLineDomRef = useRef<HTMLDivElement>(null);
  const dragRot    = useRef(0);
  const isDragging = useRef(false);
  const lastX      = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    dragRot.current += (e.clientX - lastX.current) * 0.011;
    lastX.current = e.clientX;
  };
  const onPointerUp = () => { isDragging.current = false; };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    return observeVisibility(el, setVisible, "0px 0px -10% 0px");
  }, []);

  const scanOffset = active * 2.7;

  return (
    <section
      id="hologram"
      ref={sectionRef}
      className="relative section-padding overflow-hidden"
      style={{ background: "var(--color-void)" }}
    >
      {/* Ambient glow behind everything */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: hovered
            ? `radial-gradient(ellipse 55% 45% at 50% 60%, ${color}14 0%, transparent 70%)`
            : `radial-gradient(ellipse 40% 35% at 50% 65%, ${color}08 0%, transparent 70%)`,
          transition: "background 0.6s ease",
        }}
      />

      <div className="container-narrow relative z-10">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="chapter-label mb-3">3D / HOLOGRAM SHOWCASE</p>
            <h2 className="text-section-title font-display">NRTH.</h2>
          </div>
          <p className="hidden md:block text-[var(--color-ash)] font-mono text-xs max-w-[200px] text-right leading-relaxed">
            ELRONI QUINONES.<br />NRTH.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_200px] gap-6 items-stretch">

          {/* Left tabs */}
          <div className="flex md:flex-col gap-4 justify-center md:justify-start md:pt-6">
            {SLOTS.map((s, i) => (
              <button key={s.id} onClick={() => setActive(i)} className="text-left">
                <span
                  className="font-mono text-[10px] tracking-widest block mb-0.5"
                  style={{ color: i === active ? color : "var(--color-ash)" }}
                >
                  {s.index}
                </span>
                <span
                  className="font-mono text-xs font-semibold tracking-wider"
                  style={{ color: i === active ? color : "var(--color-silver)" }}
                >
                  {s.label}
                </span>
                <span
                  className="block h-px mt-1.5 origin-left transition-transform duration-500"
                  style={{
                    backgroundColor: color,
                    transform: `scaleX(${i === active ? 1 : 0.12})`,
                    opacity: i === active ? 1 : 0.25,
                  }}
                />
              </button>
            ))}
          </div>

          {/* Canvas card */}
          <div
            ref={canvasWrap}
            className="relative overflow-hidden rounded-sm"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); isDragging.current = false; }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{
              aspectRatio: "3/4",
              minHeight: 420,
              border: `1px solid ${hovered ? `${color}55` : `${color}18`}`,
              transition: "border-color 0.4s ease",
              cursor: "grab",
              background: "#000",
            }}
          >
            {/* Subtle grid inside the card — strictly background (z-0) */}
            <CardGrid color={color} />

            <HudCorners hovered={hovered} color={color} />

            {/* Scan line — only rendered once canvas is visible */}
            {visible && (
              <CssScanLine
                domRef={scanLineDomRef}
                hovered={hovered}
                color={color}
              />
            )}

            <span
              className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-widest z-10 pointer-events-none whitespace-nowrap"
              style={{ color: hovered ? `${color}88` : `${color}33` }}
            >
              SCAN {slot.index} — {slot.title}
            </span>

            {visible ? (
              <Canvas
                camera={{ position: [0, 0.2, 4.2], fov: 40 }}
                dpr={[1, quality.dpr]}
                frameloop="always"
                gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false }}
                style={{ position: "absolute", inset: 0, zIndex: 1 }}
              >
                <Suspense fallback={null}>
                  <Scene
                    activeIdx={active}
                    hovered={hovered}
                    dragRot={dragRot}
                    scanYRef={scanYRef}
                    scanOffset={scanOffset}
                    startTime={startTimeRef.current}
                    color={color}
                    scanDomRef={scanLineDomRef}
                  />
                </Suspense>
              </Canvas>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
                <span className="font-mono text-xs tracking-widest animate-pulse" style={{ color: `${color}33` }}>
                  INITIALISING...
                </span>
              </div>
            )}
          </div>

          {/* Right info */}
          <div className="flex flex-col justify-center gap-5 md:pl-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="font-mono text-[10px] tracking-widest mb-2" style={{ color }}>
                  {slot.index} — {slot.label}
                </p>
                <h3 className="font-display text-xl font-bold text-[var(--color-starlight)] mb-3 tracking-wide">
                  {slot.title}
                </h3>
                <p className="text-[var(--color-silver)] text-sm leading-relaxed">{slot.body}</p>
              </motion.div>
            </AnimatePresence>

            <div className="space-y-2 border-t pt-4" style={{ borderColor: `${color}18` }}>
              {[
                { k: "SIGNAL", v: slot.footerK },
                { k: "OUTPUT", v: slot.footerV },
                { k: "RENDER", v: "REAL-TIME 3D" },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between font-mono text-[10px] tracking-widest">
                  <span className="text-[var(--color-ash)]">{k}</span>
                  <span style={{ color }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Color customization — deliberately placed outside the canvas box */}
            <div className="space-y-2 border-t pt-4" style={{ borderColor: `${color}18` }}>
              <div className="flex justify-between font-mono text-[10px] tracking-widest">
                <span className="text-[var(--color-ash)]">SPECTRUM</span>
                <span style={{ color }}>{COLOR_PRESETS.find((p) => p.hex === color)?.name ?? "CUSTOM"}</span>
              </div>
              <div className="flex gap-2">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.hex}
                    onClick={() => setColor(p.hex)}
                    aria-label={`Set hologram color to ${p.name}`}
                    className="transition-transform duration-200"
                    style={{
                      width: 16,
                      height: 16,
                      background: p.hex,
                      boxShadow: p.hex === color ? `0 0 8px 2px ${p.hex}99` : "none",
                      transform: p.hex === color ? "scale(1.15)" : "scale(1)",
                      outline: p.hex === color ? `1px solid ${p.hex}` : "1px solid transparent",
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              {SLOTS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActive(i)}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i === active ? color : "var(--color-smoke)",
                    transform: i === active ? "scale(1.5)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="mt-10 text-center font-mono text-[10px] tracking-widest text-[var(--color-ash)]">
          DWN · NRTH · RON
        </p>
      </div>
    </section>
  );
}