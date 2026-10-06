"use client";

import { useSyncExternalStore } from "react";

function subscribe(listener: () => void) {
  window.addEventListener("scroll", listener, { passive: true });
  return () => window.removeEventListener("scroll", listener);
}

function getScrollY() {
  return window.scrollY || document.documentElement.scrollTop;
}

/** True when the page is scrolled further than `threshold` pixels. */
export function useScrollThreshold(threshold: number): boolean {
  return useSyncExternalStore(
    subscribe,
    () => getScrollY() > threshold,
    () => false
  );
}
