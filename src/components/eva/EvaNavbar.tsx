"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useLenis } from "@/components/providers/SmoothScrollProvider";

const SECTIONS = [
  { label: "SYSTEM", href: "#hero", code: "01" },
  { label: "IDENTITY", href: "#about", code: "02" },
  { label: "ARCHIVE", href: "#projects", code: "03" },
  { label: "DATABASE", href: "#techstack", code: "04" },
  { label: "HISTORY", href: "#experience", code: "05" },
  { label: "VAULT", href: "#certifications", code: "06" },
  { label: "COMMS", href: "#contact", code: "07" },
];

export default function EvaNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#hero");
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    let ticking = false;
    let last = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const next = window.scrollY > 40;
        if (next !== last) {
          last = next;
          setScrolled(next);
        }
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section awareness
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ href }) => {
      const el = document.querySelector(href);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActive(href);
          });
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  function handleNav(e: React.MouseEvent, href: string) {
    e.preventDefault();
    setOpen(false);
    setActive(href);
    const target = document.querySelector(href) as HTMLElement | null;
    if (!target) return;

    if (lenis) {
      lenis.scrollTo(target, {
        offset: -60,
        duration: 1.6,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      });
    } else {
      const startY = window.scrollY;
      const targetY = target.getBoundingClientRect().top + window.scrollY - 60;
      const distance = targetY - startY;
      const duration = 1400;
      let startTimestamp: number | null = null;

      function step(timestamp: number) {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        window.scrollTo(0, startY + distance * ease);
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-3"
      }`}
    >
      <div className="container-narrow overflow-visible">
        <nav
          className={`flex items-center justify-between px-5 py-2.5 transition-all duration-500 border rounded-full overflow-visible relative ${
            scrolled
              ? "bg-[var(--color-void)]/90 backdrop-blur-xl border-[var(--color-accent-primary)]/40 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              : "bg-transparent border-transparent"
          }`}
        >
          {/* Logo — Favicon + Nrth */}
          <a
            href="#hero"
            onClick={(e) => handleNav(e, "#hero")}
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="Nrth — Home"
            data-cursor-hover
          >
            <motion.div
              whileHover={{ scale: 1.12, rotate: -5 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex h-9 w-9 items-center justify-center border border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/15 rounded-xl shadow-[0_0_15px_var(--color-accent-primary)] group-hover:bg-[var(--color-accent-primary)]/30 group-hover:shadow-[0_0_22px_var(--color-accent-primary)] transition-all overflow-hidden p-1.5"
            >
              <img
                src={`${process.env.NODE_ENV === 'production' ? '/Portfolio-Website' : ''}/Favicon.png`}
                alt="Nrth Favicon"
                className="h-full w-full object-contain filter drop-shadow-[0_0_8px_rgba(67,97,238,0.8)]"
              />
            </motion.div>
            <span className="font-sans text-sm font-extrabold text-white hidden sm:inline-block tracking-tight group-hover:text-amber-300 transition-colors">
              Nrth.
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {SECTIONS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNav(e, item.href)}
                className={`relative font-mono text-[11px] tracking-wider px-3.5 py-1.5 transition-all duration-300 rounded-full ${
                  active === item.href
                    ? "text-amber-300 bg-white/10 border border-amber-500/30 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                data-cursor-hover
              >
                <span className="opacity-40 mr-1">[{item.code}]</span>
                {item.label}
                {active === item.href && (
                  <motion.div
                    layoutId="eva-nav-indicator-dot"
                    className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--color-accent-warm)] shadow-[0_0_8px_var(--color-accent-warm)]"
                  />
                )}
              </a>
            ))}
          </div>

          {/* Right side — Cleanly contained ThemeToggle with overflow visible for secret popover */}
          <div className="flex items-center gap-3 shrink-0 relative overflow-visible z-50">
            <div className="shrink-0 flex items-center overflow-visible">
              <ThemeToggle />
            </div>

            {/* Mobile toggle */}
            <button
              className="inline-flex h-9 w-9 items-center justify-center border border-[var(--color-accent-primary)]/30 text-[var(--color-pearl)] lg:hidden hover:bg-[var(--color-accent-primary)]/10 transition-colors rounded-full"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              data-cursor-hover
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="container-narrow mt-2 lg:hidden"
          >
            <div className="bg-[var(--color-void)]/95 backdrop-blur-xl border border-[var(--color-accent-primary)]/30 p-4 space-y-1 rounded-2xl shadow-2xl">
              {SECTIONS.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNav(e, item.href)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className={`flex items-center justify-between px-4 py-2.5 font-mono text-xs transition-colors rounded-xl ${
                    active === item.href
                      ? "text-[var(--color-accent-warm)] bg-[var(--color-accent-primary)]/15 font-bold border-l-2 border-[var(--color-accent-warm)]"
                      : "text-[var(--color-silver)] hover:text-white hover:bg-[var(--color-accent-primary)]/5 border-l-2 border-transparent"
                  }`}
                >
                  <div>
                    <span className="opacity-40 mr-2">[{item.code}]</span>
                    <span>{item.label}</span>
                  </div>
                  {active === item.href && (
                    <span className="h-2 w-2 rounded-full bg-[var(--color-accent-warm)] shadow-[0_0_8px_var(--color-accent-warm)]" />
                  )}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
