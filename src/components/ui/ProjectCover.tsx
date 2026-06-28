"use client";

import { Code2, Gamepad2, Globe, Layers, Smartphone } from "lucide-react";

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Game: Gamepad2,
  "Web Application": Globe,
  "Mobile Application": Smartphone,
  "Full Stack": Layers,
};

/** Generative abstract cover art used as a stand-in for a real project
 * screenshot — tinted to the project's accent color so every card still
 * feels alive even without real product photography. */
import Image from "next/image";

export default function ProjectCover({
  title,
  type,
  color,
  image,
  size = "lg",
}: {
  title: string;
  type: string;
  color: string;
  image?: string;
  size?: "lg" | "sm";
}) {
  const Icon = TYPE_ICON[type] ?? Code2;
  const initial = title.trim().charAt(0).toUpperCase();

  return (
    <div
      className={`group/cover relative w-full overflow-hidden rounded-2xl border border-(--color-glass-border) bg-(--color-charcoal) ${
        size === "lg" ? "aspect-video" : "aspect-square"
      }`}
    >
      {image ? (
        <Image
          src={image}
          alt={`Screenshot of ${title}`}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover/cover:scale-105"
        />
      ) : (
        <>
          {/* mesh gradient backdrop */}
          <div
            className="absolute inset-0 opacity-90 transition-transform duration-700 ease-out group-hover/cover:scale-110"
            style={{
              background: `
                radial-gradient(60% 60% at 20% 15%, ${color}55, transparent 60%),
                radial-gradient(50% 55% at 85% 30%, ${color}33, transparent 65%),
                radial-gradient(70% 70% at 60% 100%, ${color}22, transparent 70%),
                var(--color-charcoal)
              `,
            }}
            aria-hidden="true"
          />

          {/* fine grid line texture */}
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden="true"
          />

          {/* oversized ghost initial */}
          <span
            className="pointer-events-none absolute bottom-[-0.15em] right-[-0.05em] select-none font-display font-extrabold leading-none text-white/[0.07]"
            style={{ fontSize: size === "lg" ? "9rem" : "5rem" }}
            aria-hidden="true"
          >
            {initial}
          </span>
        </>
      )}

      {/* type badge */}
      <div
        className="absolute left-4 top-4 flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-md"
        style={{ borderColor: `${color}55`, backgroundColor: `${color}1a` }}
      >
        <Icon size={13} className="text-(--color-pearl)" />
        <span className="font-mono text-[10px] uppercase tracking-wide text-(--color-pearl)">
          {type}
        </span>
      </div>

      {/* sheen sweep on hover */}
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover/cover:translate-x-full"
        aria-hidden="true"
      />
    </div>
  );
}
