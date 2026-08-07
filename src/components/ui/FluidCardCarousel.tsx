"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CARDS = [
  { id: 1, title: "Ocean Wave of the Decade Contender", meta: "35 mins ago", badge: "NEWS",    badgeColor: "bg-red-500",    gradient: "from-sky-900 via-blue-800 to-slate-900" },
  { id: 2, title: "Board Review: John John Florence and Jon Pyzel", meta: "Yesterday",          badge: "GALLERY", badgeColor: "bg-orange-500", gradient: "from-teal-900 via-cyan-800 to-slate-900" },
  { id: 3, title: "Upcoming Surf Events to Not Miss",              meta: "Yesterday",          badge: "NEWS",    badgeColor: "bg-red-500",    gradient: "from-indigo-900 via-violet-800 to-slate-900" },
  { id: 4, title: "The Art of Reading Waves",                      meta: "2 days ago",         badge: "FEATURE", badgeColor: "bg-emerald-500",gradient: "from-green-900 via-emerald-800 to-slate-900" },
  { id: 5, title: "Gear Guide: Best Wetsuits of 2025",             meta: "3 days ago",         badge: "GUIDE",   badgeColor: "bg-purple-500", gradient: "from-purple-900 via-fuchsia-800 to-slate-900" },
];

const N = CARDS.length;
const AUTO_INTERVAL = 4000;

export default function FluidCardCarousel() {
  const [active, setActive] = useState(0);

  const next = useCallback(() => setActive((i) => (i + 1) % N), []);
  const prev = useCallback(() => setActive((i) => (i - 1 + N) % N), []);

  // Auto-advance every 4 s; resets on manual interaction
  useEffect(() => {
    const id = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(id);
  }, [next, active]); // restart timer on manual change

  return (
    <div className="w-full h-screen bg-[#1A4549] flex flex-col items-center justify-center gap-8 overflow-hidden">
      {/* Track */}
      <div className="relative flex items-center justify-center w-full" style={{ height: 480 }}>
        {CARDS.map((card, i) => {
          let delta = i - active;
          // Wrap around
          if (delta > N / 2) delta -= N;
          if (delta < -N / 2) delta += N;

          const absDelta = Math.abs(delta);
          if (absDelta > 2) return null;

          // Layout values
          const isActive = delta === 0;
          const scale    = isActive ? 1 : absDelta === 1 ? 0.85 : 0.72;
          const opacity  = isActive ? 1 : absDelta === 1 ? 0.70 : 0.35;
          const zIndex   = isActive ? 10 : absDelta === 1 ? 5 : 1;
          // Horizontal offset: active centred, adjacents pushed left/right
          const translateX = delta * (isActive ? 0 : absDelta === 1 ? 310 : 560);

          return (
            <div
              key={card.id}
              onClick={() => {
                if (delta < 0) prev();
                else if (delta > 0) next();
              }}
              style={{
                position: "absolute",
                width: 340,
                height: 460,
                transform: `translateX(${translateX}px) scale(${scale})`,
                opacity,
                zIndex,
                transition: "transform 700ms cubic-bezier(0.4,0,0.2,1), opacity 700ms cubic-bezier(0.4,0,0.2,1)",
                cursor: isActive ? "default" : "pointer",
              }}
              className={`rounded-3xl overflow-hidden bg-gradient-to-b ${card.gradient} shadow-2xl`}
            >
              {/* Badge */}
              <span className={`absolute top-4 right-4 z-20 ${card.badgeColor} text-white text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-md`}>
                {card.badge}
              </span>

              {/* Subtle inner texture */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Content — only fully visible on active */}
              <div
                className="absolute bottom-0 left-0 right-0 p-6 z-10"
                style={{
                  transition: "opacity 500ms ease",
                  opacity: isActive ? 1 : 0.4,
                }}
              >
                <p className="font-mono text-[10px] text-white/50 mb-2 tracking-widest uppercase">{card.meta}</p>
                <h3 className="font-bold text-white text-xl leading-snug mb-4">
                  {card.title}
                </h3>
                {isActive && (
                  <button className="inline-flex items-center gap-2 text-white/80 text-sm font-mono border border-white/20 rounded-full px-4 py-1.5 hover:bg-white/10 transition-colors">
                    <span className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center text-[10px]">→</span>
                    Read more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={prev}
          className="w-11 h-11 rounded-full border border-white/20 bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to card ${i + 1}`}
              style={{
                width: i === active ? 28 : 8,
                height: 8,
                borderRadius: 9999,
                background: i === active ? "#fff" : "rgba(255,255,255,0.3)",
                transition: "width 400ms cubic-bezier(0.4,0,0.2,1), background 400ms ease",
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-11 h-11 rounded-full border border-white/20 bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          aria-label="Next"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Counter */}
      <p className="font-mono text-xs text-white/30 -mt-4">
        {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
      </p>
    </div>
  );
}
