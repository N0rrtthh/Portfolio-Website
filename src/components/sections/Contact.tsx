"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Mail, User, MessageSquare } from "lucide-react";
import RevealText from "@/components/ui/RevealText";
import ChapterLabel from "@/components/ui/ChapterLabel";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/data";
import { GitHubIcon, XIcon } from "@/components/ui/BrandIcons";

const EASING = [0.22, 1, 0.36, 1] as const;

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  github: GitHubIcon,
  twitter: XIcon,
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  }

  return (
    <section id="contact" className="section-padding relative min-h-svh flex flex-col justify-center">
      {/* Ambient Radial Gradient Background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] animate-breathe pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(67,97,238,0.12), transparent 70%)",
          }}
        />
      </div>

      <div className="container-narrow relative z-10">
        <ChapterLabel index={10} classic="Contact" eva="TRANSMISSION UPLINK" className="mb-8" />

        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* Left Column — Editorial Heading & Details */}
          <div className="lg:col-span-5">
            <RevealText
              as="h2"
              className="text-section-title font-display text-[var(--color-starlight)]"
            >
              Let&apos;s build something
            </RevealText>
            <RevealText
              as="h2"
              delay={0.15}
              className="text-section-title font-display text-[var(--color-accent-primary)] mb-6"
            >
              unforgettable.
            </RevealText>

            <p className="font-body text-base text-[var(--color-silver)] leading-relaxed mb-8 max-w-prose">
              Open to full-stack engineering, mobile development, and creative UI/UX roles. Have a project in mind or an inquiry? Send a transmission below.
            </p>

            {/* Direct Contact Cards */}
            <div className="space-y-4 mb-8">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="glass group flex items-center gap-4 rounded-2xl p-4 border border-[var(--color-glass-border)] hover:border-[var(--color-accent-primary)]/40 transition-colors"
                data-cursor-hover
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] group-hover:scale-110 transition-transform">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase text-[var(--color-ash)] block">DIRECT EMAIL</span>
                  <span className="font-mono text-sm font-semibold text-[var(--color-starlight)]">{CONTACT_EMAIL}</span>
                </div>
              </a>
            </div>

            {/* Social Connection Links */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-[var(--color-ash)]">Connect:</span>
              {SOCIAL_LINKS.map((link) => {
                const Icon = ICONS[link.icon];
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl glass border border-[var(--color-glass-border)] text-[var(--color-silver)] hover:text-[var(--color-starlight)] hover:border-[var(--color-accent-primary)] transition-[color,border-color,background-color,transform] duration-200 ease-out active:scale-[0.97]"
                    data-cursor-hover
                  >
                    {Icon ? <Icon size={18} /> : link.label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right Column — Full Interactive Transmission Form with Text Boxes */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, delay: 0.2, ease: EASING }}
              className="glass rounded-3xl p-8 md:p-10 border border-[var(--color-glass-border)] shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center flex flex-col items-center gap-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[var(--color-starlight)]">
                    Transmission Received!
                  </h3>
                  <p className="font-body text-sm text-[var(--color-silver)] max-w-sm">
                    Thank you for reaching out, {formData.name || "friend"}. I will respond to your inquiry shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", message: "" });
                    }}
                    className="mt-4 font-mono text-xs uppercase tracking-widest text-[var(--color-accent-primary)] hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Input Box */}
                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-[var(--color-silver)] mb-2 flex items-center gap-2">
                      <User size={14} className="text-[var(--color-accent-primary)]" /> Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Vance"
                      className="w-full rounded-2xl bg-[var(--color-void)]/80 border border-[var(--color-glass-border)] px-4 py-3.5 font-body text-sm text-[var(--color-starlight)] placeholder-[var(--color-ash)] focus:border-[var(--color-accent-primary)] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Email Input Box */}
                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-[var(--color-silver)] mb-2 flex items-center gap-2">
                      <Mail size={14} className="text-[var(--color-accent-primary)]" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. alex@company.com"
                      className="w-full rounded-2xl bg-[var(--color-void)]/80 border border-[var(--color-glass-border)] px-4 py-3.5 font-body text-sm text-[var(--color-starlight)] placeholder-[var(--color-ash)] focus:border-[var(--color-accent-primary)] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Message Textarea */}
                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-[var(--color-silver)] mb-2 flex items-center gap-2">
                      <MessageSquare size={14} className="text-[var(--color-accent-primary)]" /> Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell me about your project, timeline, or opportunity..."
                      className="w-full rounded-2xl bg-[var(--color-void)]/80 border border-[var(--color-glass-border)] px-4 py-3.5 font-body text-sm text-[var(--color-starlight)] placeholder-[var(--color-ash)] focus:border-[var(--color-accent-primary)] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[var(--color-accent-primary)] px-8 py-4 font-body text-sm font-bold text-white transition-[background-color,box-shadow,transform] duration-[250ms] ease-out active:scale-[0.97] hover:bg-[var(--color-accent-primary)]/90 hover:shadow-[0_8px_30px_rgba(67,97,238,0.35)] disabled:opacity-50"
                    data-cursor-hover
                  >
                    {isSubmitting ? (
                      <span className="font-mono text-xs uppercase tracking-widest animate-pulse">TRANSMITTING...</span>
                    ) : (
                      <>
                        <span>Send Transmission</span>
                        <Send size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
