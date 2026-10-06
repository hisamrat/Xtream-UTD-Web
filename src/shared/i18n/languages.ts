export const languages = ["en", "bn"] as const;

export type Language = (typeof languages)[number];

export const DEFAULT_LANGUAGE: Language = "en";

export const LANGUAGE_STORAGE_KEY = "xtream-language";

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (languages as readonly string[]).includes(value);
}

/** A string available in every supported language (used by config and content files). */
export type LocalizedText = Record<Language, string>;
