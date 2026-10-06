export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "xtream-theme";

export function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light";
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

/**
 * Inline script run before hydration so the stored theme is applied without a flash.
 * Keep in sync with `applyTheme`.
 */
export const themeBootstrapScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')==='light'?'light':'dark';var r=document.documentElement;r.dataset.theme=t;r.classList.remove('light','dark');r.classList.add(t);r.style.colorScheme=t;if('scrollRestoration' in history){history.scrollRestoration='manual';}}catch(e){}})();`;
