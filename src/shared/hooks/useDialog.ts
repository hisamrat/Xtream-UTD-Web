"use client";

import { type RefObject, useEffect, useRef } from "react";
import { useModalLayer } from "./useModalLayer";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

type DialogOptions = {
  open: boolean;
  onClose: () => void;
  /** Element that receives focus when the dialog opens (defaults to the first focusable element). */
  initialFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * Accessible modal behaviour for an existing dialog element: scroll lock, Escape to close,
 * initial focus, Tab focus trap, and focus restoration to the previously focused element.
 * Returns the ref to attach to the dialog container.
 */
export function useDialog<T extends HTMLElement = HTMLDivElement>({ open, onClose, initialFocusRef }: DialogOptions) {
  const containerRef = useRef<T | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useModalLayer(open);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusTimer = window.setTimeout(() => {
      const container = containerRef.current;
      const target = initialFocusRef?.current ?? container?.querySelector<HTMLElement>(FOCUSABLE) ?? container;
      target?.focus({ preventScroll: true });
    }, 20);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const container = containerRef.current;
      if (!container) return;

      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null || element === document.activeElement
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !container.contains(active))) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && (active === last || !container.contains(active))) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [open, initialFocusRef]);

  return containerRef;
}
