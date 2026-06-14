"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";

interface ChapterLabelProps {
  /** Chapter number, e.g. 2 → "Ch. 02". */
  index: number;
  /** Classic-mode label, e.g. "About". */
  classic: string;
  /** NERV/Evangelion-flavored label shown when design === "eva". */
  eva: string;
  className?: string;
}

/** Section eyebrow label that re-renders as a NERV-style readout when the
 * site's design theme flips to "eva" — the label text itself changes (not
 * just its color), with a scanline decode swap so the transition reads as
 * an in-universe system re-sync rather than a content pop. */
export default function ChapterLabel({
  index,
  classic,
  eva,
  className = "",
}: ChapterLabelProps) {
  const { design } = useTheme();
  const num = String(index).padStart(2, "0");
  const text = design === "eva" ? `LOG.${num} // ${eva}` : `Ch. ${num} — ${classic}`;

  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`chapter-label relative overflow-hidden ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={design}
          initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
          animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
          exit={{ clipPath: "inset(100% 0 0 0)", opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="inline-block"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </motion.p>
  );
}
