"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { SlidersHorizontal, PanelLeft, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingThemeToggle() {
  const { design, evaLoaderStyle, toggleEvaLoaderStyle } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Prevent hydration mismatch by returning null until mounted on client
  if (!mounted) return null;

  // If in classic mode, return null
  if (design === "classic") {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 select-none">
      {/* Settings Menu Popup when expanded (EVA Mode Loading Screen Controls) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex min-w-[260px] flex-col gap-3 rounded-2xl border border-[var(--color-accent-primary)]/50 bg-[#070913]/95 p-4 text-white shadow-2xl shadow-[0_0_30px_rgba(122,0,255,0.3)] backdrop-blur-2xl"
          >
            <div className="px-2 py-1 flex items-center justify-between border-b border-white/10 text-[10px] font-mono font-bold tracking-widest text-[var(--color-accent-warm)] uppercase">
              <span>EVA SYSTEM PREFERENCES</span>
              <SlidersHorizontal size={12} />
            </div>

            {/* EVA Mode Specific Loader Toggle */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-silver)] px-1">
                Eva Loading Animation Style
              </span>
              <button
                type="button"
                onClick={toggleEvaLoaderStyle}
                data-cursor-hover
                className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider flex items-center justify-between transition-all duration-200 active:scale-[0.97] ${
                  evaLoaderStyle === "side"
                    ? "bg-purple-950/80 border border-purple-500/60 text-purple-300 hover:bg-purple-900 hover:text-white"
                    : "bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 hover:bg-emerald-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  {evaLoaderStyle === "side" ? (
                    <PanelLeft size={14} className="text-purple-400" />
                  ) : (
                    <Terminal size={14} className="text-emerald-400" />
                  )}
                  <span>{evaLoaderStyle === "side" ? "SIDE HUD (DEFAULT)" : "TERMINAL BOOT"}</span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button in EVA Mode — Retaining ONLY the EVA Loader Settings */}
      <button
        type="button"
        onClick={() => setShowSettings((prev) => !prev)}
        data-cursor-hover
        title="EVA Loader Settings"
        className={`h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300 active:scale-[0.97] shadow-xl border border-[var(--color-accent-primary)]/50 bg-[var(--color-obsidian)] text-[var(--color-accent-warm)] hover:text-white hover:border-[var(--color-accent-warm)] ${
          showSettings ? "bg-[var(--color-accent-primary)] text-white shadow-[0_0_20px_var(--color-accent-primary)]" : ""
        }`}
      >
        <SlidersHorizontal size={16} />
      </button>
    </div>
  );
}
