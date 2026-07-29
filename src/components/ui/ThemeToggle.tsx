"use client";

import { useState, useRef } from "react";
import { Moon, Sun, ShieldAlert, Sparkles } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
  const { mode, toggleMode, design, setDesign } = useTheme();
  const [showSecretClassic, setShowSecretClassic] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    toggleMode({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }

  // Secret 2-second hover handler for EVA Mode
  const handleMouseEnter = () => {
    if (design !== "eva") return;
    setIsHovering(true);

    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setShowSecretClassic(true);
    }, 2000); // 2 seconds continuous hover secret threshold
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  };

  function handleSwitchToClassic(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setShowSecretClassic(false);
    const rect = e.currentTarget.getBoundingClientRect();
    setDesign("classic", { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }

  return (
    <div
      className="relative inline-flex items-center overflow-visible z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dark/Light Mode Toggle Switch */}
      <button
        type="button"
        onClick={handleClick}
        aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        data-cursor-hover
        className={`relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full border bg-[var(--color-glass-bg)] px-1 transition-all duration-300 ease-out hover:scale-105 active:scale-[0.97] transform-gpu ${
          isHovering && design === "eva"
            ? "border-[var(--color-accent-warm)] shadow-[0_0_15px_var(--color-accent-warm)]"
            : "border-[var(--color-glass-border)]"
        }`}
      >
        {/* Secret progress ring effect during hover in EVA mode */}
        {isHovering && design === "eva" && !showSecretClassic && (
          <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-60 pointer-events-none" />
        )}

        {/* Sliding background thumb */}
        <span
          className="pointer-events-none absolute h-7 w-7 rounded-full bg-[var(--color-accent-primary)] shadow-md transition-transform duration-300 ease-out"
          style={{
            transform: mode === "dark" ? "translateX(0)" : "translateX(28px)",
          }}
          aria-hidden="true"
        />

        {/* Icons row */}
        <span className="pointer-events-none relative z-10 flex w-full items-center justify-between px-1.5 text-[var(--color-starlight)]">
          <Moon size={14} className={`transition-opacity duration-200 ${mode === "dark" ? "opacity-100 font-bold" : "opacity-40"}`} />
          <Sun size={14} className={`transition-opacity duration-200 ${mode === "light" ? "opacity-100 font-bold" : "opacity-40"}`} />
        </span>
      </button>

      {/* Secret Popover: Unlocks DIRECTLY AT the dark mode switch when hovered for 2 seconds in EVA Mode */}
      <AnimatePresence>
        {showSecretClassic && design === "eva" && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            className="absolute top-12 right-0 z-[9999] p-3.5 rounded-2xl border border-[var(--color-accent-warm)] bg-[#070913]/98 backdrop-blur-3xl shadow-[0_10px_40px_rgba(57,255,20,0.5)] flex flex-col gap-2.5 min-w-[220px]"
          >
            <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-widest text-[var(--color-accent-warm)] uppercase border-b border-white/10 pb-2">
              <Sparkles size={13} className="animate-spin text-emerald-400" />
              <span>MAGI OVERRIDE UNLOCKED</span>
            </div>

            <button
              type="button"
              onClick={handleSwitchToClassic}
              data-cursor-hover
              className="w-full px-4 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider flex items-center justify-center gap-2 bg-[var(--color-accent-warm)] text-black hover:bg-white transition-all duration-200 shadow-[0_0_20px_rgba(57,255,20,0.6)] active:scale-[0.97]"
            >
              <ShieldAlert size={14} />
              <span>UNIVERSE // CLASSIC</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
