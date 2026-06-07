"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface TypewriterTextProps {
  text: string;
  delay?: number;
  className?: string;
  speed?: number;
  cursor?: boolean;
}

export default function TypewriterText({ 
  text, 
  delay = 0, 
  className = "",
  speed = 50,
  cursor = true
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10%" });

  useEffect(() => {
    if (!isInView) return;

    let timeoutId: NodeJS.Timeout;
    
    timeoutId = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;
      
      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          timeoutId = setTimeout(typeNextChar, speed + (Math.random() * 30));
        } else {
          setIsTyping(false);
        }
      };
      
      typeNextChar();
    }, delay * 1000);

    return () => clearTimeout(timeoutId);
  }, [text, delay, speed, isInView]);

  return (
    <span ref={containerRef} className={`inline-block ${className}`}>
      {displayedText}
      {cursor && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="inline-block w-[0.4em] h-[1em] bg-current ml-1 align-middle opacity-70"
          style={{ display: displayedText.length > 0 || isTyping ? 'inline-block' : 'none' }}
        />
      )}
    </span>
  );
}
