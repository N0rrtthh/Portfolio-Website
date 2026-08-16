"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence } from "framer-motion";
import { CornerDownRight } from "lucide-react";
import ChapterLabel from "@/components/ui/ChapterLabel";
import {
  NODE_THRESHOLDS,
  TIMELINE_DATA,
  TIMELINE_SCROLL_VH,
} from "@/data/experience";
import { useSectionProgress } from "@/lib/hooks/useSectionProgress";
import { getAdaptiveQuality, observeVisibility } from "@/lib/performance";
import DossierModal from "./DossierModal";
import NodeCard from "./NodeCard";
import TimelineScene from "./TimelineScene";
import WaypointNav from "./WaypointNav";

/** Maps raw scroll progress to the active node index. */
function nodeForProgress(progress: number) {
  for (let i = 0; i < NODE_THRESHOLDS.length; i++) {
    if (progress < NODE_THRESHOLDS[i]) return i;
  }
  return NODE_THRESHOLDS.length;
}

/**
 * "My Experience" — a sticky flight-path timeline.
 *
 * Performance contract:
 *  • Scroll progress flows through a ref, so scrolling causes no React renders.
 *    The only state that changes is `activeNode` (4 times across 320vh).
 *  • The dossier card is real DOM positioned by a single transform write from
 *    the r3f frame loop, instead of drei's <Html> (which reads layout and
 *    writes a matrix3d every frame for every mounted card).
 *  • The WebGL loop is fully parked (`frameloop="never"`) whenever the section
 *    is outside the viewport or the dossier modal is open.
 */
export default function ExperienceTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardHostRef = useRef<HTMLDivElement>(null);

  const [activeNode, setActiveNode] = useState(0);
  const [inspectedNode, setInspectedNode] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);

  const quality = useMemo(() => getAdaptiveQuality(), []);

  const handleProgress = useCallback((progress: number) => {
    const next = nodeForProgress(progress);
    setActiveNode((prev) => (prev === next ? prev : next));
  }, []);

  const { progressRef, scrollToProgress } = useSectionProgress(
    sectionRef,
    handleProgress
  );

  // Defer canvas + portal until after first paint.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Park the render loop while the section is offscreen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    return observeVisibility(el, setInView, "25% 0px");
  }, []);

  // Lock page scroll while the dossier is open.
  useEffect(() => {
    if (inspectedNode === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [inspectedNode]);

  const handleWaypoint = useCallback(
    (index: number) => scrollToProgress(TIMELINE_DATA[index].scrollTarget),
    [scrollToProgress]
  );

  const closeDossier = useCallback(() => setInspectedNode(null), []);
  const inspectActive = useCallback(
    () => setInspectedNode(activeNode),
    [activeNode]
  );

  const activeItem = TIMELINE_DATA[activeNode];
  const inspectedItem = inspectedNode !== null ? TIMELINE_DATA[inspectedNode] : null;
  const renderScene = inView && inspectedNode === null;

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative w-full bg-[#05060b]"
      style={{ height: `${TIMELINE_SCROLL_VH}vh` }}
    >
      {mounted &&
        createPortal(
          <AnimatePresence>
            {inspectedItem && (
              <DossierModal
                key={inspectedItem.id}
                item={inspectedItem}
                onClose={closeDossier}
              />
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Sticky viewport frame */}
      <div className="sticky top-0 left-0 h-screen w-full overflow-hidden">
        {/* Header overlay */}
        <div className="pointer-events-none absolute top-16 left-0 z-20 w-full px-6 md:top-20 md:px-12">
          <div className="mx-auto flex max-w-7xl items-end justify-between">
            <div>
              <ChapterLabel
                index={5}
                classic="Expedition Timeline"
                eva="MISSION LOG"
                className="mb-1"
              />
              <h2 className="font-brand text-2xl font-bold uppercase tracking-tight text-white md:text-3xl">
                My Experience
              </h2>
            </div>

            {/* Active checkpoint telemetry */}
            <div className="hidden items-center gap-3 rounded-full border border-red-500/40 bg-slate-950/90 px-3.5 py-1.5 font-mono text-xs shadow-lg backdrop-blur-xl md:flex">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-slate-400">ACTIVE CHECKPOINT:</span>
              <span className="font-bold text-red-400">
                {activeItem.number} / 0{TIMELINE_DATA.length}
              </span>
            </div>
          </div>
        </div>

        <WaypointNav activeNode={activeNode} onSelect={handleWaypoint} />

        {/* Scroll guidance */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>SCROLL TO PILOT THE JOURNEY // WARPS TO TECH STACK</span>
          <CornerDownRight className="h-3.5 w-3.5 text-red-500" />
        </div>

        {/* Dossier card — positioned imperatively by the scene */}
        <div
          ref={cardHostRef}
          className="absolute top-0 left-0 z-10 will-change-transform"
          style={{ opacity: 0, visibility: "hidden", pointerEvents: "none" }}
        >
          <NodeCard item={activeItem} onInspect={inspectActive} />
        </div>

        {/* 3D WebGL canvas */}
        <div className="absolute inset-0 z-0">
          {mounted && (
            <Canvas
              camera={{ position: [0, 0, 14], fov: 60 }}
              /* Full-screen emissive scene — fragment cost dominates, so the
                 backing store stays at 1x regardless of device pixel ratio. */
              dpr={1}
              frameloop={renderScene ? "always" : "never"}
              gl={{
                antialias: quality.antialias,
                alpha: false,
                powerPreference: "high-performance",
                stencil: false,
                depth: true,
              }}
              style={{ touchAction: "none" }}
            >
              <TimelineScene
                progressRef={progressRef}
                activeNode={activeNode}
                quality={quality}
                cardHostRef={cardHostRef}
              />
            </Canvas>
          )}
        </div>
      </div>
    </section>
  );
}
