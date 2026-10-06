"use client";

import { CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/features/shell/components/SocialIcons";
import { useI18n } from "@/i18n/LanguageProvider";

export function CheckoutSuccess({ message: _message }: { message?: string } = {}) {
  const { t } = useI18n();

  const socials = [
    { href: siteConfig.socials.facebook, className: "checkout-social-fb", label: "Facebook", Icon: FacebookIcon },
    { href: siteConfig.socials.instagram, className: "checkout-social-ig", label: "Instagram", Icon: InstagramIcon },
    { href: siteConfig.socials.youtube, className: "checkout-social-yt", label: "YouTube", Icon: YoutubeIcon }
  ];

  return (
    <div className="checkout-success-state" role="status">
      <div className="checkout-success-icon-wrap">
        <CheckCircle2 size={68} className="checkout-success-icon" aria-hidden="true" />
      </div>
      <h3 className="checkout-success-title">{t("cart.checkout.successTitle")}</h3>
      <p className="checkout-success-desc">{t("cart.checkout.successDesc")}</p>
      <div className="checkout-success-note">
        <span className="checkout-success-note-text">{t("cart.checkout.successNote")}</span>
      </div>
      <div className="checkout-success-socials-wrapper">
        <span className="checkout-success-socials-label">{t("cart.checkout.followUs")}</span>
        <div className="checkout-success-socials-list" aria-label={t("cart.checkout.followUs")}>
          {socials.map(({ href, className, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`checkout-social-btn ${className}`}
              aria-label={label}
              title={label}
            >
              <Icon size={22} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
