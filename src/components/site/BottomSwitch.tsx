"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  Home,
  Info,
  LayoutGrid,
  MessageCircle,
  RotateCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";

export function BottomSwitch() {
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const [reloading, setReloading] = useState(false);
  const [homeUIReady, setHomeUIReady] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  const onHome = pathname === "/";
  const onExplore = pathname === "/explore";
  const onHomeOrExplore = onHome || onExplore;
  const onProducts = pathname.startsWith("/products");
  const onContact = pathname.startsWith("/contact");
  const onAbout = pathname.startsWith("/about");
  const onTerms = pathname.startsWith("/terms");

  // Hide bottom dock when scrolling down into content on explore/home
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsScrolledDown(scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  if (pathname?.startsWith("/xadmin")) {
    return null;
  }

  // -------------------------------------------------------------
  // Slot 1 (Left) Configuration
  // -------------------------------------------------------------
  // Home: Products (LayoutGrid)
  // All other pages (Explore, Products, Contact, About, Terms): Home (Home)
  const renderSlot1 = () => {
    if (onHome) {
      return (
        <Link href="/products">
          <LayoutGrid size={16} aria-hidden="true" />
          <span>{t("nav_products")}</span>
        </Link>
      );
    }
    return (
      <Link href="/" onClick={handleHomeClick}>
        <Home size={16} aria-hidden="true" />
        <span>{t("nav_home")}</span>
      </Link>
    );
  };

  // -------------------------------------------------------------
  // Slot 2 (Center - Active Pill) Configuration
  // -------------------------------------------------------------
  const renderSlot2 = () => {
    if (onHome) {
      return (
        <Link href="/" onClick={handleHomeClick} aria-current="page">
          <Home size={16} aria-hidden="true" />
          <span>{t("nav_home")}</span>
        </Link>
      );
    }
    if (onExplore) {
      return (
        <Link href="/explore" aria-current="page">
          <Compass size={16} aria-hidden="true" />
          <span>{t("nav_explore")}</span>
        </Link>
      );
    }
    if (onProducts) {
      return (
        <Link href="/products" aria-current="page">
          <LayoutGrid size={16} aria-hidden="true" />
          <span>{t("nav_products")}</span>
        </Link>
      );
    }
    if (onContact) {
      return (
        <Link href="/contact" aria-current="page">
          <MessageCircle size={16} aria-hidden="true" />
          <span>{t("nav_contact")}</span>
        </Link>
      );
    }
    if (onAbout) {
      return (
        <Link href="/about" aria-current="page">
          <Info size={16} aria-hidden="true" />
          <span>{t("nav_about")}</span>
        </Link>
      );
    }
    if (onTerms) {
      return (
        <Link href="/terms" aria-current="page">
          <FileText size={16} aria-hidden="true" />
          <span>{language === "bn" ? "শর্তাবলী" : "Terms"}</span>
        </Link>
      );
    }
    // Default fallback
    return (
      <Link href="/products" aria-current="page">
        <LayoutGrid size={16} aria-hidden="true" />
        <span>{t("nav_products")}</span>
      </Link>
    );
  };

  // -------------------------------------------------------------
  // Slot 3 (Right) Configuration
  // -------------------------------------------------------------
  // Home: Reload button (RotateCw with spin)
  // Products: Contact link (MessageCircle)
  // All other pages (Explore, Contact, About, Terms): Products (LayoutGrid)
  const renderSlot3 = () => {
    if (onHome) {
      return (
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
      );
    }
    if (onProducts) {
      return (
        <Link href="/contact">
          <MessageCircle size={16} aria-hidden="true" />
          <span>{t("nav_contact")}</span>
        </Link>
      );
    }
    // Explore, Contact, About, Terms -> Products
    return (
      <Link href="/products">
        <LayoutGrid size={16} aria-hidden="true" />
        <span>{t("nav_products")}</span>
      </Link>
    );
  };

  return (
    <div
      className={`bottom-dock-container ${onHomeOrExplore ? "is-home-dock" : "is-subpage-dock"} ${
        onExplore && isScrolledDown ? "is-arrows-hidden" : ""
      }`}
      style={
        onHome
          ? {
              opacity: homeUIReady ? 1 : 0,
              pointerEvents: homeUIReady ? "auto" : "none",
              transition: homeUIReady ? "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
            }
          : undefined
      }
    >
      {/* Left Navigation Arrow on Explore Page (Hides on Scroll) */}
      {onExplore ? (
        <button
          type="button"
          className={`bottom-dock-arrow bottom-dock-arrow-prev ${isScrolledDown ? "is-scrolled-hidden" : ""}`}
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
        {renderSlot1()}
        {renderSlot2()}
        {renderSlot3()}
      </nav>

      {/* Right Navigation Arrow on Explore Page (Hides on Scroll) */}
      {onExplore ? (
        <button
          type="button"
          className={`bottom-dock-arrow bottom-dock-arrow-next ${isScrolledDown ? "is-scrolled-hidden" : ""}`}
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
