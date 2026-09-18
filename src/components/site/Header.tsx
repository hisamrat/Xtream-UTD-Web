"use client";

import Link from "next/link";
import { Home, Info, LayoutGrid, Languages, Menu, MessageCircle, Moon, Search, ShoppingCart, Sun, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/product-schema";
import { siteConfig } from "@/config/site";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "./LanguageProvider";
import { useCart } from "@/components/cart/CartProvider";
import { SearchOverlay } from "./SearchOverlay";

type HeaderProps = {
  products: Product[];
};

export function Header({ products }: HeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { openCart, totalCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [homeUIReady, setHomeUIReady] = useState(false);
  const isHomePage = pathname === "/";

  const handleHomeClick = () => {
    if (isHomePage) {
      window.dispatchEvent(new CustomEvent("xtream-utd:world-home"));
    }
  };

  useEffect(() => {
    document.body.classList.toggle("modal-open", menuOpen || searchOpen);
    return () => document.body.classList.remove("modal-open");
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Reset homeUIReady each time we navigate to (or away from) the home page
  useEffect(() => {
    if (!isHomePage) {
      setHomeUIReady(true);
      return;
    }
    setHomeUIReady(false);
    const handler = () => setHomeUIReady(true);
    window.addEventListener("xtream-utd:world-ui-ready", handler);
    return () => window.removeEventListener("xtream-utd:world-ui-ready", handler);
  }, [isHomePage]);

  const langBadge = language === "en" ? "BN" : "EN";
  const headerStyle = isHomePage && !homeUIReady
    ? { opacity: 0, pointerEvents: "none" as const, transition: "none" }
    : isHomePage && homeUIReady
    ? { opacity: 1, pointerEvents: "auto" as const, transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }
    : {};

  return (
    <>
      <header className="site-header" style={headerStyle}>
        <div className="header-left">
          <Link href="/" className="wordmark" onClick={handleHomeClick} aria-label="Xtream UTD home">
            <span>{siteConfig.name}</span>
          </Link>
          <nav className="desktop-nav" aria-label="Main Navigation">
            <Link
              href="/"
              onClick={handleHomeClick}
              className={`desktop-nav-link ${pathname === "/" ? "is-active" : ""}`}
            >
              {t("nav_home")}
            </Link>
            <Link
              href="/products"
              className={`desktop-nav-link ${pathname === "/products" || pathname.startsWith("/products/") ? "is-active" : ""}`}
            >
              {t("nav_products")}
            </Link>
            <Link
              href="/contact"
              className={`desktop-nav-link ${pathname === "/contact" ? "is-active" : ""}`}
            >
              {t("nav_contact")}
            </Link>
          </nav>
        </div>

        <div className="header-actions">
            <button className="icon-button search-action" type="button" onClick={() => setSearchOpen(true)} aria-label={t("search_products")}>
              <Search size={18} aria-hidden="true" />
            </button>
            <button className="icon-button cart-action" type="button" onClick={openCart} aria-label="Shopping Cart">
              <ShoppingCart size={18} aria-hidden="true" />
              {totalCount > 0 ? <span className="cart-badge-dot">{totalCount}</span> : null}
            </button>
            <button className="icon-button language-toggle" type="button" onClick={toggleLanguage} aria-label={language === "en" ? t("switch_to_bangla") : t("switch_to_english")}>
              <Languages size={17} aria-hidden="true" />
              <span className="language-badge">{langBadge}</span>
            </button>
            <button className="icon-button theme-toggle" type="button" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>
            <button className="icon-button menu-toggle" type="button" onClick={() => setMenuOpen(true)} aria-label="Open Navigation Menu">
              <Menu size={19} aria-hidden="true" />
            </button>
          </div>
      </header>

      {menuOpen ? (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile menu">
          <div className="mobile-menu-panel">
            <div className="mobile-menu-header">
              <Link href="/" className="wordmark" onClick={() => { setMenuOpen(false); handleHomeClick(); }}>
                <span>{siteConfig.name}</span>
              </Link>
              <button className="icon-button" type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="quick-actions">
              <Link className="pill-button" href="/" onClick={() => { setMenuOpen(false); handleHomeClick(); }}>
                <Home size={16} aria-hidden="true" />
                {t("nav_home")}
              </Link>
              <Link className="pill-button" href="/products" onClick={() => setMenuOpen(false)}>
                <LayoutGrid size={16} aria-hidden="true" />
                {t("nav_products")}
              </Link>
              <button
                className="pill-button"
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setSearchOpen(true);
                }}
              >
                <Search size={16} aria-hidden="true" />
                {t("search_products")}
              </button>
              <button className="pill-button primary" type="button" onClick={() => { setMenuOpen(false); openCart(); }}>
                <ShoppingCart size={16} aria-hidden="true" />
                <span>{t("cart")}</span>
                {totalCount > 0 ? <span className="cart-count-badge-inline">{totalCount}</span> : null}
              </button>
              <Link className="pill-button" href="/about" onClick={() => setMenuOpen(false)}>
                <Info size={16} aria-hidden="true" />
                {t("nav_about")}
              </Link>
              <Link className="pill-button" href="/contact" onClick={() => setMenuOpen(false)}>
                <MessageCircle size={16} aria-hidden="true" />
                {t("nav_contact")}
              </Link>
              <button className="pill-button" type="button" onClick={toggleLanguage}>
                <Languages size={16} aria-hidden="true" />
                {language === "en" ? t("switch_to_bangla") : t("switch_to_english")}
              </button>
              <button className="pill-button" type="button" onClick={toggleTheme}>
                {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
                {theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <SearchOverlay products={products} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
