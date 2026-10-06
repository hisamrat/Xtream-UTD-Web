"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => undefined;

/** `false` during server rendering and hydration, `true` afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

export type ViewportSize = { width: number; height: number };

let cachedViewport: ViewportSize | null = null;

function readViewport(): ViewportSize {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (!cachedViewport || cachedViewport.width !== width || cachedViewport.height !== height) {
    cachedViewport = { width, height };
  }
  return cachedViewport;
}

function subscribeResize(listener: () => void) {
  window.addEventListener("resize", listener);
  return () => window.removeEventListener("resize", listener);
}

/** Window size, or `serverFallback` before hydration. */
export function useViewportSize(serverFallback: ViewportSize): ViewportSize {
  return useSyncExternalStore(subscribeResize, readViewport, () => serverFallback);
}

function subscribeVisibility(listener: () => void) {
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
}

/** True while the browser tab is hidden. */
export function useDocumentHidden(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false
  );
}
