"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import anime from "animejs";
import { getAdaptiveQuality, observeVisibility } from "@/lib/performance";

/* ══════════════════════════════════════════════════════════
   Anime.js interaction kit
   ──────────────────────────────────────────────────────────
   A batch of small, frameless interactables. Everything here follows the
   same three rules as the existing anime widgets in this project, because
   those are the rules that keep a page full of motion from becoming a page
   full of jank:

     1. Nothing is wrapped in a card. These are surface decorations and
        input affordances, not panels.
     2. One anime instance per component at a time; a new gesture replaces
        the running one instead of stacking.
     3. Continuous loops are gated on `observeVisibility` and disabled when
        `getAdaptiveQuality().reduceContinuousFx` is set. Pointer-driven
        one-shots stay active — they only run while a human is moving.

   Exports (all client components):
     · Magnetic          — element leans toward the pointer, springs back
     · TiltCard          — 3D tilt from pointer position
     · ScrambleText      — glyph scramble on hover / on view
     · CountUp           — number rolls up when scrolled into view
     · Underline         — hairline wipe-in under a link
     · PressBurst        — particle burst from the click point
     · CharStagger       — per-character entrance for a heading
     · GlowTrail         — accent glow that follows the pointer inside a band
     · TickerNumbers     — slot-machine digit reel
     · SplitReveal       — two halves slide apart to reveal children
   ══════════════════════════════════════════════════════════ */

const prefersLessMotion = () => getAdaptiveQuality().reduceContinuousFx;

/* ── 1. Magnetic ─────────────────────────────────────────
   Buttons and links lean into the cursor. Strength is deliberately small
   (max ~10px): magnetic effects that travel further than the element's own
   padding make the hit area lie about where the element is. */
export function Magnetic({
  children,
  strength = 10,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const move = (e: React.PointerEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    anime.remove(el);
    anime({
      targets: el,
      translateX: dx * strength,
      translateY: dy * strength,
      duration: 260,
      easing: "easeOutQuad",
    });
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    anime.remove(el);
    anime({
      targets: el,
      translateX: 0,
      translateY: 0,
      // Spring on the way back only: the return is the part that should feel
      // physical, the follow should feel immediate.
      easing: "spring(1, 90, 12, 0)",
    });
  };

  return (
    <span
      ref={ref}
      onPointerMove={move}
      onPointerLeave={reset}
      className={`inline-flex transform-gpu will-change-transform ${className}`}
    >
      {children}
    </span>
  );
}

/* ── 2. TiltCard ─────────────────────────────────────────
   Pointer-driven rotateX/rotateY. Perspective lives on the wrapper so the
   child keeps its own transforms. */
export function TiltCard({
  children,
  max = 8,
  className = "",
}: {
  children: ReactNode;
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    anime.remove(el);
    anime({
      targets: el,
      rotateY: px * max * 2,
      rotateX: -py * max * 2,
      duration: 200,
      easing: "easeOutQuad",
    });
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    anime.remove(el);
    anime({ targets: el, rotateX: 0, rotateY: 0, easing: "spring(1, 80, 12, 0)" });
  };

  return (
    <div style={{ perspective: 900 }} className={className}>
      <div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={reset}
        className="transform-gpu will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ── 3. ScrambleText ────────────────────────────────────
   Cycles random glyphs before settling on the real string. `anime` drives a
   single 0→1 progress value and the render is derived from it, so there is
   one animation regardless of string length. */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>*#$%";

export function ScrambleText({
  text,
  className = "",
  trigger = "hover",
  duration = 700,
}: {
  text: string;
  className?: string;
  trigger?: "hover" | "view";
  duration?: number;
}) {
  /* `null` means "show the real text". Holding the scrambled frame in its own
     nullable state keeps `text` the single source of truth, so no effect has
     to sync state back to props when `text` changes. */
  const [scrambled, setScrambled] = useState<string | null>(null);
  const display = scrambled ?? text;

  const stateRef = useRef({ p: 0 });
  const elRef = useRef<HTMLSpanElement>(null);

  const run = useCallback(() => {
    if (prefersLessMotion()) return;
    anime.remove(stateRef.current);
    stateRef.current.p = 0;
    anime({
      targets: stateRef.current,
      p: 1,
      duration,
      easing: "easeInOutQuad",
      update: () => {
        const p = stateRef.current.p;
        const settled = Math.floor(text.length * p);
        setScrambled(
          text
            .split("")
            .map((ch, i) => {
              if (i < settled || ch === " ") return ch;
              return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            })
            .join("")
        );
      },
      complete: () => setScrambled(null),
    });
  }, [text, duration]);

  useEffect(() => {
    if (trigger !== "view") return;
    const el = elRef.current;
    if (!el) return;
    let done = false;
    return observeVisibility(el, (visible) => {
      if (visible && !done) {
        done = true;
        run();
      }
    });
  }, [trigger, run]);


  return (
    <span
      ref={elRef}
      onPointerEnter={trigger === "hover" ? run : undefined}
      className={className}
    >
      {display}
    </span>
  );
}

/* ── 4. CountUp ─────────────────────────────────────────
   Rolls a number when it enters the viewport, once. Uses `round: 1` so anime
   emits integers instead of us re-formatting every frame. */
export function CountUp({
  to,
  suffix = "",
  duration = 1400,
  className = "",
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const objRef = useRef({ v: 0 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersLessMotion()) {
      /* Jump straight to the final number, but in a frame of its own: a
         synchronous setState here would cascade a second render during the
         same commit. */
      const id = requestAnimationFrame(() => setValue(to));
      return () => cancelAnimationFrame(id);
    }
    let fired = false;

    return observeVisibility(el, (visible) => {
      if (!visible || fired) return;
      fired = true;
      anime({
        targets: objRef.current,
        v: to,
        round: 1,
        duration,
        easing: "easeOutExpo",
        update: () => setValue(objRef.current.v),
      });
    });
  }, [to, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}

/* ── 5. Underline ───────────────────────────────────────
   scaleX wipe under a link. Transform-only, so it cannot reflow the text
   above it — the usual bug with animating `width` or `border-bottom`. */
export function Underline({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const barRef = useRef<HTMLSpanElement>(null);

  const to = (v: number) => {
    const el = barRef.current;
    if (!el) return;
    anime.remove(el);
    anime({
      targets: el,
      scaleX: v,
      duration: 320,
      easing: v ? "easeOutExpo" : "easeInQuad",
    });
  };

  return (
    <span
      onPointerEnter={() => to(1)}
      onPointerLeave={() => to(0)}
      className={`relative inline-block ${className}`}
    >
      {children}
      <span
        ref={barRef}
        aria-hidden="true"
        className="absolute -bottom-0.5 left-0 h-px w-full origin-left bg-[var(--color-accent-primary)]"
        style={{ transform: "scaleX(0)" }}
      />
    </span>
  );
}

/* ── 6. PressBurst ──────────────────────────────────────
   Particles thrown from the exact click point. Nodes are pooled once and
   reused, so repeated clicks never allocate. */
export function PressBurst({
  children,
  count = 12,
  className = "",
}: {
  children: ReactNode;
  count?: number;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const dots = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

  const burst = (e: React.PointerEvent<HTMLDivElement>) => {
    const host = hostRef.current;
    if (!host || prefersLessMotion()) return;
    const r = host.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const nodes = host.querySelectorAll<HTMLElement>(".burst-dot");
    nodes.forEach((n) => {
      n.style.left = `${x}px`;
      n.style.top = `${y}px`;
    });
    anime.remove(nodes);
    anime({
      targets: nodes,
      translateX: () => anime.random(-70, 70),
      translateY: () => anime.random(-70, 70),
      scale: [{ value: 1, duration: 120 }, { value: 0, duration: 480 }],
      opacity: [{ value: 1, duration: 100 }, { value: 0, duration: 500 }],
      easing: "easeOutExpo",
      duration: 620,
    });
  };

  return (
    <div ref={hostRef} onPointerDown={burst} className={`relative ${className}`}>
      {children}
      <span className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
        {dots.map((i) => (
          <span
            key={i}
            className="burst-dot absolute h-1 w-1 rounded-full bg-[var(--color-accent-primary)] opacity-0 transform-gpu"
          />
        ))}
      </span>
    </div>
  );
}

/* ── 7. CharStagger ─────────────────────────────────────
   Per-character entrance. Characters are wrapped in spans with
   `aria-hidden`, and the full string is exposed to screen readers once via
   an sr-only copy — otherwise every letter is announced separately. */
export function CharStagger({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const chars = useMemo(() => text.split(""), [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll(".char");
    if (prefersLessMotion()) {
      targets.forEach((t) => ((t as HTMLElement).style.opacity = "1"));
      return;
    }
    let fired = false;
    return observeVisibility(el, (visible) => {
      if (!visible || fired) return;
      fired = true;
      anime({
        targets,
        opacity: [0, 1],
        translateY: [14, 0],
        rotateZ: [4, 0],
        delay: anime.stagger(22, { start: delay }),
        duration: 620,
        easing: "easeOutExpo",
      });
    });
  }, [delay, text]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span ref={ref} className={className} aria-hidden="true">
        {chars.map((c, i) => (
          <span
            key={`${c}-${i}`}
            className="char inline-block transform-gpu will-change-transform"
            style={{ opacity: 0, whiteSpace: c === " " ? "pre" : undefined }}
          >
            {c}
          </span>
        ))}
      </span>
    </>
  );
}

/* ── 8. GlowTrail ───────────────────────────────────────
   A soft accent blob that chases the pointer inside its own band. Pointer
   position is latched and applied once per frame rather than per event. */
export function GlowTrail({
  className = "",
  size = 180,
  children,
}: {
  className?: string;
  size?: number;
  children?: ReactNode;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLSpanElement>(null);
  const pending = useRef<{ x: number; y: number } | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (prefersLessMotion()) return;
    let raf = 0;
    const tick = () => {
      const next = pending.current;
      const blob = blobRef.current;
      if (next && blob) {
        // Simple lerp: the trail lags the pointer, which is the whole effect.
        pos.current.x += (next.x - pos.current.x) * 0.12;
        pos.current.y += (next.y - pos.current.y) * 0.12;
        blob.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const fade = (v: number) => {
    const blob = blobRef.current;
    if (!blob) return;
    anime.remove(blob);
    anime({ targets: blob, opacity: v, duration: 300, easing: "easeOutQuad" });
  };

  return (
    <div
      ref={hostRef}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        pending.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      }}
      onPointerEnter={() => fade(1)}
      onPointerLeave={() => fade(0)}
      className={`relative overflow-hidden ${className}`}
    >
      <span
        ref={blobRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 rounded-full opacity-0 blur-2xl"
        style={{
          width: size,
          height: size,
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-accent-primary) 55%, transparent), transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}

/* ── 9. TickerNumbers ───────────────────────────────────
   Digit reel: each digit column translates to its target row. Reads as
   mechanical rather than as a fading number swap. */
export function TickerNumbers({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const digits = useMemo(() => value.split(""), [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cols = el.querySelectorAll<HTMLElement>(".reel");
    if (prefersLessMotion()) {
      cols.forEach((c, i) => {
        const d = Number(digits[i]);
        if (!Number.isNaN(d)) c.style.transform = `translateY(${-d * 10}%)`;
      });
      return;
    }
    anime.remove(cols);
    anime({
      targets: cols,
      translateY: (_: HTMLElement, i: number) => {
        const d = Number(digits[i]);
        return Number.isNaN(d) ? "0%" : `${-d * 10}%`;
      },
      delay: anime.stagger(60),
      duration: 900,
      easing: "easeOutExpo",
    });
  }, [digits]);

  return (
    <span ref={ref} className={`inline-flex ${className}`} aria-label={value}>
      {digits.map((d, i) =>
        Number.isNaN(Number(d)) ? (
          <span key={i} aria-hidden="true">
            {d}
          </span>
        ) : (
          <span key={i} className="relative inline-block h-[1em] overflow-hidden" aria-hidden="true">
            <span className="reel block transform-gpu will-change-transform">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <span key={n} className="block h-[1em] leading-[1em]">
                  {n}
                </span>
              ))}
            </span>
          </span>
        )
      )}
    </span>
  );
}

/* ── 10. SplitReveal ────────────────────────────────────
   Two shutters slide off the content when it scrolls in. Cheap alternative
   to a clip-path reveal, and it survives being nested in transformed
   parents (clip-path does not, reliably). */
export function SplitReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const shutters = el.querySelectorAll(".shutter");
    if (prefersLessMotion()) {
      shutters.forEach((s) => ((s as HTMLElement).style.opacity = "0"));
      return;
    }
    let fired = false;
    return observeVisibility(el, (visible) => {
      if (!visible || fired) return;
      fired = true;
      anime({
        targets: shutters,
        translateX: (_: HTMLElement, i: number) => (i === 0 ? "-101%" : "101%"),
        duration: 900,
        easing: "easeInOutQuart",
      });
    });
  }, []);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {children}
      <span
        className="shutter pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[var(--color-void)] transform-gpu"
        aria-hidden="true"
      />
      <span
        className="shutter pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[var(--color-void)] transform-gpu"
        aria-hidden="true"
      />
    </div>
  );
}
