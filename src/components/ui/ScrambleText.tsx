"use client";

import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

const CHARS = "!@#$%^&*()_+{}:\"<>?|[];',./~`-=";

export default function ScrambleText({
  text,
  as: Component = "span",
  className = "",
  delay = 0,
}: {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as?: any;
  className?: string;
  delay?: number;
}) {
  const [displayText, setDisplayText] = useState(text.replace(/./g, " "));
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const isAnimating = useRef(false);

  useEffect(() => {
    if (!inView || isAnimating.current) return;

    let timeoutId: NodeJS.Timeout;

    const startScramble = () => {
      isAnimating.current = true;
      let iteration = 0;
      const maxIterations = text.length;

      const interval = setInterval(() => {
        setDisplayText(
          text
            .split("")
            .map((char, index) => {
              if (char === " ") return " ";
              if (index < iteration) {
                return text[index];
              }
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );

        if (iteration >= maxIterations) {
          clearInterval(interval);
          isAnimating.current = false;
          // Restart after 3 seconds of being resolved
          timeoutId = setTimeout(() => {
            startScramble();
          }, 3000);
        }

        iteration += 1 / 3; // Slow down the reveal
      }, 30);
    };

    const initialDelay = setTimeout(() => {
      startScramble();
    }, delay * 1000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timeoutId);
    };
  }, [text, inView, delay]);

  return (
    <Component ref={ref} className={className}>
      {displayText}
    </Component>
  );
}
