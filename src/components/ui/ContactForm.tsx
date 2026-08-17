"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Mail, User, MessageSquare } from "lucide-react";

/* ══════════════════════════════════════════════════════════
   ContactForm
   ──────────────────────────────────────────────────────────
   One form, two skins. EVA's uplink panel needs the exact same
   fields, validation and submission as Classic — duplicating them
   would guarantee the two drift apart the first time either changes.
   Only the surface styling is branched, via `variant`.
   ══════════════════════════════════════════════════════════ */

type Variant = "classic" | "eva";

const SKIN: Record<
  Variant,
  { label: string; icon: string; field: string; submit: string; note: string }
> = {
  /* Classic reuses the site's own vocabulary rather than inventing a form
     style: glass surfaces with a hairline border for the fields (same as the
     fact rows and the availability pill), and the accent pill used everywhere
     else in the section for the submit. A white/starlight button was the only
     light-on-dark control on the page, which is what made it read as foreign.

     Focus state: the border stays 1px and only shifts colour, with a single
     1px accent ring outside it — no 3px halo. The transition is 260ms on
     border-colour AND box-shadow, so the ring grows in rather than snapping,
     which was the "instant thick outline" complaint. */
  classic: {
    label:
      "font-mono text-[10px] uppercase tracking-widest text-[var(--color-ash)]",
    icon: "text-[var(--color-accent-primary)]",
    field:
      "w-full rounded-xl glass border border-[var(--color-glass-border)] px-4 py-3.5 font-body text-sm text-[var(--color-starlight)] placeholder-[var(--color-ash)] shadow-[0_0_0_0_rgba(67,97,238,0)] transition-[border-color,box-shadow,background-color] duration-[260ms] ease-out hover:border-[var(--color-silver)]/30 focus:border-[var(--color-accent-primary)]/70 focus:shadow-[0_0_0_1px_rgba(67,97,238,0.55)] focus:outline-none",
    submit:
      "w-full flex items-center justify-center gap-2.5 rounded-full bg-[var(--color-accent-primary)] px-8 py-3.5 font-body text-sm font-semibold text-white transition-[background-color,box-shadow,transform] duration-[250ms] ease-out will-change-transform transform-gpu hover:-translate-y-0.5 hover:shadow-[0_10px_34px_rgba(67,97,238,0.42)] active:scale-[0.97] disabled:opacity-50 disabled:hover:translate-y-0",
    note: "text-[var(--color-accent-primary)]",
  },

  eva: {
    label: "font-mono text-[10px] uppercase tracking-[0.2em] text-black/70",
    icon: "text-black",
    /* 1px rule, not 2px: on focus the outline used to jump to a heavy black
       slab in one frame. Now the border thickness never changes — only its
       colour, plus a hairline ring that eases in over 260ms. */
    field:
      "w-full rounded-none border border-black/45 bg-white/85 px-4 py-3 font-mono text-sm text-black placeholder-black/40 shadow-[0_0_0_0_rgba(0,0,0,0)] transition-[border-color,box-shadow,background-color] duration-[260ms] ease-out hover:border-black/70 focus:border-black focus:bg-white focus:shadow-[0_0_0_1px_rgba(0,0,0,0.75)] focus:outline-none",

    submit:
      "w-full flex items-center justify-center gap-3 border-2 border-black bg-black px-8 py-4 font-mono text-xs font-black uppercase tracking-[0.2em] text-[var(--color-accent-warm)] transition-[background-color,color,transform] duration-200 ease-out active:scale-[0.98] hover:bg-[var(--color-accent-warm)] hover:text-black disabled:opacity-50",
    note: "text-black",
  },
};

export default function ContactForm({ variant = "classic" }: { variant?: Variant }) {
  const skin = SKIN[variant];

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    // Stand-in for the real endpoint. The delay exists to show the pending
    // state, not to paper over a race — swap this block for the fetch when
    // a backend exists and the states already line up.
    window.setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="py-12 text-center flex flex-col items-center gap-4"
      >
        <div
          className={
            variant === "eva"
              ? "flex h-16 w-16 items-center justify-center border-2 border-black bg-black text-[var(--color-accent-warm)] mb-2"
              : "flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2"
          }
        >
          <CheckCircle2 size={32} />
        </div>
        <h3
          className={
            variant === "eva"
              ? "font-display text-2xl font-black uppercase tracking-wider text-black"
              : "font-display text-2xl font-bold text-[var(--color-starlight)]"
          }
        >
          Transmission Received!
        </h3>
        <p
          className={
            variant === "eva"
              ? "font-mono text-xs text-black/70 max-w-sm"
              : "font-body text-sm text-[var(--color-silver)] max-w-sm"
          }
        >
          Thank you for reaching out, {formData.name || "friend"}. I will respond to your
          inquiry shortly.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: "", email: "", message: "" });
          }}
          className={`mt-4 font-mono text-xs uppercase tracking-widest hover:underline ${skin.note}`}
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor={`cf-name-${variant}`} className={`${skin.label} mb-2 flex items-center gap-2`}>
          <User size={14} className={skin.icon} /> Your Name
        </label>
        <input
          id={`cf-name-${variant}`}
          type="text"
          name="name"
          autoComplete="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Alex Vance"
          className={skin.field}
        />
      </div>

      <div>
        <label htmlFor={`cf-email-${variant}`} className={`${skin.label} mb-2 flex items-center gap-2`}>
          <Mail size={14} className={skin.icon} /> Email Address
        </label>
        <input
          id={`cf-email-${variant}`}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="e.g. alex@company.com"
          className={skin.field}
        />
      </div>

      <div>
        <label htmlFor={`cf-message-${variant}`} className={`${skin.label} mb-2 flex items-center gap-2`}>
          <MessageSquare size={14} className={skin.icon} /> Message
        </label>
        <textarea
          id={`cf-message-${variant}`}
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Tell me about your project, timeline, or opportunity..."
          className={`${skin.field} resize-none`}
        />
      </div>

      <button type="submit" disabled={isSubmitting} className={skin.submit} data-cursor-hover>
        {isSubmitting ? (
          <span className="font-mono text-xs uppercase tracking-widest animate-pulse">
            TRANSMITTING...
          </span>
        ) : (
          <>
            <span>{variant === "eva" ? "Transmit" : "Send Transmission"}</span>
            <Send size={16} />
          </>
        )}
      </button>
    </form>
  );
}
