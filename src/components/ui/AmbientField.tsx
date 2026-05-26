"use client";

/** Decorative dotted starfield + slow-drifting orbit rings — adds ambient
 * depth behind hero/about content, echoing the constellation motif used
 * throughout the site without competing with the 3D canvas. */
export default function AmbientField({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
      style={{
        maskImage:
          "radial-gradient(70% 70% at 50% 40%, black 40%, transparent 90%)",
        WebkitMaskImage:
          "radial-gradient(70% 70% at 50% 40%, black 40%, transparent 90%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />
      <div className="absolute left-[12%] top-[18%] h-64 w-64 animate-spin-slow rounded-full border border-dashed border-white/10" />
      <div
        className="absolute right-[8%] top-[55%] h-96 w-96 rounded-full border border-dashed border-accent-cyan/15"
        style={{ animation: "spin-slow 34s linear infinite reverse" }}
      />
    </div>
  );
}
