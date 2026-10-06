"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useStoredString } from "@/shared/lib/stored-value";
import { applyTheme, isTheme, type Theme, THEME_STORAGE_KEY } from "./theme";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useStoredString("local", THEME_STORAGE_KEY);
  const theme: Theme = isTheme(stored) ? stored : "dark";

  // Keep <html> in sync once a theme has been chosen (the inline bootstrap script handles the first paint).
  useEffect(() => {
    if (stored !== null) applyTheme(theme);
  }, [stored, theme]);

  const toggleTheme = useCallback(() => setStored(theme === "dark" ? "light" : "dark"), [setStored, theme]);
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return value;
}
