"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Web Storage values exposed as an external store, so components read them during render
 * (no "load in an effect, then set state" round trip) and stay in sync across components and tabs.
 */
type StorageKind = "local" | "session";

const listeners = new Map<string, Set<() => void>>();

function storageFor(kind: StorageKind): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function listenerKey(kind: StorageKind, key: string) {
  return `${kind}:${key}`;
}

function notify(kind: StorageKind, key: string) {
  listeners.get(listenerKey(kind, key))?.forEach((listener) => listener());
}

export function readStored(kind: StorageKind, key: string): string | null {
  try {
    return storageFor(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStored(kind: StorageKind, key: string, value: string | null): void {
  try {
    const storage = storageFor(kind);
    if (value === null) storage?.removeItem(key);
    else storage?.setItem(key, value);
  } catch {
    // Storage unavailable: the change is kept for this page view only.
  }
  notify(kind, key);
}

function subscribe(kind: StorageKind, key: string, listener: () => void) {
  const id = listenerKey(kind, key);
  const set = listeners.get(id) ?? new Set();
  set.add(listener);
  listeners.set(id, set);

  const onStorage = (event: StorageEvent) => {
    if (event.key === key) listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    set.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Raw stored string (or `null`); `null` during server rendering and hydration. */
export function useStoredString(kind: StorageKind, key: string): [string | null, (value: string | null) => void] {
  const value = useSyncExternalStore(
    useCallback((listener: () => void) => subscribe(kind, key, listener), [kind, key]),
    () => readStored(kind, key),
    () => null
  );
  const setValue = useCallback((next: string | null) => writeStored(kind, key, next), [kind, key]);
  return [value, setValue];
}
