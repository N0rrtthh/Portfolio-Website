"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

/** Switches the whole site between the "Classic" cinematic design and an
 * Evangelion/NERV-inspired terminal design. The swap happens instantly. */
export default function DesignThemeToggle() {
  const { design, setDesign } = useTheme();

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const next = design === "classic" ? "eva" : "classic";
    const rect = e.currentTarget.getBoundingClientRect();
    const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

    setDesign(next, origin);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      data-cursor-hover
      className="relative inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-(--color-glass-border) bg-(--color-glass-bg) px-3.5 py-2 transition-[background-color,border-color,transform] duration-[250ms] ease-out hover:scale-105 active:scale-[0.97] will-change-transform transform-gpu hover:border-(--color-accent-orange) hover:text-(--color-starlight)"
    >
      {design === "classic" ? "Eva mode" : "Classic mode"}
    </button>
  );
}
