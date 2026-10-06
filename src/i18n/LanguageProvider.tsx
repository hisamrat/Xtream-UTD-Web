"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import type { StockStatus } from "@/domain/product/product-schema";
import { formatNumberFor, interpolate, type MessageParams } from "@/shared/i18n/format";
import {
  DEFAULT_LANGUAGE,
  isLanguage,
  type Language,
  LANGUAGE_STORAGE_KEY,
  type LocalizedText
} from "@/shared/i18n/languages";
import { useStoredString } from "@/shared/lib/stored-value";
import { dictionaries, type TranslationKey } from "./dictionary";
import { categoryNamesBn } from "./messages/common";

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: MessageParams) => string;
  tCategory: (category: string) => string;
  tStock: (stock: StockStatus) => string;
  formatNumber: (value: string | number) => string;
  /** Picks the current language from a config/content string, filling `{placeholders}` like `t`. */
  localize: (text: LocalizedText, params?: MessageParams) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * UI language, persisted in localStorage. Server rendering and hydration use English;
 * a stored Bengali preference applies immediately after hydration.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useStoredString("local", LANGUAGE_STORAGE_KEY);
  const language: Language = isLanguage(stored) ? stored : DEFAULT_LANGUAGE;

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => setStored(next), [setStored]);
  const toggleLanguage = useCallback(() => setStored(language === "en" ? "bn" : "en"), [language, setStored]);

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = dictionaries[language];
    return {
      language,
      setLanguage,
      toggleLanguage,
      t: (key, params) => interpolate(dictionary[key], language, params),
      tCategory: (category) => (language === "bn" ? (categoryNamesBn[category] ?? category) : category),
      tStock: (stock) => dictionary[`stock.${stock}`],
      formatNumber: (input) => formatNumberFor(language, input),
      localize: (text, params) => interpolate(text[language], language, params)
    };
  }, [language, setLanguage, toggleLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within a LanguageProvider");
  }
  return context;
}
