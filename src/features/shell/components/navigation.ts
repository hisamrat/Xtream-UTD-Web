import type { TranslationKey } from "@/i18n/dictionary";

export type NavigationItem = { href: string; label: TranslationKey };

/** Links shown in the desktop header. */
export const primaryNavigation: NavigationItem[] = [
  { href: "/", label: "nav.home" },
  { href: "/products", label: "nav.products" },
  { href: "/contact", label: "nav.contact" }
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
