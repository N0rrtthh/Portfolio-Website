"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MoveHorizontal } from "lucide-react";
import ProjectCover from "@/components/ui/ProjectCover";
import type { Project } from "@/lib/data";

/** A free-drag horizontal filmstrip of every project — an explicit
 * horizontal-scroll interaction layered on top of the page's vertical flow. */
export default function ProjectReel({ projects }: { projects: Project[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragRange, setDragRange] = useState(0);

  useEffect(() => {
    function measure() {
      if (!trackRef.current) return;
      const overflow = trackRef.current.scrollWidth - trackRef.current.clientWidth;
      setDragRange(Math.max(overflow, 0));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [projects]);

  return (
    <div className="relative mb-16">
      <div
        ref={trackRef}
        className="scrollbar-none overflow-x-auto overflow-y-hidden"
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: -dragRange, right: 0 }}
          dragElastic={0.08}
          className="flex w-max cursor-grab gap-4 pb-2 active:cursor-grabbing"
        >
          {projects.map((project) => (
            <a
              key={project.id}
              href={`#projects`}
              data-cursor-hover
              className="w-56 shrink-0 select-none"
              draggable={false}
              onClick={(e) => {
                // prevent the drag from also firing as a stray click
                if (dragRange > 0) e.preventDefault();
              }}
            >
              <ProjectCover
                title={project.title}
                type={project.type}
                color={project.color}
                size="sm"
              />
              <p className="mt-3 font-body text-sm font-medium text-(--color-pearl)">
                {project.title}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wide text-(--color-ash)">
                {project.year}
              </p>
            </a>
          ))}
        </motion.div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-(--color-ash)">
        <MoveHorizontal size={13} />
        <span className="chapter-label">Drag to explore the reel</span>
      </div>
    </div>
  );
}
