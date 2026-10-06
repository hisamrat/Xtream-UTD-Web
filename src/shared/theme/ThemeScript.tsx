"use client";

import { useSyncExternalStore } from "react";
import { themeBootstrapScript } from "./theme";

const noopSubscribe = () => () => undefined;

/**
 * Inline script that applies the stored theme before first paint (no light/dark flash).
 *
 * It is emitted in the server HTML and kept during hydration (server snapshot `true`).
 * When React renders the layout purely on the client — e.g. a not-found boundary — the
 * script has already run, so nothing is rendered; React would otherwise warn that client-
 * rendered <script> tags never execute. `next/script` is not used because its
 * `beforeInteractive` strategy queues inline code until Next's runtime loads, which is too
 * late to prevent the flash.
 */
export function ThemeScript() {
  const renderScript = useSyncExternalStore(
    noopSubscribe,
    () => false,
    () => true
  );

  return renderScript ? <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} /> : null;
}
