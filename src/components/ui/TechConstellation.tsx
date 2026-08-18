"use client";

/**
 * Tech stack as a constellation.
 *
 * The conveyor below answers "what does he use". This answers a different
 * question the conveyor structurally cannot: how the stack is SHAPED. A
 * belt is a flat list — every item equidistant, no relationships, category
 * visible only as a badge you read one item at a time. A constellation puts
 * the categories in space, so the clustering is the first thing you see and
 * the individual names are the detail you go looking for.
 *
 * Deliberately frameless: no card, no border, no panel. It sits between the
 * copy and the belt as an open field, which is also why it reads as part of
 * the page rather than as a widget parked on it.
 *
 * DRAW CALLS
 * ----------
 * Twenty nodes and ~30 edges, but two draw calls total: one InstancedMesh
 * for every node and one LineSegments for every edge. Twenty separate
 * meshes would be twenty draw calls and twenty matrix updates for a purely
 * decorative band — the kind of thing that quietly costs 2ms a frame on a
 * laptop and shows up as jank in whatever section is doing real work.
 *
 * Note what is NOT here: no GPGPU, no per-node physics textures. Twenty
 * nodes drifting on closed-form sines is a handful of CPU maths per frame;
 * simulating them on the GPU would be more machinery for no gain. The
 * hologram needed textures because it has 34,000 points with real inertia.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TECH_STACK, type TechItem } from "@/lib/data";
import { observeVisibility } from "@/lib/performance";
import { useReducedMotionPref } from "@/lib/hooks/useClientFlag";

/* ─── Layout constants (world units, orthographic) ────── */
/** Half-width of the field. The camera zoom below maps this to the band. */
const FIELD_X = 5.6;
/** Radius of a category's ring of nodes. */
const CLUSTER_R = 0.78;
/** Node radius. Small: these are stars, not buttons. */
const NODE_R = 0.075;
/** Amplitude of the idle drift. Barely perceptible per node — the point is
    that the whole field breathes, not that any node moves. */
const DRIFT = 0.055;
/** Hovered node scale-up. Enough to find with the eye, not enough to shove
    its neighbours around. */
const HOVER_SCALE = 2.2;

/** One hue per category. Ordered to match the order categories first appear
    in TECH_STACK, so adding a category doesn't reshuffle the palette. */
const CATEGORY_COLORS: Record<string, string> = {
  Frontend: "#ff5533",
  Backend:  "#33d6ff",
  Mobile:   "#b075ff",
  Creative: "#ffb000",
  Tools:    "#8dff6a",
};
const FALLBACK_COLOR = "#8a8a8a";

/** Deterministic per-index jitter. Math.random would give a different field
    on every mount (and a different one in StrictMode's second pass), so the
    layout would never be the same twice — including between a screenshot
    and the thing it's meant to document. */
function hash01(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

interface Node {
  tech: TechItem;
  /** Anchor position. Drift is applied around this, never accumulated into
      it, so the field can't wander off over a long session. */
  base: THREE.Vector3;
  color: THREE.Color;
  /** Phase offsets, so no two nodes breathe in step. */
  phase: number;
  speed: number;
}

/**
 * Places the stack: one cluster per category, spread along X, each node on
 * its cluster's ring with a deterministic wobble so the rings don't read as
 * geometry. Y is squashed relative to X because this is a wide band, not a
 * square canvas — a circular ring would leave the middle of the field empty
 * and crowd the top and bottom edges.
 */
function buildNodes(): { nodes: Node[]; edges: [number, number][]; centres: THREE.Vector3[] } {
  const categories: string[] = [];
  TECH_STACK.forEach((t) => {
    if (!categories.includes(t.category)) categories.push(t.category);
  });

  const nodes: Node[] = [];
  const edges: [number, number][] = [];
  const centres: THREE.Vector3[] = [];

  categories.forEach((cat, ci) => {
    const members = TECH_STACK.filter((t) => t.category === cat);
    // Cluster centres spread evenly across the field, alternating above and
    // below the midline so neighbouring clusters don't collide.
    const tx = categories.length === 1 ? 0.5 : ci / (categories.length - 1);
    const cx = -FIELD_X + tx * FIELD_X * 2;
    const cy = (ci % 2 === 0 ? 1 : -1) * (0.34 + hash01(ci * 7.3) * 0.22);
    const centre = new THREE.Vector3(cx, cy, 0);
    centres.push(centre);

    const first = nodes.length;
    const color = new THREE.Color(CATEGORY_COLORS[cat] ?? FALLBACK_COLOR);

    members.forEach((tech, mi) => {
      const ang = (mi / members.length) * Math.PI * 2 + hash01(ci * 13.7) * Math.PI;
      const rr = CLUSTER_R * (0.62 + hash01(first + mi) * 0.5);
      nodes.push({
        tech,
        base: new THREE.Vector3(
          centre.x + Math.cos(ang) * rr,
          // 0.55: the field is far wider than it is tall.
          centre.y + Math.sin(ang) * rr * 0.55,
          0,
        ),
        color,
        phase: hash01(first + mi + 91.3) * Math.PI * 2,
        speed: 0.35 + hash01(first + mi + 17.9) * 0.4,
      });
    });

    // Ring edges inside the cluster: each member to the next, closing the
    // loop. This is what makes a cluster read as one group rather than as
    // loose dots that happen to be near each other.
    for (let i = 0; i < members.length; i++) {
      edges.push([first + i, first + ((i + 1) % members.length)]);
    }

    // Spine: link this cluster's first node to the previous cluster's, so
    // the whole stack reads as connected rather than as five islands.
    if (ci > 0) {
      const prevFirst = nodes.findIndex((n) => n.tech.category === categories[ci - 1]);
      edges.push([prevFirst, first]);
    }
  });

  return { nodes, edges, centres };
}

/* ─── Field ─────────────────────────────────────────────── */
function Field({
  nodes, edges, hoverIdx, onHover, reduced,
}: {
  nodes: Node[];
  edges: [number, number][];
  hoverIdx: number | null;
  onHover: (i: number | null) => void;
  reduced: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  /** Scratch objects, allocated once. Building a Matrix4 per node per frame
      would hand the GC 1,200 objects a second for no reason. */
  const scratch = useRef({
    mat: new THREE.Matrix4(),
    pos: new THREE.Vector3(),
    quat: new THREE.Quaternion(),
    scl: new THREE.Vector3(),
  });
  /** Live positions, reused by the edge buffer so lines and nodes can never
      disagree about where a node is. */
  const live = useRef<THREE.Vector3[]>(nodes.map((n) => n.base.clone()));
  /** Eased hover weight per node, so highlighting is a transition rather
      than a jump between two states. */
  const hoverW = useRef<Float32Array>(new Float32Array(nodes.length));

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(edges.length * 6), 3),
    );
    return g;
  }, [edges.length]);

  useEffect(() => () => lineGeo.dispose(), [lineGeo]);

  // Instance colours never change, so they're written once rather than in
  // the frame loop.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    nodes.forEach((n, i) => mesh.setColorAt(i, n.color));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [nodes]);

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    const dt = Math.min(delta, 1 / 30);
    const k = 1 - Math.exp(-dt / 0.14);
    const s = scratch.current;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];

      // Drift is a closed-form function of time around the anchor, not an
      // accumulated velocity: no integration error, and a node is always
      // within DRIFT of where it belongs no matter how long the tab is open.
      const wob = reduced ? 0 : DRIFT;
      s.pos.set(
        n.base.x + Math.sin(t * n.speed + n.phase) * wob,
        n.base.y + Math.cos(t * n.speed * 0.83 + n.phase * 1.4) * wob,
        0,
      );
      live.current[i].copy(s.pos);

      const want = hoverIdx === i ? 1 : 0;
      hoverW.current[i] += (want - hoverW.current[i]) * (reduced ? 1 : k);
      const scale = NODE_R * (1 + hoverW.current[i] * (HOVER_SCALE - 1));

      s.scl.setScalar(scale);
      s.mat.compose(s.pos, s.quat, s.scl);
      mesh.setMatrixAt(i, s.mat);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // Edges follow the nodes they connect. Rewritten from the same live
    // positions computed above, in the same frame — the alternative (each
    // side recomputing drift) is how lines end up trailing their endpoints.
    const line = lineRef.current;
    if (line) {
      const attr = line.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let e = 0; e < edges.length; e++) {
        const a = live.current[edges[e][0]];
        const b = live.current[edges[e][1]];
        arr[e * 6]     = a.x; arr[e * 6 + 1] = a.y; arr[e * 6 + 2] = 0;
        arr[e * 6 + 3] = b.x; arr[e * 6 + 4] = b.y; arr[e * 6 + 5] = 0;
      }
      attr.needsUpdate = true;
    }
  });

  return (
    <>
      <lineSegments ref={lineRef} geometry={lineGeo}>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.13}
          depthWrite={false}
        />
      </lineSegments>

      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, nodes.length]}
        onPointerMove={(e) => {
          e.stopPropagation();
          onHover(e.instanceId ?? null);
        }}
        onPointerOut={() => onHover(null)}
      >
        {/* 16 segments: at this on-screen size the silhouette is already
            round, and more would be geometry nobody can see. */}
        <circleGeometry args={[1, 16]} />
        <meshBasicMaterial
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </instancedMesh>
    </>
  );
}

/* ─── Export ────────────────────────────────────────────── */
export default function TechConstellation({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const reduced = useReducedMotionPref();

  // Built once. The layout is deterministic, so this is a pure function of
  // TECH_STACK — no reason for it to run again.
  const { nodes, edges } = useMemo(() => buildNodes(), []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    return observeVisibility(el, setVisible, "0px 0px -5% 0px");
  }, []);

  const hovered = hoverIdx != null ? nodes[hoverIdx] : null;

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {/* Fixed height rather than an aspect ratio: this is a band across the
          column, and its height should not depend on how wide the viewport
          happens to be. */}
      <div className="relative h-[180px] md:h-[220px]">
        {visible && (
          <Canvas
            orthographic
            /* Zoom is set so FIELD_X fills the column at the common widths;
               the field is centred, so a narrower viewport crops the outer
               clusters symmetrically instead of squashing the layout. */
            camera={{ position: [0, 0, 10], zoom: 62 }}
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: true, depth: false, stencil: false }}
            style={{ position: "absolute", inset: 0 }}
          >
            <Field
              nodes={nodes}
              edges={edges}
              hoverIdx={hoverIdx}
              onHover={setHoverIdx}
              reduced={reduced}
            />
          </Canvas>
        )}
      </div>

      {/* Readout, in the DOM rather than in the canvas: it's text, and text
          belongs in the document where it can be selected, translated and
          read by a screen reader. aria-live so the name is announced when
          the pointer moves between nodes. */}
      <div
        className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest"
        aria-live="polite"
      >
        {hovered ? (
          <>
            <span
              className="inline-block h-2 w-2 shrink-0"
              style={{ background: `#${hovered.color.getHexString()}` }}
            />
            <span className="text-[var(--color-starlight)]">{hovered.tech.name}</span>
            <span className="text-[var(--color-ash)]">/ {hovered.tech.category}</span>
          </>
        ) : (
          <span className="text-[var(--color-ash)]">
            {nodes.length} tools, clustered by discipline — hover a node
          </span>
        )}
      </div>
    </div>
  );
}
