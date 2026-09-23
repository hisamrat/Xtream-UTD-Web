"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUp,
  Clock,
  ExternalLink,
  MapPin
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { isEditablePlaceholder } from "@/lib/order";
import { useLanguage } from "./LanguageProvider";

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function Footer() {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 280);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // The footer is rendered on every page EXCEPT the home page ("/")
  if (pathname === "/") {
    return null;
  }

  const productLinks = [
    { label: t("nav_products"), href: "/products" },
    { label: t("top_selling"), href: "/products?best=1" },
    { label: t("best_sellers"), href: "/products?best=1" },
    { label: t("new_products"), href: "/products?new=1" }
  ];

  const quickLinks = [
    { label: t("nav_contact"), href: "/contact" },
    { label: t("nav_about"), href: "/about" },
    { label: t("nav_terms"), href: "/terms" },
    {
      label: language === "bn" ? "প্রি-অর্ডার শর্তাবলী" : "Pre Order Terms & Conditions",
      href: "/terms#pre-order"
    }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="site-footer" role="contentinfo">
      {/* Top Ambient Glow Line */}
      <div className="footer-top-line" aria-hidden="true" />

      <div className="footer-inner">
        {/* Main 4-Column Footer Grid */}
        <div className="footer-main-grid">
          {/* Brand & Mission Column */}
          <div className="footer-col footer-col-brand">
            <Link href="/" className="footer-logo">
              <span>XTREAM UTD</span>
            </Link>
            <p className="footer-bio">
              {language === "bn"
                ? "ট্রেন্ডিং গ্যাজেট, ক্রিয়েটর টুলস, ডেস্ক সেটআপ এবং লাইফস্টাইল এক্সেসরিজ—ডেলিভারি সুবিধা সারা বাংলাদেশ জুড়ে।"
                : "Trending gadgets, creator tools, desk setups, and lifestyle accessories with delivery across all 64 districts in Bangladesh."}
            </p>
            <div className="footer-socials" aria-label="Social media channels">
              <a
                href={siteConfig.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn social-fb"
                aria-label="Visit Xtream UTD on Facebook"
              >
                <FacebookIcon size={17} />
              </a>
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn social-ig"
                aria-label="Visit Xtream UTD on Instagram"
              >
                <InstagramIcon size={17} />
              </a>
              <a
                href={siteConfig.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn social-yt"
                aria-label="Visit Xtream UTD on YouTube"
              >
                <YoutubeIcon size={17} />
              </a>
            </div>
          </div>

          {/* Products Column */}
          <div className="footer-col">
            <h3 className="footer-col-title">{t("products")}</h3>
            <ul className="footer-nav-list">
              {productLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="footer-nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore Column */}
          <div className="footer-col">
            <h3 className="footer-col-title">{t("explore")}</h3>
            <ul className="footer-nav-list">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="footer-nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Central Hub Column */}
          <div className="footer-col footer-col-contact">
            <h3 className="footer-col-title">{t("central_hub")}</h3>
            <div className="footer-hub-card">
              <div className="hub-item">
                <span className="hub-icon-badge" aria-hidden="true">
                  <MapPin size={15} />
                </span>
                <span className="hub-location">{siteConfig.business.location}</span>
              </div>
              <div className="hub-item">
                <span className="hub-icon-badge" aria-hidden="true">
                  <Clock size={15} />
                </span>
                <span className="hub-schedule">
                  {isEditablePlaceholder(siteConfig.business.hours)
                    ? (language === "bn" ? "প্রতিদিন: সকাল ৯:০০ – রাত ১০:০০ (BST)" : "Everyday: 9:00 AM – 10:00 PM (BST)")
                    : siteConfig.business.hours}
                </span>
              </div>
              <div className="hub-item">
                <a
                  href={siteConfig.business.facebookPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hub-fb-link"
                >
                  <span className="hub-icon-badge" aria-hidden="true">
                    <FacebookIcon size={14} />
                  </span>
                  <span className="hub-fb-text">facebook.com/xtreamutd</span>
                  <ExternalLink size={12} className="hub-external-icon" aria-hidden="true" />
                </a>
              </div>
              <span className="hub-note">
                {language === "bn" ? "সারাদেশে ৬৪ জেলায় ক্যাশ অন ডেলিভারি সুবিধা" : "Cash on Delivery Available Across All 64 Districts"}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Centered Copyright Text */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            {language === "bn"
              ? "© কপিরাইট ২০২৬ Xtream UTD সর্বস্বত্ব সংরক্ষিত।"
              : "© Copyright 2026 Xtream UTD All Rights are Reserved."}
          </p>
        </div>
      </div>

      {/* Floating Back to Top Icon Button Overlay */}
      <button
        type="button"
        className={`back-to-top-overlay ${showBackToTop ? "is-visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to top"
      >
        <ArrowUp size={18} aria-hidden="true" />
      </button>
    </footer>
  );
}
