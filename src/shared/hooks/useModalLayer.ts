"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Ref-counted modal layer. Any number of overlays can be open at once; the page
 * scroll lock (`body.modal-open`) is applied while at least one is open.
 */
let openLayers = 0;
const listeners = new Set<() => void>();

function emit() {
  document.body.classList.toggle("modal-open", openLayers > 0);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Registers an overlay as open while `active` is true. */
export function useModalLayer(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    openLayers += 1;
    emit();
    return () => {
      openLayers = Math.max(0, openLayers - 1);
      emit();
    };
  }, [active]);
}

/** True while any overlay registered with `useModalLayer` is open. */
export function useAnyModalOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => openLayers > 0,
    () => false
  );
}
