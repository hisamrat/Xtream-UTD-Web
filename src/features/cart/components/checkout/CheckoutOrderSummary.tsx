"use client";

import { Check, CheckCircle2, Copy, Minus, Plus, Send, ShieldCheck, Trash2 } from "lucide-react";
import { commerceConfig, type DeliveryZoneId } from "@/config/commerce";
import { formatPrice } from "@/domain/commerce/money";
import { ProductImage } from "@/features/product/components/ProductImage";
import { useI18n } from "@/i18n/LanguageProvider";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import { useCart } from "../../state/CartProvider";

type CheckoutOrderSummaryProps = {
  deliveryZone: DeliveryZoneId;
  deliveryFee: number;
  subtotal: number;
  orderMessage: string;
  onSelectAction?: (action: "confirm" | "messenger") => void;
};

export function CheckoutOrderSummary({
  deliveryZone,
  deliveryFee,
  subtotal,
  orderMessage,
  onSelectAction
}: CheckoutOrderSummaryProps) {
  const { items, totalCount, removeItem, updateQuantity } = useCart();
  const { t, formatNumber } = useI18n();
  const { copy, isCopied } = useCopyToClipboard(2500);
  const copied = isCopied();
  const { nationwideDeliveryDays } = commerceConfig;

  return (
    <div className="checkout-summary-column">
      <h3 className="checkout-section-title">
        <span>{t("cart.checkout.summaryTitle", { count: totalCount })}</span>
      </h3>

      <div className="checkout-items-list">
        {items.map((item) => (
          <div className="checkout-item-card" key={`${item.product.slug}-${item.variant}`}>
            <div className="checkout-item-art">
              <ProductImage product={item.product} compact />
            </div>
            <div className="checkout-item-details">
              <div className="checkout-item-top">
                <h4 className="checkout-item-title">{item.product.title}</h4>
                <button
                  type="button"
                  className="checkout-item-remove-btn"
                  onClick={() => removeItem(item.product.slug, item.variant)}
                  aria-label={t("cart.checkout.removeAria", { title: item.product.title })}
                  title={t("cart.checkout.remove")}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>

              <div className="checkout-item-meta">
                <span className="checkout-item-variant">{item.variant}</span>
                <span className="checkout-item-unit-price">
                  {formatPrice(item.product.price)}
                  <span className="checkout-unit-label">{t("cart.checkout.perItem")}</span>
                </span>
              </div>

              <div className="checkout-item-bottom">
                <div className="quantity-stepper-mini" role="group" aria-label={t("cart.quantity.group")}>
                  <button
                    type="button"
                    className="quantity-btn-mini"
                    onClick={() => updateQuantity(item.product.slug, item.variant, item.quantity - 1)}
                    aria-label={t("cart.quantity.decrease")}
                  >
                    <Minus size={11} aria-hidden="true" />
                  </button>
                  <span className="quantity-val-mini">{formatNumber(item.quantity)}</span>
                  <button
                    type="button"
                    className="quantity-btn-mini"
                    onClick={() => updateQuantity(item.product.slug, item.variant, item.quantity + 1)}
                    aria-label={t("cart.quantity.increase")}
                  >
                    <Plus size={11} aria-hidden="true" />
                  </button>
                </div>

                <div className="checkout-item-total-block">
                  <span className="checkout-item-total-label">{t("cart.checkout.lineTotal")}</span>
                  <strong className="checkout-item-total-val">{formatPrice(item.product.price * item.quantity)}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="checkout-financial-card">
        <div className="financial-row">
          <span>{t("cart.checkout.subtotal")}</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
        <div className="financial-row">
          <span>{t("cart.checkout.deliveryFee", { zone: t(`cart.checkout.zoneName.${deliveryZone}`) })}</span>
          <strong>{formatPrice(deliveryFee)}</strong>
        </div>
        <div className="financial-divider" />
        <div className="financial-row grand-total-row">
          <span>{t("cart.checkout.grandTotal")}</span>
          <strong className="grand-total-val">{formatPrice(subtotal + deliveryFee)}</strong>
        </div>
      </div>

      <div className="checkout-highlight-card" role="region" aria-label={t("cart.checkout.infoAria")}>
        <div className="checkout-highlight-header">
          <ShieldCheck size={16} className="highlight-header-icon" aria-hidden="true" />
          <strong>{t("cart.checkout.infoTitle")}</strong>
        </div>
        <ul className="checkout-highlight-list">
          <li className="checkout-highlight-item">
            <CheckCircle2 size={14} className="highlight-bullet-icon" aria-hidden="true" />
            <span>{t("cart.checkout.infoDelivery", { min: nationwideDeliveryDays.min, max: nationwideDeliveryDays.max })}</span>
          </li>
          <li className="checkout-highlight-item">
            <CheckCircle2 size={14} className="highlight-bullet-icon" aria-hidden="true" />
            <span>{t("cart.checkout.infoAuthentic")}</span>
          </li>
          <li className="checkout-highlight-item highlight-confirmation-item">
            <CheckCircle2 size={14} className="highlight-bullet-icon highlight-accent-icon" aria-hidden="true" />
            <span>{t("cart.checkout.infoConfirmation")}</span>
          </li>
        </ul>
      </div>

      <div className="checkout-action-stack">
        <button
          type="submit"
          name="submitAction"
          value="confirm"
          className="button primary checkout-submit-btn"
          disabled={items.length === 0}
          onClick={() => onSelectAction?.("confirm")}
        >
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{t("cart.checkout.submit")}</span>
        </button>
        <div className="checkout-action-row">
          <button
            type="submit"
            name="submitAction"
            value="messenger"
            className="button light checkout-messenger-btn"
            disabled={items.length === 0}
            onClick={() => onSelectAction?.("messenger")}
          >
            <Send size={15} aria-hidden="true" />
            <span>{t("cart.checkout.orderOnMessenger")}</span>
          </button>
          <button
            type="button"
            className={`button light checkout-copy-btn ${copied ? "is-copied" : ""}`}
            onClick={() => void copy(orderMessage)}
            disabled={items.length === 0}
            aria-label={t("cart.checkout.copyAria")}
            title={t("cart.checkout.copy")}
          >
            {copied ? <Check size={15} aria-hidden="true" className="copy-icon-success" /> : <Copy size={15} aria-hidden="true" />}
            <span>{copied ? t("cart.checkout.copied") : t("cart.checkout.copy")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
