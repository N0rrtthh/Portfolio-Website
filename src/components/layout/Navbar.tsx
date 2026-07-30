"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useLenis } from "@/components/providers/SmoothScrollProvider";

const NAV_ITEMS = [
  { label: "About", href: "#about" },
  { label: "Commits", href: "#github-activity" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#techstack" },
  { label: "Projects", href: "#projects" },
  { label: "Certifications", href: "#certifications" },
  { label: "Contact", href: "#contact" },
];

const ALL_SECTIONS = [
  { label: "Home", href: "#hero" },
  ...NAV_ITEMS,
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("#hero");
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  // Handle sticky scroll state
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

  // Section awareness — same precise IntersectionObserver logic as EvaNavbar
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    ALL_SECTIONS.forEach(({ href }) => {
      const el = document.querySelector(href);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActiveSection(href);
          });
        },
        { rootMargin: "-20% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  function handleNavClick(e: React.MouseEvent, href: string) {
    e.preventDefault();
    setOpen(false);
    setActiveSection(href);
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
      className={`fixed inset-x-0 top-0 z-50 transition-[padding,background-color,border-color,backdrop-filter] duration-500 ease-out ${scrolled ? "py-2.5" : "py-4"
        }`}
      style={{ transitionTimingFunction: "var(--ease-cinematic)" }}
    >
      <div className="container-narrow overflow-visible">
        <nav
          className={`flex items-center justify-between rounded-full px-5 py-2.5 transition-[padding,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-out relative overflow-visible ${scrolled
              ? "glass-heavy shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              : "bg-transparent border border-transparent"
            }`}
          style={{ transitionTimingFunction: "var(--ease-cinematic)" }}
        >
          {/* Logo — Favicon + Nrth */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, "#hero")}
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="Nrth. — Home"
            data-cursor-hover
          >
            <motion.div
              whileHover={{ scale: 1.12, rotate: 5 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/40 group-hover:bg-[var(--color-accent-primary)]/20 group-hover:border-[var(--color-accent-primary)] transition-[background-color,border-color,box-shadow] duration-200 shadow-[0_0_15px_rgba(67,97,238,0.25)] group-hover:shadow-[0_0_20px_rgba(67,97,238,0.5)] overflow-hidden p-1.5"
            >
              <img
                src="/Favicon.png"
                alt="Nrth Favicon"
                className="h-full w-full object-contain filter drop-shadow-[0_0_8px_rgba(67,97,238,0.6)]"
              />
            </motion.div>
            <span className="font-sans text-sm font-extrabold text-white hidden sm:inline-block tracking-tight group-hover:text-indigo-400 transition-colors">
              Nrth.
            </span>
          </a>

          {/* Desktop links with Eva-style active location indicator dot */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? "text-white font-semibold bg-white/10 border border-white/10 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                  data-cursor-hover
                >
                  <span className="relative z-10">{item.label}</span>

                  {/* Tiny glowing dot indicator tracking active section position while scrolling */}
                  {isActive && (
                    <motion.div
                      layoutId="classic-nav-indicator-dot"
                      className="absolute bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </div>

          {/* Right utilities */}
          <div className="flex items-center gap-2.5 shrink-0 relative overflow-visible z-50">
            <div className="shrink-0 flex items-center overflow-visible">
              <ThemeToggle />
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] text-[var(--color-starlight)] transition-transform duration-200 active:scale-95 md:hidden"
              data-cursor-hover
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile nav modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="container-narrow mt-2 md:hidden"
          >
            <div className="rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-void)]/95 p-4 backdrop-blur-2xl shadow-2xl space-y-1">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${activeSection === item.href
                      ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] font-bold"
                      : "text-[var(--color-pearl)]/80 hover:bg-[var(--color-glass-bg)] hover:text-white"
                    }`}
                >
                  <span>{item.label}</span>
                  {activeSection === item.href && (
                    <span className="h-2 w-2 rounded-full bg-[var(--color-accent-primary)] shadow-[0_0_6px_var(--color-accent-primary)]" />
                  )}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
