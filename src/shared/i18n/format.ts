import type { Language } from "./languages";

const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBengaliDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => bengaliDigits[Number(digit)] ?? digit);
}

/** Renders digits in the script of the given language. */
export function formatNumberFor(language: Language, value: string | number): string {
  return language === "bn" ? toBengaliDigits(value) : String(value);
}

export type MessageParams = Record<string, string | number>;

/**
 * Replaces `{name}` placeholders. Numeric params are rendered with the language's digits;
 * string params are inserted verbatim (so product names and queries are never altered).
 */
export function interpolate(template: string, language: Language, params?: MessageParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    if (value === undefined) return match;
    return typeof value === "number" ? formatNumberFor(language, value) : value;
  });
}
