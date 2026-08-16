"use client";

import { memo } from "react";
import { Calendar, MapPin } from "lucide-react";
import type { TimelineEntry } from "@/types/experience";

/**
 * Dossier card for the active timeline node.
 *
 * Lives in normal DOM (positioned by TimelineScene via a transform on its host
 * wrapper) rather than inside drei's <Html>. That keeps the text on the regular
 * paint path and avoids the per-frame layout read + matrix3d write that <Html>
 * performs, which was the main source of scroll stutter in this section.
 */
const NodeCard = memo(function NodeCard({
  item,
  onInspect,
}: {
  item: TimelineEntry;
  onInspect: () => void;
}) {
  const Icon = item.icon;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onInspect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onInspect();
        }
      }}
      className="group/card relative w-[20rem] cursor-pointer rounded-3xl border border-red-500 bg-slate-950/95 p-5 shadow-lg shadow-red-500/20 outline-none transition-colors duration-200 hover:border-amber-400/70 focus-visible:ring-2 focus-visible:ring-amber-300 sm:w-[22rem] sm:p-6 md:w-[26rem]"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/20 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-red-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          {item.badge}
        </span>
        <span className="font-mono text-2xl font-black text-red-400">
          {item.number}
        </span>
      </div>

      <div className="mb-2.5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/50 bg-red-500/20 text-red-400 shadow-inner">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-brand text-lg font-extrabold leading-snug text-white transition-colors group-hover/card:text-amber-300">
            {item.role}
          </h3>
          <p className="mt-0.5 font-mono text-xs font-bold tracking-wider text-red-400">
            {item.company}
          </p>
        </div>
      </div>

      <div className="mb-2.5 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 font-mono text-[11px] text-slate-300">
        <div className="flex items-center gap-1">
          <Calendar size={12} className="text-red-400" />
          <span className="font-semibold text-white">{item.period}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <MapPin size={12} className="text-red-400" />
          <span>{item.location}</span>
        </div>
      </div>

      <p className="mb-3 line-clamp-3 font-sans text-xs leading-relaxed text-slate-200">
        {item.description}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-slate-800/80 pt-2.5">
        <div className="flex flex-wrap gap-1">
          {item.tech.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-md border border-red-500/30 bg-red-950/40 px-2 py-0.5 font-mono text-[9px] font-semibold text-red-200"
            >
              {t}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInspect();
          }}
          className="group/btn flex cursor-pointer items-center gap-2 rounded-full border border-red-500/40 bg-slate-950/80 px-3.5 py-1.5 font-mono text-[11px] font-bold tracking-wider text-red-300 shadow-[0_0_18px_rgba(239,68,68,0.25)] transition-colors duration-200 hover:border-red-400 hover:bg-red-950/70 hover:text-white"
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
          <span>INSPECT DOSSIER</span>
          <span className="font-sans text-red-400 transition-transform group-hover/btn:translate-x-0.5">
            →
          </span>
        </button>
      </div>
    </div>
  );
});

export default NodeCard;
