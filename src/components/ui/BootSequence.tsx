"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_LOGS = [
  { text: "MAGI SYSTEM v3.11 — INITIALIZING...", delay: 0 },
  { text: "CASPER-01 .......... ONLINE", delay: 120 },
  { text: "BALTHASAR-02 ....... ONLINE", delay: 240 },
  { text: "MELCHIOR-03 ........ ONLINE", delay: 360 },
  { text: "NEURAL LINK CALIBRATION: ████████████ 100%", delay: 500 },
  { text: "SYNCHRONIZATION RATIO: 400.00%", delay: 640 },
  { text: "PILOT IDENTITY: QUIÑONES, ELRONI", delay: 780 },
  { text: "DESIGNATION: UNIT-01", delay: 880 },
  { text: "SECURITY CLEARANCE: LEVEL 7 — AUTHORIZED", delay: 1000 },
  { text: "LOADING NERV TERMINAL INTERFACE...", delay: 1140 },
  { text: "> ALL SYSTEMS NOMINAL", delay: 1320 },
  { text: "> ENTRY PLUG CONNECTED", delay: 1440 },
  { text: "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ READY", delay: 1600 },
];

export default function BootSequence({ onComplete }: { onComplete?: () => void }) {
  const [booting, setBooting] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [glitchFlash, setGlitchFlash] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Stagger log entries
    BOOT_LOGS.forEach((log) => {
      timers.push(
        setTimeout(() => {
          setLogs((prev) => [...prev, log.text]);
          setProgress((prev) => Math.min(prev + 100 / BOOT_LOGS.length, 100));
        }, log.delay)
      );
    });

    // Glitch flash effect near end
    timers.push(setTimeout(() => setGlitchFlash(true), 1800));
    timers.push(setTimeout(() => setGlitchFlash(false), 1900));

    // Complete and dismiss
    timers.push(
      setTimeout(() => {
        setBooting(false);
        document.body.style.overflow = "";
        onCompleteRef.current?.();
      }, 2600)
    );

    return () => {
      timers.forEach(clearTimeout);
      document.body.style.overflow = "";
    };
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <AnimatePresence>
      {booting && (
        <motion.div
          key="boot-sequence"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "brightness(2)" }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[99999] flex flex-col bg-[#020302] select-none overflow-hidden"
        >
          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.03) 2px, rgba(57,255,20,0.03) 4px)",
            }}
          />

          {/* Glitch flash */}
          <AnimatePresence>
            {glitchFlash && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 bg-[#39ff14] mix-blend-overlay"
              />
            )}
          </AnimatePresence>

          {/* Top bar — NERV branding */}
          <div className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-[#39ff14]/20">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-[#39ff14] animate-pulse shadow-[0_0_10px_#39ff14]" />
              <span className="font-mono text-xs tracking-[0.3em] text-[#39ff14]/80">
                NERV TERMINAL v3.11
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#39ff14]/40 tracking-widest">
              Nrth. OS
            </span>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
            {/* Logo / Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-[#7a00ff] mb-6 relative">
                <span className="font-mono text-2xl font-black text-[#39ff14] tracking-tighter">NRTH.</span>
                {/* Corner accents */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#39ff14]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#39ff14]" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#39ff14]" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#39ff14]" />
              </div>
              <h1 className="font-mono text-3xl md:text-5xl font-black text-white tracking-[0.15em] uppercase">
                PROJECT <span className="text-[#7a00ff]">UNIT-01</span>
              </h1>
              <p className="font-mono text-xs text-[#39ff14]/60 tracking-[0.4em] mt-2">
                PILOT SYNCHRONIZATION PROTOCOL
              </p>
            </motion.div>

            {/* Terminal output */}
            <div
              ref={terminalRef}
              className="w-full max-w-2xl h-52 overflow-y-auto bg-black/60 border border-[#39ff14]/20 p-4 font-mono text-xs space-y-1"
              style={{ scrollbarWidth: "none" }}
            >
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex gap-3"
                >
                  <span className="text-[#39ff14]/30 select-none shrink-0">
                    [{String(i + 1).padStart(3, "0")}]
                  </span>
                  <span className={
                    log.startsWith(">")
                      ? "text-[#39ff14] font-bold"
                      : log.includes("READY")
                        ? "text-white font-bold"
                        : "text-[#39ff14]/80"
                  }>
                    {log}
                  </span>
                </motion.div>
              ))}
              {/* Blinking cursor */}
              <span className="inline-block w-2 h-3.5 bg-[#39ff14] animate-pulse" />
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-2xl mt-4">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[10px] text-[#39ff14]/50 tracking-widest">
                  SYSTEM INITIALIZATION
                </span>
                <span className="font-mono text-[10px] text-[#39ff14]/50">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#39ff14]/10 overflow-hidden border border-[#39ff14]/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#7a00ff] to-[#39ff14]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Bottom status bar */}
          <div className="relative z-10 flex items-center justify-between px-8 py-3 border-t border-[#39ff14]/20 font-mono text-[10px] text-[#39ff14]/40">
            <span>TOKYO-3 // GEOFRONT ACCESS TERMINAL</span>
            <span className="tracking-widest">SEC.LEVEL: AUTHORIZED</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
