"use client";

import { useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { SlidersHorizontal, PanelLeft, Terminal, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingThemeToggle() {
  const { design, setDesign, evaLoaderStyle, toggleEvaLoaderStyle } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  // If in classic mode, keep EVA mode options hidden/secret (only available once triggered or in EVA mode)
  if (design === "classic") {
    return null; // Kept lowkey & secret in classic mode as requested
  }

  function handleSwitchToClassic(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    setDesign("classic", origin);
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 select-none">
      {/* Settings Menu Popup when expanded (EVA Mode Controls) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, transform: "translateY(10px) scale(0.95)" }}
            animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
            exit={{ opacity: 0, transform: "translateY(10px) scale(0.95)" }}
            transition={{ duration: 0.2 }}
            className="p-3 rounded-2xl border backdrop-blur-2xl shadow-2xl flex flex-col gap-2 min-w-[240px] border-[#ff6600]/40 bg-[#070913]/95 text-white shadow-[0_0_30px_rgba(255,102,0,0.25)]"
          >
            <div className="px-2 py-1 flex items-center justify-between border-b border-white/10 text-[10px] font-mono font-bold tracking-widest text-[#ff6600] uppercase">
              <span>EVA TACTICAL PREFERENCES</span>
              <SlidersHorizontal size={12} />
            </div>

            {/* EVA Mode Specific Loader Toggle */}
            <div className="flex flex-col gap-1 pt-1">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-silver)] px-1">
                Eva Loading Screen
              </span>
              <button
                type="button"
                onClick={toggleEvaLoaderStyle}
                data-cursor-hover
                className={`w-full px-3 py-2 rounded-xl font-mono text-xs font-bold tracking-wider flex items-center justify-between transition-[background-color,color,transform] duration-200 ease-out active:scale-[0.97] ${
                  evaLoaderStyle === "side"
                    ? "bg-purple-950/80 border border-purple-500/60 text-purple-300 hover:bg-purple-900 hover:text-white"
                    : "bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 hover:bg-emerald-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {evaLoaderStyle === "side" ? (
                    <PanelLeft size={13} className="text-purple-400" />
                  ) : (
                    <Terminal size={13} className="text-emerald-400" />
                  )}
                  <span>{evaLoaderStyle === "side" ? "SIDE HUD (DEFAULT)" : "TERMINAL BOOT"}</span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Buttons Group (Visible ONLY in EVA Mode) */}
      <div className="flex items-center gap-2">
        {/* Settings Toggle Trigger Button */}
        <button
          type="button"
          onClick={() => setShowSettings((prev) => !prev)}
          data-cursor-hover
          title="Configure System Preferences & Eva Loader"
          className={`h-10 w-10 rounded-full flex items-center justify-center transition-[background-color,color,transform,box-shadow] duration-[250ms] ease-out active:scale-[0.97] shadow-xl border border-[#ff6600]/50 bg-[var(--color-obsidian)] text-[#ff6600] hover:text-white ${
            showSettings ? "bg-[#ff6600] text-white shadow-[0_0_20px_rgba(255,102,0,0.5)]" : ""
          }`}
        >
          <SlidersHorizontal size={15} />
        </button>

        {/* Primary Universe Return Button */}
        <button
          type="button"
          onClick={handleSwitchToClassic}
          data-cursor-hover
          className="rounded-full px-5 py-2.5 font-mono text-xs font-bold tracking-widest transition-[background-color,color,transform,box-shadow] duration-[250ms] ease-out active:scale-[0.97] shadow-xl border border-[#ff6600]/50 bg-[var(--color-obsidian)] text-[#ff6600] hover:bg-[#ff6600] hover:text-white shadow-[0_0_20px_rgba(255,102,0,0.4)] flex items-center gap-2"
        >
          <ShieldAlert size={14} />
          <span>UNIVERSE // CLASSIC</span>
        </button>
      </div>
    </div>
  );
}
