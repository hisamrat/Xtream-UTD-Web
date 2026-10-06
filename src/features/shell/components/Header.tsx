"use client";

import Link from "next/link";
import { Languages, Menu, Moon, Search, ShoppingCart, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { useCart, useCartPanel } from "@/features/cart/state/CartProvider";
import { useCatalogue } from "@/features/product/state/CatalogueProvider";
import { SearchDialog } from "@/features/search/components/SearchDialog";
import { emitShowcase, useShowcaseReady } from "@/features/showcase/lib/showcase-events";
import { useI18n } from "@/i18n/LanguageProvider";
import { useScrollThreshold } from "@/shared/hooks/useScrollThreshold";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { MobileMenu } from "./MobileMenu";
import { isActivePath, primaryNavigation } from "./navigation";

export function Header() {
  const pathname = usePathname();
  const products = useCatalogue();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useI18n();
  const { totalCount } = useCart();
  const { openCart } = useCartPanel();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const isScrolled = useScrollThreshold(20);

  const isHomePage = pathname === "/";
  const isTransparentHeader = isHomePage || (pathname === "/explore" && !isScrolled);
  const homeUIReady = useShowcaseReady(isHomePage);

  // Close the mobile menu after navigating (state adjusted during render, not in an effect).
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setMenuOpen(false);
  }

  const handleHomeClick = () => {
    if (isHomePage) emitShowcase("world-home");
  };

  const headerStyle = isHomePage
    ? homeUIReady
      ? { opacity: 1, pointerEvents: "auto" as const, transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }
      : { opacity: 0, pointerEvents: "none" as const, transition: "none" }
    : undefined;

  return (
    <>
      <header
        className={`site-header ${isTransparentHeader ? "is-home-header is-transparent-nav" : "is-solid-header"}`}
        style={headerStyle}
      >
        <div className="header-inner">
          <div className="header-left">
            <Link href="/" className="wordmark" onClick={handleHomeClick} aria-label={t("label.homeAria")}>
              <span>{siteConfig.name}</span>
            </Link>
            <nav className="desktop-nav" aria-label={t("nav.main")}>
              {primaryNavigation.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={item.href === "/" ? handleHomeClick : undefined}
                    className={`desktop-nav-link ${active ? "is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {t(item.label)}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="header-actions">
            <button className="icon-button search-action" type="button" onClick={() => setSearchOpen(true)} aria-label={t("label.searchProducts")}>
              <Search size={18} aria-hidden="true" />
            </button>
            <button className="icon-button cart-action" type="button" onClick={openCart} aria-label={t("label.cart")}>
              <ShoppingCart size={18} aria-hidden="true" />
              {totalCount > 0 ? <span className="cart-badge-dot">{totalCount}</span> : null}
            </button>
            <button
              className="icon-button language-toggle"
              type="button"
              onClick={toggleLanguage}
              aria-label={language === "en" ? t("language.switchToBangla") : t("language.switchToEnglish")}
            >
              <Languages size={17} aria-hidden="true" />
              <span className="language-badge">{language === "en" ? "BN" : "EN"}</span>
            </button>
            <button className="icon-button theme-toggle" type="button" onClick={toggleTheme} aria-label={t("theme.toggle")}>
              {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>
            <button
              className="icon-button menu-toggle"
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("label.openMenu")}
              aria-expanded={menuOpen}
            >
              <Menu size={19} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onHomeClick={handleHomeClick} />
      <SearchDialog products={products} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
