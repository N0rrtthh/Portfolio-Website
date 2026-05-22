import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/data";
import { ArrowUpRight } from "lucide-react";

export default function EvaContact() {
  return (
    <section id="contact" className="relative pb-24">
      <div className="mb-12 border-b-2 border-[var(--color-accent-primary)] pb-4">
        <h2 className="font-display text-3xl font-bold text-[var(--color-accent-primary)] uppercase tracking-wider">
          Comms // Uplink Terminal
        </h2>
      </div>

      <div className="bg-[var(--color-accent-primary)] text-white p-8 md:p-14 relative overflow-hidden border border-[var(--color-accent-warm)]">
        {/* Background stripe pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 10px)"
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div>
            <span className="font-mono text-xs font-bold tracking-[0.2em] block mb-4 text-[var(--color-accent-warm)]">
              &gt; ESTABLISH TRANSMISSION LINK
            </span>
            <a 
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-display text-4xl md:text-6xl font-black uppercase hover:text-[var(--color-accent-warm)] transition-colors duration-150"
              data-cursor-hover
            >
              SEND MESSAGE
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs font-bold tracking-widest block text-[var(--color-accent-warm)]">
              &gt; EXTERNAL NODES
            </span>
            <div className="flex gap-6">
              {SOCIAL_LINKS.map((link) => (
                <a 
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-bold uppercase flex items-center gap-1.5 hover:text-[var(--color-accent-warm)] transition-colors duration-150 border-b border-white hover:border-[var(--color-accent-warm)] pb-1"
                  data-cursor-hover
                >
                  {link.label} <ArrowUpRight size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
