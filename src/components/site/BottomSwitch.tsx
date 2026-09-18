"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, MessageCircle, RotateCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";

export function BottomSwitch() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const onHome = pathname === "/";
  const onProducts = pathname.startsWith("/products");
  const onContact = pathname.startsWith("/contact");
  const [reloading, setReloading] = useState(false);
  const [homeUIReady, setHomeUIReady] = useState(false);

  // On the home page, hide until the fly-in animation completes
  useEffect(() => {
    if (!onHome) {
      setHomeUIReady(true);
      return;
    }
    setHomeUIReady(false);
    const handler = () => setHomeUIReady(true);
    window.addEventListener("xtream-utd:world-ui-ready", handler);
    return () => window.removeEventListener("xtream-utd:world-ui-ready", handler);
  }, [onHome]);

  const handleReload = useCallback(() => {
    setReloading(true);
    window.dispatchEvent(new CustomEvent("xtream-utd:world-reload"));
    window.setTimeout(() => setReloading(false), 500);
  }, []);

  const handleHomeClick = useCallback(() => {
    if (onHome) {
      window.dispatchEvent(new CustomEvent("xtream-utd:world-home"));
    }
  }, [onHome]);

  // When on Home, Home sits in the center slot (slot 2) and All Products is in slot 1.
  // When on Products, All Products sits in the center slot (slot 2) and Home is in slot 1.
  // When on other pages, Home is in slot 1 and All Products is in slot 2.
  const isCenterHome = onHome;

  return (
    <nav
      className={`bottom-switch ${onHome ? "is-home" : "is-subpage"}`}
      aria-label="Navigation"
      style={
        onHome
          ? {
              opacity: homeUIReady ? 1 : 0,
              pointerEvents: homeUIReady ? "auto" : "none",
              transition: homeUIReady ? "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)" : "none"
            }
          : {}
      }
    >
      {/* Slot 1 (Left) */}
      {isCenterHome ? (
        <Link href="/products" aria-current={onProducts ? "page" : undefined}>
          <LayoutGrid size={16} aria-hidden="true" />
          <span>{t("nav_products")}</span>
        </Link>
      ) : (
        <Link href="/" onClick={handleHomeClick} aria-current={onHome ? "page" : undefined}>
          <Home size={16} aria-hidden="true" />
          <span>{t("nav_home")}</span>
        </Link>
      )}

      {/* Slot 2 (Center - Active Primary Page) */}
      {isCenterHome ? (
        <Link href="/" onClick={handleHomeClick} aria-current={onHome ? "page" : undefined}>
          <Home size={16} aria-hidden="true" />
          <span>{t("nav_home")}</span>
        </Link>
      ) : (
        <Link href="/products" aria-current={onProducts ? "page" : undefined}>
          <LayoutGrid size={16} aria-hidden="true" />
          <span>{t("nav_products")}</span>
        </Link>
      )}

      {/* Slot 3 (Right - Fixed) */}
      {onHome ? (
        <button
          type="button"
          className="bottom-switch-reload"
          onClick={handleReload}
          aria-label="Reload products to see next set"
          title={t("nav_reload")}
        >
          <RotateCw size={15} className={reloading ? "is-spinning" : ""} aria-hidden="true" />
          <span>{t("nav_reload")}</span>
        </button>
      ) : (
        <Link href="/contact" aria-current={onContact ? "page" : undefined}>
          <MessageCircle size={16} aria-hidden="true" />
          <span>{t("nav_contact")}</span>
        </Link>
      )}
    </nav>
  );
}
