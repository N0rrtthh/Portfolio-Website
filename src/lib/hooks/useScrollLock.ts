"use client";

import { useEffect } from "react";

/* ══════════════════════════════════════════════════════════
   useScrollLock
   ──────────────────────────────────────────────────────────
   Locks the page behind an overlay. Three things have to be
   handled together or the lock leaks:

   1. Lenis. It drives scroll from its own rAF loop, so
      `overflow: hidden` alone does nothing — it must be stopped.
   2. Scroll position. `position: fixed` on <body> is the only
      reliable iOS lock, but it resets scrollTop, so the offset is
      captured and restored on release.
   3. Nesting. Multiple overlays can be open (project modal on top
      of a section panel); a module-level counter means the last
      one out restores, not the first.

   Scroll *chaining* (overscroll bubbling into the page) is handled
   on the scrollable element itself via `overscroll-behavior`, see
   the `.scroll-panel` utility in globals.css.
   ══════════════════════════════════════════════════════════ */

interface LenisLike {
  stop: () => void;
  start: () => void;
}

let lockCount = 0;
let savedScrollY = 0;
let savedBodyStyle = "";

function applyLock() {
  savedScrollY = window.scrollY;
  savedBodyStyle = document.body.getAttribute("style") ?? "";

  // `position: fixed` + negative top is the only approach iOS Safari
  // respects. Width pin prevents the reflow jump when the scrollbar
  // (or its gutter) disappears.
  document.body.style.position = "fixed";
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
}

function releaseLock() {
  if (savedBodyStyle) document.body.setAttribute("style", savedBodyStyle);
  else document.body.removeAttribute("style");

  // Restore synchronously and without smoothing — the user never
  // asked to scroll, they asked to close a panel.
  window.scrollTo({ top: savedScrollY, behavior: "instant" as ScrollBehavior });
}

export function useScrollLock(locked: boolean, lenis?: LenisLike | null) {
  useEffect(() => {
    if (!locked) return;

    lockCount += 1;
    if (lockCount === 1) applyLock();
    lenis?.stop();

    return () => {
      lockCount -= 1;
      if (lockCount === 0) releaseLock();
      lenis?.start();
    };
  }, [locked, lenis]);
}

export default useScrollLock;
