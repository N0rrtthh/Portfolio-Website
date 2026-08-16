"use client";

import { memo } from "react";
import { TIMELINE_DATA } from "@/data/experience";

/** Right-edge waypoint rail — jumps the scroll position to a node. */
const WaypointNav = memo(function WaypointNav({
  activeNode,
  onSelect,
}: {
  activeNode: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav
      aria-label="Experience timeline waypoints"
      className="pointer-events-auto absolute right-6 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-4 md:right-12"
    >
      {TIMELINE_DATA.map((item, idx) => {
        const isActive = activeNode === idx;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(idx)}
            title={`Pilot to ${item.company}`}
            aria-current={isActive ? "true" : undefined}
            className={`group flex cursor-pointer items-center justify-end gap-3 text-left transition-[transform,opacity] duration-[250ms] ease-out will-change-transform ${
              isActive ? "scale-110 opacity-100" : "opacity-40 hover:opacity-90"
            }`}
          >
            <span
              className={`hidden font-mono text-[11px] font-bold uppercase tracking-widest transition-colors md:inline ${
                isActive
                  ? "text-amber-300 drop-shadow-[0_0_10px_#fbbf24]"
                  : "text-slate-300 group-hover:text-white"
              }`}
            >
              {item.company}
            </span>
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full border transition-[border-color,background-color,box-shadow] duration-[250ms] ease-out ${
                isActive
                  ? "border-amber-400 bg-red-500 shadow-[0_0_20px_#ff3b3b]"
                  : "border-slate-700 bg-slate-900 group-hover:border-red-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isActive ? "bg-white" : "bg-transparent"
                }`}
              />
            </span>
          </button>
        );
      })}
    </nav>
  );
});

export default WaypointNav;
