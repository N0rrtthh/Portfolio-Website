"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useLenis } from "@/components/providers/SmoothScrollProvider";

const NAV_ITEMS = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#techstack" },
  { label: "Projects", href: "#projects" },
  { label: "Certifications", href: "#certifications" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    NAV_ITEMS.forEach(({ href }) => {
      const el = document.querySelector(href);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActiveSection(href);
          });
        },
        { rootMargin: "-40% 0px -50% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  function handleNavClick(e: React.MouseEvent, href: string) {
    e.preventDefault();
    setOpen(false);
    const target = document.querySelector(href);
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target as HTMLElement, { offset: -60 });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[padding,background-color,border-color,backdrop-filter] duration-500 ease-out ${
        scrolled ? "py-2.5" : "py-4"
      }`}
      style={{ transitionTimingFunction: "var(--ease-cinematic)" }}
    >
      <div className="container-narrow overflow-visible">
        <nav
          className={`flex items-center justify-between rounded-full px-5 py-2.5 transition-[padding,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-out relative overflow-visible ${
            scrolled
              ? "glass-heavy shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              : "bg-transparent border border-transparent"
          }`}
          style={{ transitionTimingFunction: "var(--ease-cinematic)" }}
        >
          {/* Logo — Original <EQ/> */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, "#hero")}
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="Elroni Quiñones — Home"
            data-cursor-hover
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30 group-hover:scale-110 group-hover:bg-[var(--color-accent-primary)] group-hover:text-white transition-[background-color,color,transform,box-shadow,border-color] duration-200 ease-out shadow-[0_0_15px_rgba(67,97,238,0.2)] will-change-transform transform-gpu">
              <span className="font-mono text-xs font-black tracking-tighter">
                &lt;EQ/&gt;
              </span>
            </div>
            <span className="font-display text-sm font-bold text-[var(--color-starlight)] hidden sm:inline-block tracking-wide">
              Elroni Quiñones
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-[var(--color-starlight)] font-semibold"
                      : "text-[var(--color-pearl)]/70 hover:text-[var(--color-starlight)]"
                  }`}
                  data-cursor-hover
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 rounded-full bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)]"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </a>
              );
            })}
          </div>

          {/* Right utilities — Clean original Classic Navbar without EVA button */}
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
                  className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeSection === item.href
                      ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] font-bold"
                      : "text-[var(--color-pearl)]/80 hover:bg-[var(--color-glass-bg)] hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
