"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";

import ContactForm from "@/components/ui/ContactForm";
import ChapterLabel from "@/components/ui/ChapterLabel";
import AnimeRippleField from "@/components/ui/AnimeRippleField";
import AnimeWaveBars from "@/components/ui/AnimeWaveBars";
import AnimeDriftParticles from "@/components/ui/AnimeDriftParticles";
import AnimeTraceLine from "@/components/ui/AnimeTraceLine";
import {
  Magnetic,
  GlowTrail,
  ScrambleText,
} from "@/components/ui/anime/AnimeInteractions";




import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/data";
import { GitHubIcon, XIcon } from "@/components/ui/BrandIcons";
import { DUR, EASE } from "@/lib/motion";

/* ══════════════════════════════════════════════════════════
   CLASSIC // Contact
   ──────────────────────────────────────────────────────────
   Layout: the headline is its own full-width band, then the columns
   start underneath it. Previously the headline lived at the top of the
   LEFT column, so its height had no counterpart on the right and the
   left rail opened with a tall dead gap before the paragraph — visible
   as several hundred px of nothing beside the form.

   The headline is also plain text now, not `RevealText`. That component
   parks every word at `opacity: 0` until an IntersectionObserver fires;
   when it doesn't fire, the heading is invisible but still occupies its
   box, which is exactly the empty band that showed up here. A headline
   is the one thing in the section that must never depend on an observer.

   The rest of the premium read:
     · opens with a live availability state rather than a heading
     · left rail is one dividered block of facts at a single rhythm
       instead of one lonely card
     · the form sits in a gradient hairline ring (a 1px gradient wrapper,
       not a blurred glow) with its own header row
   ══════════════════════════════════════════════════════════ */

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  github: GitHubIcon,
  twitter: XIcon,
};

const FACTS = [
  {
    icon: Mail,
    label: "Direct email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  /* Reply time and location were removed at the owner's request: both were
     promises the page cannot keep on its own. */

];


export default function Contact() {
  /* Fields, validation and submission live in `ui/ContactForm` so EVA's
     uplink panel renders the same form instead of a second copy of it. */
  return (
    <section
      id="contact"
      className="section-padding relative flex flex-col justify-center"
    >
      {/* Ambient Radial Gradient Background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="animate-breathe pointer-events-none absolute bottom-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(67,97,238,0.12), transparent 70%)",
          }}
        />
        {/* Drifting motes over the gradient — decoration on the section
            itself, deliberately not inside any panel. */}
        <AnimeDriftParticles count={16} />
      </div>


      <div className="container-narrow relative z-10">
        {/* ── Headline band ─────────────────────────────────── */}
        <div className="pb-2">

          <div className="max-w-2xl">

            <ChapterLabel
              index={8}
              classic="Contact"
              eva="TRANSMISSION UPLINK"
              className="mb-5"
            />

            <h2 className="text-section-title font-display text-[var(--color-starlight)]">
              Let&apos;s build something{" "}
              <span className="text-[var(--color-accent-primary)]">
                unforgettable.
              </span>
            </h2>

            <p className="mt-4 max-w-prose font-body text-base leading-relaxed text-[var(--color-silver)]">
              Open to full-stack engineering, mobile development, and creative
              UI/UX roles. Have a project in mind or an inquiry? Send a
              transmission and I&apos;ll get back to you.
            </p>
          </div>
          {/* The "Available for new work" pill was removed on request. With it
              gone the band no longer needs to be a two-column flex row. */}
        </div>

        {/* Divider — the static 1px rule is now a self-drawing trace with a
            node riding it. Same job, and it replaces dead border space with
            motion rather than adding a new element to the page. */}
        <AnimeTraceLine className="mb-6 md:mb-8" height={24} />



        {/* ── Columns — both start at the same line ─────────── */}
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            {/* Facts — one rhythm, dividers instead of three separate cards */}
            <div className="divide-y divide-[var(--color-glass-border)] overflow-hidden rounded-2xl border border-[var(--color-glass-border)] glass">
              {FACTS.map(({ icon: Icon, label, value, href }) => {
                const body = (
                  <>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] transition-transform duration-200 group-hover:scale-110">
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[10px] uppercase tracking-widest text-[var(--color-ash)]">
                        {label}
                      </span>
                      <span className="block truncate font-mono text-sm font-semibold text-[var(--color-starlight)]">
                        {value}
                      </span>
                    </span>
                  </>
                );

                return href ? (
                  <a
                    key={label}
                    href={href}
                    className="group flex items-center gap-4 p-4 transition-colors hover:bg-[var(--color-glass-highlight)]"
                    data-cursor-hover
                  >
                    {body}
                  </a>
                ) : (
                  <div key={label} className="group flex items-center gap-4 p-4">
                    {body}
                  </div>
                );
              })}
            </div>

            {/* Live signal readout — frameless, sitting directly on the
                section surface next to its label. Boxing it would make it a
                fourth card competing with the facts and the form. */}
            <div className="mt-7 flex items-end gap-4">
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-[var(--color-ash)]">
                Uplink
                <br />
                active
              </span>
              <AnimeWaveBars bars={30} className="min-w-0 flex-1" />
            </div>

            {/* Social Connection Links */}
            <div className="mt-7 flex items-center gap-4">

              <span className="font-mono text-xs text-[var(--color-ash)]">
                Connect:
              </span>
              {SOCIAL_LINKS.map((link) => {
                const Icon = ICONS[link.icon];
                return (
                  /* Magnetic: the icon leans ~8px toward the cursor and springs
                     back. Kept under the tile's own padding so the visual and
                     the hit area never disagree. */
                  <Magnetic key={link.href} strength={8}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl glass border border-[var(--color-glass-border)] text-[var(--color-silver)] transition-[color,border-color,background-color,transform] duration-200 ease-out hover:border-[var(--color-accent-primary)] hover:text-[var(--color-starlight)] active:scale-[0.97]"
                    data-cursor-hover
                  >
                    {Icon ? <Icon size={18} /> : link.label}
                  </a>
                  </Magnetic>
                );
              })}
            </div>
          </div>

          {/* ── The form, in a ringed card ────────────────────── */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: DUR.reveal, ease: EASE.out }}
              /* Gradient hairline ring: a 1px padded wrapper whose background
                 is the gradient, with the real card inset inside it. Cheaper
                 and crisper than a blurred pseudo-element glow. */
              className="rounded-[26px] bg-gradient-to-b from-[var(--color-accent-primary)]/50 via-[var(--color-glass-border)] to-transparent p-px shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            >
              <div className="glass rounded-[25px] p-6 sm:p-8 md:p-10">
                <div className="mb-8 flex items-end justify-between gap-4 border-b border-[var(--color-glass-border)] pb-5">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-[var(--color-starlight)]">
                      {/* Scrambles once on hover — the form header is the one
                          place in this section a deliberate glitch reads as
                          "transmission" rather than as noise. */}
                      <ScrambleText text="Send a message" />
                    </h3>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-[var(--color-ash)]">
                      All fields required
                    </p>
                  </div>
                  <span className="hidden shrink-0 rounded-full border border-[var(--color-glass-border)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--color-silver)] sm:block">
                    Encrypted
                  </span>
                </div>

                <ContactForm variant="classic" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Signal field ───────────────────────────────────
            A 9×64 point matrix in a hairline surface with real padding, so
            the cursor has room to travel through it and the ripple has
            somewhere to spread. It went through a too-small phase (4×36 in a
            28rem cap) that left it a one-line strip with no interaction
            room; this is the corrected size. */}

        <div className="mt-10 md:mt-12">
          <div className="mb-3 flex items-baseline justify-between gap-4">

            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-ash)]">
              Signal field
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-ash)]">
              Move or press to ripple
            </span>
          </div>
          {/* Glow at 150px: sized to the taller field, and still short of the
              220px that used to wash the entire strip rather than lighting
              the points near the cursor. GlowTrail clips to its own bounds,
              so the radius is what actually contains it. */}

          <GlowTrail size={150}>
            <div className="rounded-2xl border border-[var(--color-glass-border)] px-5 py-7 sm:px-7 sm:py-9">
              <AnimeRippleField rows={9} columns={64} />
            </div>
          </GlowTrail>

        </div>

      </div>
    </section>

  );
}
