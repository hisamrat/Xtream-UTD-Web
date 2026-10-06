"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function copyWithTextarea(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

/**
 * Copies text to the clipboard. `copiedKey` holds the key of the last successful copy
 * for `resetMs`, so one hook can drive several copy buttons. Failed copies never report success.
 */
export function useCopyToClipboard(resetMs = 2200) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    []
  );

  const copy = useCallback(
    async (text: string, key = "default"): Promise<boolean> => {
      let copied = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          copied = true;
        }
      } catch {
        copied = false;
      }
      if (!copied) {
        copied = copyWithTextarea(text);
      }

      if (copied) {
        setCopiedKey(key);
        if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setCopiedKey(null), resetMs);
      }
      return copied;
    },
    [resetMs]
  );

  return { copy, copiedKey, isCopied: (key = "default") => copiedKey === key };
}
