"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTheme, DesignTheme } from "@/components/providers/ThemeProvider";
import ClassicLayout from "@/components/layout/ClassicLayout";
import EvaLayout from "@/components/layout/EvaLayout";
import BootSequence from "@/components/ui/BootSequence";
import EvaSideLoader from "@/components/ui/EvaSideLoader";
import CinematicLoader from "@/components/ui/CinematicLoader";
import ScrollProgress from "@/components/layout/ScrollProgress";
import FloatingThemeToggle from "@/components/ui/FloatingThemeToggle";
import CustomCursor from "@/components/layout/CustomCursor";

export default function HomeClient() {
  const { design, setDesign, evaLoaderStyle } = useTheme();

  // The layout that is currently rendered underneath the loaders
  const [activeLayout, setActiveLayout] = useState<DesignTheme | null>(null);

  // The layout we are transitioning to (determines which loader plays)
  const [transitionTarget, setTransitionTarget] = useState<DesignTheme | null>(null);

  // Track previous design to detect changes after initial mount
  const prevDesignRef = useRef<DesignTheme>(design);
  const hasMountedRef = useRef(false);

  // Global Keyboard Shortcut listener: Shift + E to toggle EVA mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.shiftKey && (e.key === "E" || e.key === "e")) {
        e.preventDefault();
        setDesign(design === "classic" ? "eva" : "classic");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [design, setDesign]);

  // Initialize: trigger the loader for the first mount
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      setTransitionTarget(design);
    }
  }, [design]);

  // Listen for subsequent theme toggles
  useEffect(() => {
    if (hasMountedRef.current && prevDesignRef.current !== design) {
      prevDesignRef.current = design;
      // Unmount the active layout immediately to prevent the wrong layout
      // from being visible during the loader transition
      setActiveLayout(null);
      setTransitionTarget(design);
    }
  }, [design]);

  const handleLoaderComplete = useCallback(() => {
    if (transitionTarget) {
      // Reset scroll to the very top before revealing the new layout
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

      // Also reset any Lenis instance or scroll container
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      setActiveLayout(transitionTarget);
      setTransitionTarget(null);
    }
  }, [transitionTarget]);

  return (
    <>
      {/* Classic Mode Loader */}
      {transitionTarget === "classic" && (
        <CinematicLoader key={`loader-classic-${Date.now()}`} onComplete={handleLoaderComplete} />
      )}

      {/* Eva Mode Loader — Choice between Side HUD Loader (default) and Terminal Boot Sequence */}
      {transitionTarget === "eva" && (
        evaLoaderStyle === "side" ? (
          <EvaSideLoader key={`loader-eva-side-${Date.now()}`} onComplete={handleLoaderComplete} />
        ) : (
          <BootSequence key={`loader-eva-terminal-${Date.now()}`} onComplete={handleLoaderComplete} />
        )
      )}

      <ScrollProgress />
      <FloatingThemeToggle />
      <CustomCursor design={activeLayout || design} />

      {/* Only render the ACTIVE layout — never both */}
      {activeLayout === "eva" && <EvaLayout key="eva-layout" />}
      {activeLayout === "classic" && <ClassicLayout key="classic-layout" />}
    </>
  );
}
