"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp, Clock, ExternalLink, MapPin } from "lucide-react";
import { commerceConfig } from "@/config/commerce";
import { siteConfig } from "@/config/site";
import type { TranslationKey } from "@/i18n/dictionary";
import { useI18n } from "@/i18n/LanguageProvider";
import { useScrollThreshold } from "@/shared/hooks/useScrollThreshold";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "./SocialIcons";

const productLinks: { label: TranslationKey; href: string }[] = [
  { label: "nav.products", href: "/products" },
  { label: "shell.footer.topSelling", href: "/products?best=1" },
  { label: "shell.footer.bestSellers", href: "/products?best=1" },
  { label: "shell.footer.newProducts", href: "/products?new=1" }
];

const quickLinks: { label: TranslationKey; href: string }[] = [
  { label: "nav.contact", href: "/contact" },
  { label: "nav.about", href: "/about" },
  { label: "nav.terms", href: "/terms" },
  { label: "nav.preOrderTerms", href: "/terms#pre-order" }
];

const COPYRIGHT_YEAR = 2026;

export function Footer() {
  const pathname = usePathname();
  const { t, localize } = useI18n();
  const showBackToTop = useScrollThreshold(280);

  // The home page is a full-screen showcase without a footer.
  if (pathname === "/") {
    return null;
  }

  const socials = [
    { href: siteConfig.socials.facebook, className: "social-fb", label: t("shell.footer.facebookAria"), Icon: FacebookIcon },
    { href: siteConfig.socials.instagram, className: "social-ig", label: t("shell.footer.instagramAria"), Icon: InstagramIcon },
    { href: siteConfig.socials.youtube, className: "social-yt", label: t("shell.footer.youtubeAria"), Icon: YoutubeIcon }
  ];

  return (
    <footer className="site-footer">
      <div className="footer-top-line" aria-hidden="true" />

      <div className="footer-inner">
        <div className="footer-main-grid">
          <div className="footer-col footer-col-brand">
            <Link href="/" className="footer-logo">
              <span>XTREAM UTD</span>
            </Link>
            <p className="footer-bio">{t("shell.footer.bio", { districts: commerceConfig.districtsCovered })}</p>
            <div className="footer-socials" aria-label={t("shell.footer.socialsAria")}>
              {socials.map(({ href, className, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`footer-social-btn ${className}`}
                  aria-label={label}
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <FooterLinkColumn title={t("shell.footer.products")} links={productLinks} />
          <FooterLinkColumn title={t("shell.footer.explore")} links={quickLinks} />

          <div className="footer-col footer-col-contact">
            <h3 className="footer-col-title">{t("shell.footer.hub")}</h3>
            <div className="footer-hub-card">
              <div className="hub-item">
                <span className="hub-icon-badge" aria-hidden="true">
                  <MapPin size={15} />
                </span>
                <span className="hub-location">{localize(siteConfig.business.location)}</span>
              </div>
              <div className="hub-item">
                <span className="hub-icon-badge" aria-hidden="true">
                  <Clock size={15} />
                </span>
                <span className="hub-schedule">{localize(siteConfig.business.hours)}</span>
              </div>
              <div className="hub-item">
                <a href={siteConfig.business.facebookPageUrl} target="_blank" rel="noopener noreferrer" className="hub-fb-link">
                  <span className="hub-icon-badge" aria-hidden="true">
                    <FacebookIcon size={14} />
                  </span>
                  <span className="hub-fb-text">{siteConfig.business.facebookPageLabel}</span>
                  <ExternalLink size={12} className="hub-external-icon" aria-hidden="true" />
                </a>
              </div>
              <span className="hub-note">{t("shell.footer.codNote", { districts: commerceConfig.districtsCovered })}</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p className="footer-copyright">{t("shell.footer.copyright", { year: COPYRIGHT_YEAR })}</p>
        </div>
      </div>

      <button
        type="button"
        className={`back-to-top-overlay ${showBackToTop ? "is-visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={t("shell.footer.backToTop")}
        title={t("shell.footer.backToTop")}
      >
        <ArrowUp size={18} aria-hidden="true" />
      </button>
    </footer>
  );
}

function FooterLinkColumn({ title, links }: { title: string; links: { label: TranslationKey; href: string }[] }) {
  const { t } = useI18n();
  return (
    <div className="footer-col">
      <h3 className="footer-col-title">{title}</h3>
      <ul className="footer-nav-list">
        {links.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className="footer-nav-link">
              {t(item.label)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
