"use client";

import { useRef } from "react";

interface InfiniteMarqueeProps {
  children: React.ReactNode;
  baseVelocity: number;
  className?: string;
}

export default function InfiniteMarquee({ children, baseVelocity = 100, className = "" }: InfiniteMarqueeProps) {
  // A negative velocity means reverse direction
  const isReverse = baseVelocity < 0;
  
  // Base velocity determines animation duration. 
  // Higher velocity = lower duration (faster). 
  // E.g. baseVelocity 100 = ~30s, baseVelocity 50 = ~60s
  const duration = Math.max(10, 3000 / Math.abs(baseVelocity));

  return (
    <div className={`overflow-hidden flex whitespace-nowrap flex-nowrap group ${className}`}>
      <div 
        className={`flex whitespace-nowrap flex-nowrap gap-4 min-w-[200%] ${isReverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {/* Render children multiple times for seamless scrolling */}
        <div className="flex shrink-0 gap-4 min-w-full justify-around">{children}</div>
        <div className="flex shrink-0 gap-4 min-w-full justify-around" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
