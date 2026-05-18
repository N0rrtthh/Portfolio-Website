"use client";

import { useRef, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

const TYPING_LINES = [
  "> ACCESSING PILOT DATABASE...",
  "> DIRECTIVE: BUILD HIGH-PERFORMANCE DIGITAL SYSTEMS",
  "> OPERATIONAL STATUS: FULL SYNC ACHIEVED",
  "> PILOT: ELRONI QUIÑONES [UNIT-01 ENGAGED]",
];

function useTypingEffect(lines: string[], charDelay = 18, lineDelay = 400) {
  const [displayed, setDisplayed] = useState<string[]>([]);

  useEffect(() => {
    let currentLine = 0;
    let currentChar = 0;
    let cancelled = false;

    function typeNext() {
      if (cancelled || currentLine >= lines.length) return;

      if (currentChar === 0) {
        setDisplayed((prev) => [...prev, ""]);
      }

      if (currentChar < lines[currentLine].length) {
        const c = currentChar;
        const l = currentLine;
        setDisplayed((prev) => {
          const next = [...prev];
          next[l] = lines[l].substring(0, c + 1);
          return next;
        });
        currentChar++;
        setTimeout(typeNext, charDelay);
      } else {
        currentLine++;
        currentChar = 0;
        setTimeout(typeNext, lineDelay);
      }
    }

    const startTimer = setTimeout(typeNext, 800);
    return () => {
      cancelled = true;
      clearTimeout(startTimer);
    };
  }, [lines, charDelay, lineDelay]);

  return displayed;
}

export default function EvaHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const typedLines = useTypingEffect(TYPING_LINES);

  return (
    <section ref={ref} id="hero" className="min-h-svh flex flex-col justify-center relative py-32">
      <motion.div style={{ y, opacity }} className="container-narrow relative z-10">
        <div className="border-l-4 border-[var(--color-accent-warm)] pl-8 md:pl-16">
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6, 1] }}
            transition={{ duration: 0.6, times: [0, 0.2, 0.5, 1] }}
            className="mb-8 font-mono text-xs tracking-[0.25em] text-[var(--color-accent-warm)] bg-[var(--color-accent-warm)]/10 inline-flex items-center gap-3 px-4 py-1.5 border border-[var(--color-accent-warm)]/40"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent-warm)] animate-pulse shadow-[0_0_8px_var(--color-accent-warm)]" />
            SYSTEM OVERRIDE // MAGI-01 SYNC: 400%
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="font-display text-5xl sm:text-7xl md:text-9xl font-black text-white uppercase leading-[0.88] tracking-tighter mb-8"
          >
            PROJECT
            <br />
            <motion.span
              animate={{ opacity: [1, 0.85, 1] }}
              transition={{
                duration: 0.15,
                repeat: Infinity,
                repeatType: "mirror",
                repeatDelay: 3,
              }}
              className="text-[var(--color-accent-primary)] drop-shadow-[0_0_20px_var(--color-accent-primary)]"
            >
              01 // EQ
            </motion.span>
          </motion.h1>

          {/* Terminal card with typing effect */}
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="max-w-2xl bg-[var(--color-obsidian)] p-6 md:p-8 border border-[var(--color-accent-primary)]/50 relative origin-top shadow-[0_0_40px_rgba(0,0,0,0.5)]"
          >
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--color-accent-warm)]" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--color-accent-warm)]" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--color-accent-warm)]" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--color-accent-warm)]" />

            <p className="font-mono text-[10px] text-[var(--color-accent-warm)] font-bold tracking-[0.2em] mb-4">
              CLASSIFIED DATA. AUTHORIZED PERSONNEL ONLY.
            </p>

            <div className="space-y-1.5 font-mono text-xs md:text-sm text-[var(--color-pearl)]">
              {typedLines.map((line, i) => (
                <p key={i} className={line.startsWith("> PILOT") ? "text-[var(--color-accent-warm)] font-bold" : ""}>
                  {line}
                  {i === typedLines.length - 1 && (
                    <span className="inline-block w-2 h-3.5 bg-[var(--color-accent-primary)] ml-1 animate-pulse" />
                  )}
                </p>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <a
              href="#projects"
              className="bg-[var(--color-accent-primary)] text-white px-6 py-3.5 sm:px-8 sm:py-4 font-mono text-xs sm:text-sm font-bold tracking-widest flex items-center gap-3 border border-[var(--color-accent-warm)]/50 hover:bg-[var(--color-accent-warm)] hover:text-black transition-all duration-200 hover:shadow-[0_0_20px_var(--color-accent-warm)]"
              data-cursor-hover
            >
              INITIATE LINK
              <ArrowRight size={18} />
            </a>
            <a
              href="#about"
              className="text-[var(--color-pearl)] px-6 py-3.5 sm:px-8 sm:py-4 font-mono text-xs sm:text-sm tracking-widest flex items-center gap-3 border border-[var(--color-accent-primary)]/40 hover:border-[var(--color-accent-warm)] hover:text-[var(--color-accent-warm)] transition-all duration-200"
              data-cursor-hover
            >
              VIEW PILOT DATA
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-[var(--color-ash)]"
      >
        <span>SCROLL TO PROCEED</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-[1px] h-6 bg-gradient-to-b from-[var(--color-accent-primary)] to-transparent"
        />
      </motion.div>
    </section>
  );
}
