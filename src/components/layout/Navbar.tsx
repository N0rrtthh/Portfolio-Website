"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { RESUME_URL } from "@/lib/data";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import ThemeToggle from "@/components/ui/ThemeToggle";

const EASING = [0.22, 1, 0.36, 1] as const;

const SECTIONS = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Toolkit", href: "#techstack" },
  { label: "Work", href: "#projects" },
  { label: "Certifications", href: "#certifications" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const { mode } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("#hero");
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section awareness via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ href }) => {
      const el = document.querySelector(href);
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(href);
            }
          });
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
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
      <div className="container-narrow">
        <nav
          className={`flex items-center justify-between rounded-full px-5 py-2.5 transition-[padding,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-out ${
            scrolled
              ? "glass-heavy shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              : "bg-transparent border border-transparent"
          }`}
          style={{ transitionTimingFunction: "var(--ease-cinematic)" }}
        >
          {/* Logo */}
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
            <span className="font-brand text-xl font-extrabold tracking-wider text-[var(--color-starlight)] hidden sm:inline-block transition-colors group-hover:text-[var(--color-accent-primary)]">
              EQ.
            </span>
          </a>

          {/* Center nav */}
          <ul className="hidden items-center gap-0.5 lg:flex">
            {SECTIONS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative px-4 py-2 font-mono text-[11px] tracking-widest uppercase transition-[color,text-shadow,transform] duration-200 ease-out active:scale-[0.97] rounded-full inline-block ${
                    activeSection === item.href
                      ? "text-[var(--color-starlight)] font-bold"
                      : "text-[var(--color-ash)] hover:text-[var(--color-silver)] hover:bg-white/5"
                  }`}
                  data-cursor-hover
                >
                  {item.label}
                  {activeSection === item.href && (
                    <motion.div
                      layoutId="nav-indicator-dot"
                      className="absolute bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--color-accent-primary)] shadow-[0_0_10px_var(--color-accent-primary)]"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 28,
                      }}
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={RESUME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] tracking-widest uppercase text-[var(--color-ash)] hover:text-[var(--color-starlight)] transition-colors duration-300 px-3 py-2"
              data-cursor-hover
            >
              Resume
            </a>
            <ThemeToggle />
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "#contact")}
              className="rounded-full border border-[var(--color-glass-border)] px-5 py-2.5 font-body text-xs font-medium text-[var(--color-pearl)] transition-[color,border-color,box-shadow,transform] duration-200 ease-out active:scale-[0.97] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-starlight)] hover:shadow-[0_0_20px_rgba(67,97,238,0.15)]"
              data-cursor-hover
            >
              Let&apos;s talk
            </a>
          </div>

          {/* Mobile toggle — larger hit area */}
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-pearl)] lg:hidden hover:bg-white/5 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            data-cursor-hover
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, transform: "translateY(-20px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: EASING }}
            className="fixed inset-x-0 top-[72px] z-40 p-4 lg:hidden"
          >
            <div className="glass-heavy rounded-3xl p-6 shadow-2xl border border-[var(--color-glass-border)] flex flex-col gap-4">
              <ul className="flex flex-col gap-2">
                {SECTIONS.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`flex items-center justify-between p-3 font-mono text-xs uppercase tracking-wider rounded-xl transition-colors ${
                        activeSection === item.href
                          ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-starlight)] font-bold border border-[var(--color-accent-primary)]/30"
                          : "text-[var(--color-silver)] hover:bg-white/5"
                      }`}
                    >
                      <span>{item.label}</span>
                      {activeSection === item.href && (
                        <span className="h-2 w-2 rounded-full bg-[var(--color-accent-primary)] shadow-[0_0_8px_var(--color-accent-primary)]" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-[var(--color-glass-border)] flex items-center justify-between">
                <ThemeToggle />
                <a
                  href={RESUME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs uppercase tracking-wider text-[var(--color-silver)]"
                >
                  Resume PDF ↗
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
