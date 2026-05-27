"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="scroll-progress w-full"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
