"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Typed command channel between the app shell (header, bottom dock — rendered by the
 * root layout) and the showcase pages (home world, explore carousel).
 */
export type ShowcaseCommand =
  /** Reset the home world to its resting view. */
  | "world-home"
  /** Show the next set of products in the world / advance the carousel. */
  | "world-reload"
  /** The home world finished its intro; shell chrome may fade in. */
  | "world-ui-ready"
  | "explore-prev"
  | "explore-next";

const EVENT_PREFIX = "xtream-utd:";

export function emitShowcase(command: ShowcaseCommand): void {
  window.dispatchEvent(new CustomEvent(`${EVENT_PREFIX}${command}`));
}

/** Runs `handler` whenever `command` is emitted while the component is mounted. */
export function useShowcaseEvent(command: ShowcaseCommand, handler: () => void): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = () => handlerRef.current();
    const eventName = `${EVENT_PREFIX}${command}`;
    window.addEventListener(eventName, listener);
    return () => window.removeEventListener(eventName, listener);
  }, [command]);
}

/**
 * On the home page, shell chrome stays hidden until the world's intro completes.
 * Returns `true` immediately on every other page.
 */
export function useShowcaseReady(isHomePage: boolean): boolean {
  const [readyOnHome, setReadyOnHome] = useState(false);

  // Every arrival on the home page waits for a fresh intro.
  const [wasHomePage, setWasHomePage] = useState(isHomePage);
  if (wasHomePage !== isHomePage) {
    setWasHomePage(isHomePage);
    setReadyOnHome(false);
  }

  useShowcaseEvent("world-ui-ready", () => setReadyOnHome(true));

  return isHomePage ? readyOnHome : true;
}
