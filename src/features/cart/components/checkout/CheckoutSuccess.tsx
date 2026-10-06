"use client";

import { Check, CheckCircle2, Copy, Info, Send } from "lucide-react";
import { siteConfig } from "@/config/site";
import { buildMessengerUrl } from "@/domain/commerce/order-message";
import { useI18n } from "@/i18n/LanguageProvider";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";

export function CheckoutSuccess({ message }: { message: string }) {
  const { t } = useI18n();
  const { copy, isCopied } = useCopyToClipboard(2500);
  const copied = isCopied();

  return (
    <div className="checkout-success-state" role="status">
      <CheckCircle2 size={64} className="text-accent success-icon" aria-hidden="true" />
      <h3>{t("cart.checkout.successTitle")}</h3>
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
          className="button primary"
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
    </div>
  );
}
