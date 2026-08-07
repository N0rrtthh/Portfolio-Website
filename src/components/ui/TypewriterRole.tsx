"use client";

import { useEffect, useState } from "react";

const ROLES = [
  "Game Developer Enthusiast",
  "UI/UX Designer",
  "Frontend Developer",
  "Creative Problem Solver",
];

export default function TypewriterRole() {
  const [roleIdx, setRoleIdx] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = ROLES[roleIdx];
    let timer: NodeJS.Timeout;

    if (!isDeleting && displayText.length < currentRole.length) {
      // Type next character (fast typing speed ~40ms)
      timer = setTimeout(() => {
        setDisplayText(currentRole.slice(0, displayText.length + 1));
      }, 40);
    } else if (!isDeleting && displayText.length === currentRole.length) {
      // Pause at full word before erasing (~1600ms)
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 1600);
    } else if (isDeleting && displayText.length > 0) {
      // Erase character fast (~25ms)
      timer = setTimeout(() => {
        setDisplayText(currentRole.slice(0, displayText.length - 1));
      }, 25);
    } else if (isDeleting && displayText.length === 0) {
      // Move to next role (deferred to avoid cascading renders)
      timer = setTimeout(() => {
        setIsDeleting(false);
        setRoleIdx((prev) => (prev + 1) % ROLES.length);
      }, 50);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIdx]);

  return (
    <span className="inline-flex items-center font-body text-xl font-bold text-[var(--color-accent-primary)] md:text-2xl min-h-[36px]">
      <span>{displayText}</span>
      <span className="ml-1 inline-block h-6 w-0.5 bg-[var(--color-accent-primary)] animate-pulse" />
    </span>
  );
}
