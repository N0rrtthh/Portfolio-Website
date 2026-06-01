"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";

interface AnimeTextProps {
  children: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export default function AnimeText({
  children,
  className = "",
  delay = 0,
  as = "h1",
}: AnimeTextProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const Tag = as;

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: containerRef.current?.querySelectorAll(".anime-char"),
              translateY: ["110%", "0%"],
              rotateZ: [12, 0],
              opacity: [0, 1],
              easing: "easeOutElastic(1, .8)",
              duration: 1200,
              delay: anime.stagger(45, { start: delay }),
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [delay]);

  const words = children.split(" ");

  return (
    <Tag ref={containerRef as never} className={className}>
      {words.map((word, wIdx) => (
        <span key={wIdx} className="inline-block whitespace-nowrap overflow-hidden mr-[0.25em] py-1">
          {word.split("").map((char, cIdx) => (
            <span
              key={cIdx}
              className="anime-char inline-block origin-bottom-left transform-gpu"
              style={{ opacity: 0 }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
