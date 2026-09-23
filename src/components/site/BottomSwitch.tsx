"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Compass, Home, LayoutGrid, MessageCircle, RotateCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";

export function BottomSwitch() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const onHome = pathname === "/";
  const onExplore = pathname === "/explore";
  const onHomeOrExplore = onHome || onExplore;
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

  const handlePrev = useCallback(() => {
    window.dispatchEvent(new CustomEvent("xtream-utd:explore-prev"));
  }, []);

  const handleNext = useCallback(() => {
    window.dispatchEvent(new CustomEvent("xtream-utd:explore-next"));
  }, []);

  const handleHomeClick = useCallback(() => {
    if (onHome) {
      window.dispatchEvent(new CustomEvent("xtream-utd:world-home"));
    }
  }, [onHome]);

  return (
    <div
      className={`bottom-dock-container ${onHomeOrExplore ? "is-home-dock" : "is-subpage-dock"}`}
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
      {/* Left Navigation Arrow on Explore Page */}
      {onExplore ? (
        <button
          type="button"
          className="bottom-dock-arrow bottom-dock-arrow-prev"
          onClick={handlePrev}
          aria-label="Previous product"
          title="Previous product"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
      ) : null}

      <nav
        className={`bottom-switch ${onHomeOrExplore ? "is-home" : "is-subpage"}`}
        aria-label="Navigation"
      >
        {/* Slot 1 (Left) */}
        {onExplore ? (
          <Link href="/products" aria-current={onProducts ? "page" : undefined}>
            <LayoutGrid size={16} aria-hidden="true" />
            <span>{t("nav_products")}</span>
          </Link>
        ) : onHome ? (
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

        {/* Slot 2 (Center) */}
        {onExplore ? (
          <Link href="/explore" aria-current="page">
            <Compass size={16} aria-hidden="true" />
            <span>{t("nav_explore")}</span>
          </Link>
        ) : onHome ? (
          <Link href="/" onClick={handleHomeClick} aria-current="page">
            <Home size={16} aria-hidden="true" />
            <span>{t("nav_home")}</span>
          </Link>
        ) : (
          <Link href="/products" aria-current={onProducts ? "page" : undefined}>
            <LayoutGrid size={16} aria-hidden="true" />
            <span>{t("nav_products")}</span>
          </Link>
        )}

        {/* Slot 3 (Right) */}
        {onExplore ? (
          <Link href="/" onClick={handleHomeClick}>
            <Home size={16} aria-hidden="true" />
            <span>{t("nav_home")}</span>
          </Link>
        ) : onHome ? (
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

      {/* Right Navigation Arrow on Explore Page */}
      {onExplore ? (
        <button
          type="button"
          className="bottom-dock-arrow bottom-dock-arrow-next"
          onClick={handleNext}
          aria-label="Next product"
          title="Next product"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
