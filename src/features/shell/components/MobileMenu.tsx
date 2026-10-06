"use client";

import Link from "next/link";
import { Home, Info, Languages, LayoutGrid, MessageCircle, Moon, Sun, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/LanguageProvider";
import { useDialog } from "@/shared/hooks/useDialog";
import { useTheme } from "@/shared/theme/ThemeProvider";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  onHomeClick: () => void;
};

export function MobileMenu({ open, onClose, onHomeClick }: MobileMenuProps) {
  const { language, toggleLanguage, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const dialogRef = useDialog({ open, onClose });

  if (!open) return null;

  const goHome = () => {
    onClose();
    onHomeClick();
  };

  return (
    <div ref={dialogRef} className="mobile-menu" role="dialog" aria-modal="true" aria-label={t("label.mobileMenu")}>
      <div className="mobile-menu-panel">
        <div className="mobile-menu-header">
          <Link href="/" className="wordmark" onClick={goHome}>
            <span>{siteConfig.name}</span>
          </Link>
          <button className="icon-button" type="button" onClick={onClose} aria-label={t("label.closeMenu")}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="quick-actions">
          <Link className="button" href="/" onClick={goHome}>
            <Home size={16} aria-hidden="true" />
            {t("nav.home")}
          </Link>
          <Link className="button" href="/products" onClick={onClose}>
            <LayoutGrid size={16} aria-hidden="true" />
            {t("nav.products")}
          </Link>
          <Link className="button" href="/about" onClick={onClose}>
            <Info size={16} aria-hidden="true" />
            {t("nav.about")}
          </Link>
          <Link className="button" href="/contact" onClick={onClose}>
            <MessageCircle size={16} aria-hidden="true" />
            {t("nav.contact")}
          </Link>
          <button className="button" type="button" onClick={toggleLanguage}>
            <Languages size={16} aria-hidden="true" />
            {language === "en" ? t("language.switchToBangla") : t("language.switchToEnglish")}
          </button>
          <button className="button" type="button" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            {theme === "dark" ? t("theme.switchToLight") : t("theme.switchToDark")}
          </button>
        </div>
      </div>
    </div>
  );
}
