"use client";

import { memo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Cpu,
  FileText,
  Layers,
  MapPin,
  Terminal,
  X,
} from "lucide-react";
import type { TimelineEntry } from "@/types/experience";

/**
 * Full mission dossier. Mounted only while open (via AnimatePresence in the
 * parent), so none of this markup exists in the DOM during normal scrolling.
 */
const DossierModal = memo(function DossierModal({
  item,
  onClose,
}: {
  item: TimelineEntry;
  onClose: () => void;
}) {
  // Escape to dismiss
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.role} at ${item.company}`}
      className="pointer-events-auto fixed inset-0 z-[99999] flex select-none items-center justify-center bg-black/80 p-4 font-sans backdrop-blur-2xl sm:p-6 md:p-8"
    >
      {/* Ambient radial lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/15 blur-[140px]" />

      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="scrollbar-none relative z-[100000] max-h-[86vh] w-full max-w-3xl overflow-y-auto rounded-[2.25rem] border border-white/15 bg-[#0a0a10]/95 p-6 text-slate-100 shadow-[0_30px_100px_rgba(0,0,0,0.85)] sm:p-8"
      >
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:text-xs">
              {item.operationCode} • {item.period}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="group/close flex h-9 cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300 transition-colors duration-200 hover:bg-white/15 hover:text-white"
          >
            <X
              size={15}
              className="transition-transform duration-200 group-hover/close:rotate-90"
            />
            <span>Close</span>
          </button>
        </div>

        {/* Hero header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Icon size={28} />
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide text-indigo-400">
              <span>MISSION {item.number}</span>
              <span>•</span>
              <span>{item.company}</span>
            </div>
            <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
              {item.role}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <MapPin size={12} className="text-indigo-400" />
                {item.location}
              </span>
              <span>•</span>
              <span>{item.coordinates}</span>
            </div>
          </div>
        </div>

        {/* Executive summary */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <h3 className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-indigo-300">
            <Terminal size={13} /> Mission Briefing &amp; Context
          </h3>
          <p className="font-sans text-sm leading-relaxed text-slate-200">
            {item.description}
          </p>
        </div>

        {/* Key objectives */}
        <div className="mb-6">
          <h3 className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <FileText size={13} className="text-amber-400" /> Key Deliverables &amp;
            Impact
          </h3>
          <div className="grid gap-2.5">
            {item.highlights.map((h, i) => (
              <div
                key={h}
                className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 transition-colors hover:border-white/15"
              >
                <span className="shrink-0 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-300">
                  0{i + 1}
                </span>
                <span className="font-sans text-xs leading-snug text-slate-200 sm:text-sm">
                  {h}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture & telemetry */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <span className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-300">
              <Layers size={13} className="text-cyan-400" /> Architecture Schematic
            </span>
            <p className="font-sans text-xs leading-relaxed text-slate-300">
              {item.details.architecture}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <span className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              <Activity size={13} className="text-emerald-400" /> Measured Telemetry
            </span>
            <p className="font-sans text-xs leading-relaxed text-slate-300">
              {item.details.impact}
            </p>
          </div>
        </div>

        {/* Arsenal */}
        <div className="border-t border-white/10 pt-4">
          <span className="mb-2.5 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <Cpu size={13} className="text-indigo-400" /> Deployed Arsenal:
          </span>
          <div className="flex flex-wrap gap-2">
            {item.tech.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-slate-300"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default DossierModal;
