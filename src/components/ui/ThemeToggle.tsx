"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function ThemeToggle() {
  const { mode, toggleMode } = useTheme();

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    toggleMode({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      data-cursor-hover
      className="relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-1 transition-[background-color,border-color,transform] duration-[250ms] ease-out hover:scale-105 active:scale-[0.97] will-change-transform transform-gpu"
    >
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
  );
}
