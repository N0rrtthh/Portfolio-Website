"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { ArrowUpRight, ChevronsUp } from "lucide-react";
import ContactForm from "@/components/ui/ContactForm";
import AnimeWaveBars from "@/components/ui/AnimeWaveBars";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/data";


/* ══════════════════════════════════════════════════════════
   EVA // Comms uplink — click-to-open bay
   ──────────────────────────────────────────────────────────
   The scroll-driven version is gone. It needed a 150svh runway plus a
   `sticky` pin, and that runway IS extra scrollable page: the section
   could not sit at the bottom of the document because 1.5 viewports of
   empty scroll distance always followed the heading. Removing it is the
   only way the composer can be the last pixel on the page.

   Now: the banner is the trigger, and the two panels are a deck of two
   cards. The composer is permanently mounted as the bottom card; the
   banner sits on top of it in the same grid cell. Pressing the button
   takes the top card off — the banner lifts 4% and fades, and the
   composer underneath is simply uncovered. It never moves.

   4%, not 100%: a card being removed from a deck barely travels before it
   stops being the thing you are looking at. Flying it a full panel height
   (and sliding the composer up to meet it) read as two panels swapping
   places, which is a much louder gesture than what was asked for.

   Layout: one grid cell (`[grid-area:1/1]`) for both, so the section is
   always as tall as the composer and its height never changes on open —
   no reflow, and the page bottom stays where it is.

   Motion: transform + opacity only, so it stays on the compositor.

   ══════════════════════════════════════════════════════════ */


function Heading() {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 border-b-2 border-[var(--color-accent-primary)] pb-4">
      <h2 className="font-display text-3xl font-bold uppercase tracking-wider text-[var(--color-accent-primary)]">
        Comms // Uplink Terminal
      </h2>
      {/* Frameless carrier readout — reads as terminal chrome, not a widget */}
      <AnimeWaveBars bars={22} className="hidden sm:flex" />
    </div>

  );
}

function Banner({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="relative h-full min-h-[60svh] overflow-hidden border border-[var(--color-accent-warm)] bg-[var(--color-accent-primary)] p-8 text-white md:p-14">

      {/* Background stripe pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 10px)",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col justify-between gap-10">
        <div>
          <span className="mb-4 block font-mono text-xs font-bold tracking-[0.2em] text-[var(--color-accent-warm)]">
            &gt; ESTABLISH TRANSMISSION LINK
          </span>

          <p className="font-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
            SEND
            <br />
            MESSAGE
          </p>

          {/* The trigger. It was "keep scrolling" copy before, which is the
              instruction that required the runway to exist. */}
          <button
            type="button"
            onClick={onOpen}
            className="mt-6 inline-flex items-center gap-2 border-2 border-[var(--color-accent-warm)] bg-black/30 px-5 py-3 font-mono text-xs font-black uppercase tracking-[0.2em] text-[var(--color-accent-warm)] transition-colors duration-150 hover:bg-[var(--color-accent-warm)] hover:text-black active:scale-[0.98]"
            data-cursor-hover
          >
            <ChevronsUp size={14} />
            Open the bay
          </button>

          <p className="mt-4 font-mono text-[11px] tracking-wider text-white/70">
            or mail{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline decoration-dotted hover:text-white"
              data-cursor-hover
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="block font-mono text-xs font-bold tracking-widest text-[var(--color-accent-warm)]">
            &gt; EXTERNAL NODES
          </span>
          <div className="flex flex-wrap gap-6">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 border-b border-white pb-1 font-mono text-xs font-bold uppercase transition-colors duration-150 hover:border-[var(--color-accent-warm)] hover:text-[var(--color-accent-warm)]"
                data-cursor-hover
              >
                {link.label} <ArrowUpRight size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Composer() {
  return (
    <div className="relative border-2 border-black bg-[var(--color-accent-warm)] p-5 sm:p-7">
      {/* Door rail */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-black" aria-hidden />

      <div className="mb-5">
        <span className="block font-mono text-[10px] font-black uppercase tracking-[0.28em] text-black/70">
          HANGAR BAY 03 // MESSAGE COMPOSER
        </span>
        <p className="mt-1 font-display text-xl font-black uppercase tracking-wide text-black sm:text-2xl">
          Compose transmission
        </p>
      </div>

      <ContactForm variant="eva" />
    </div>
  );
}

export default function EvaContact() {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  /* Reduced motion: both panels, stacked, no swap at all. */
  if (reduced) {
    return (
      <section id="contact" className="relative">
        <Heading />
        <div className="space-y-8">
          <Banner onOpen={() => undefined} />
          <Composer />
        </div>
      </section>
    );
  }

  return (
    /* No runway, no sticky, no bottom padding: the composer is the last thing
       in the document and lands flush against its end. */
    <section id="contact" className="relative">
      <Heading />

      {/* Single cell — the two panels swap inside it, so the section height is
          whichever panel is currently mounted and nothing scrolls past it. */}
      {/* min-h is the banner's height, kept on the wrapper rather than only on
          the banner. Without it the section was as tall as the banner while
          closed and as tall as the (shorter) composer once open, so finishing
          the animation yanked the layout — that is the "send message goes
          down" jump. Now the box never changes size and only its contents
          move. */}
      <div className="relative grid min-h-[60svh] w-full overflow-hidden">
        {/* Bottom card: always mounted, top-aligned, uncovered rather than
            introduced. It only eases its last 1.5% of scale/opacity so the
            reveal has something of its own, which is what was missing when
            the banner's exit was the only thing moving. */}
        <motion.div
          className="[grid-area:1/1] self-start"
          initial={false}
          animate={{ opacity: open ? 1 : 0.9, scale: open ? 1 : 0.985 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: open ? 0.1 : 0 }}
        >
          <Composer />
        </motion.div>

        {/* Top card. It is lifted off, not flown away: -7% and out over 0.55s.
            The earlier -4%/0.42s was too small and too quick to register as
            motion at all — it read as an instant swap. */}
        <AnimatePresence initial={false}>
          {!open && (
            <motion.div
              key="banner"
              exit={{ y: "-7%", opacity: 0, scale: 1.015 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="z-10 [grid-area:1/1] self-start"
            >

              <Banner onOpen={() => setOpen(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </section>
  );
}

