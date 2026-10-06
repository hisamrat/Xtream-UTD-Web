"use client";

import { Check, CheckCircle2, Copy, Info, Send } from "lucide-react";
import { siteConfig } from "@/config/site";
import { buildMessengerUrl } from "@/domain/commerce/order-message";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/features/shell/components/SocialIcons";
import { useI18n } from "@/i18n/LanguageProvider";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";

export function CheckoutSuccess({ message }: { message: string }) {
  const { t } = useI18n();
  const { copy, isCopied } = useCopyToClipboard(2500);
  const copied = isCopied();

  const socials = [
    { href: siteConfig.socials.facebook, className: "checkout-social-fb", label: "Facebook", Icon: FacebookIcon },
    { href: siteConfig.socials.instagram, className: "checkout-social-ig", label: "Instagram", Icon: InstagramIcon },
    { href: siteConfig.socials.youtube, className: "checkout-social-yt", label: "YouTube", Icon: YoutubeIcon }
  ];

  return (
    <div className="checkout-success-state" role="status">
      <div className="checkout-success-icon-wrap">
        <CheckCircle2 size={62} className="checkout-success-icon" aria-hidden="true" />
      </div>
      <h3 className="checkout-success-title">{t("cart.checkout.successTitle")}</h3>
      <p className="checkout-success-desc">{t("cart.checkout.successDesc")}</p>
      <div className="checkout-success-note">
        <Info size={18} className="checkout-note-icon" aria-hidden="true" />
        <span>{t("cart.checkout.successNote")}</span>
      </div>
      <div className="checkout-success-actions">
        <a
          href={buildMessengerUrl(siteConfig.order.messengerUrl, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="button primary checkout-success-messenger-btn"
        >
          <Send size={16} aria-hidden="true" />
          <span>{t("cart.checkout.openMessengerAgain")}</span>
        </a>
        <button
          type="button"
          className={`button light checkout-success-copy-btn ${copied ? "is-copied" : ""}`}
          onClick={() => void copy(message)}
        >
          {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
          <span>{copied ? t("cart.checkout.successCopied") : t("cart.checkout.successCopy")}</span>
        </button>
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
