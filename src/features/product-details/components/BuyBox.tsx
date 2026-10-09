"use client";

import Link from "next/link";
import { Check, MessageCircle, Minus, Plus, Share2, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { commerceConfig } from "@/config/commerce";
import type { Product } from "@/domain/product/product-schema";
import { getProductVariants } from "@/domain/product/product-summary";
import { useCart, useCartPanel } from "@/features/cart/state/CartProvider";
import { PriceDisplay } from "@/features/product/components/PriceDisplay";
import { StockBadge } from "@/features/product/components/StockBadge";
import { useI18n } from "@/i18n/LanguageProvider";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";

type BuyBoxProps = {
  product: Product;
  selectedVariant: string;
  onVariantChange: (variant: string) => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onInquiry: () => void;
};

export function BuyBox({ product, selectedVariant, onVariantChange, quantity, onQuantityChange, onInquiry }: BuyBoxProps) {
  const { t, tCategory, formatNumber } = useI18n();
  const { addItem } = useCart();
  const { openCheckout } = useCartPanel();
  const { copy, isCopied } = useCopyToClipboard();
  const [cartAdded, setCartAdded] = useState(false);
  const addedTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (addedTimerRef.current !== null) window.clearTimeout(addedTimerRef.current);
    },
    []
  );

  const variants = getProductVariants(product);
  const isOutOfStock = product.stock === "Out of stock";
  const categoryHref = `/products?category=${encodeURIComponent(product.category)}`;
  const { nationwideDeliveryDays } = commerceConfig;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, selectedVariant, quantity);
    onQuantityChange(1);
    setCartAdded(true);
    if (addedTimerRef.current !== null) window.clearTimeout(addedTimerRef.current);
    addedTimerRef.current = window.setTimeout(() => setCartAdded(false), 1400);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(product, selectedVariant, quantity);
    onQuantityChange(1);
    openCheckout();
  };

  const shareProduct = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, text: product.short, url });
      } catch {
        // The user dismissed the share sheet.
      }
      return;
    }
    await copy(url, "share");
  };

  return (
    <aside className="details-panel panel">
      <div className="details-meta-top">
        <div className="details-category-pill">
          <Link href={categoryHref}>{tCategory(product.category)}</Link>
        </div>
        <StockBadge stock={product.stock} />
      </div>

      <h1 className="details-title">{product.title}</h1>

      <PriceDisplay product={product} showDiscount size="lg" />

      {variants.length > 0 ? (
        <div className="filter-section">
          <span className="filter-heading" id="variant-heading">
            {t("product.details.selectVariant")}
          </span>
          <div className="variant-row" role="group" aria-labelledby="variant-heading">
            {variants.map((variant) => {
              const isSelected = selectedVariant === variant;
              return (
                <button
                  key={variant}
                  className={`variant-chip ${isSelected ? "is-selected" : ""}`}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onVariantChange(variant)}
                >
                  <span>{variant}</span>
                  {isSelected ? <Check size={14} className="variant-check-icon" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="filter-section">
        <span className="filter-heading">{t("product.details.quantity")}</span>
        <div className="quantity-row">
          <button
            className="quantity-button"
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            aria-label={t("product.details.decreaseQuantity")}
          >
            <Minus size={16} aria-hidden="true" />
          </button>
          <span className="quantity-value" aria-live="polite">
            {formatNumber(quantity)}
          </span>
          <button
            className="quantity-button"
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            aria-label={t("product.details.increaseQuantity")}
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="details-main-actions">
        <button
          className={`button primary add-to-cart-btn-main ${cartAdded ? "is-added" : ""}`}
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {cartAdded ? (
            <>
              <Check size={18} aria-hidden="true" />
              <span>{t("product.details.addedToCart")}</span>
            </>
          ) : (
            <>
              <ShoppingCart size={18} aria-hidden="true" />
              <span>{t("product.details.addToCart")}</span>
            </>
          )}
        </button>

        <button className="button buy-now-btn-main" type="button" onClick={handleBuyNow} disabled={isOutOfStock}>
          <span>{t("product.details.orderNow")}</span>
        </button>
      </div>

      <div className="details-secondary-actions">
        <button className="button light details-inquiry-btn" type="button" onClick={onInquiry}>
          <MessageCircle size={16} aria-hidden="true" />
          <span>{t("product.details.messengerInquiry")}</span>
        </button>

        <button className="button light details-share-btn" type="button" onClick={() => void shareProduct()} title={t("product.details.shareTitle")}>
          <Share2 size={16} aria-hidden="true" />
          <span>{isCopied("share") ? t("product.details.linkCopied") : t("action.share")}</span>
        </button>
      </div>

      <div className="details-divider" aria-hidden="true" />

      <div className="trust-guarantee-list">
        <div className="trust-guarantee-item">
          <Truck size={20} className="trust-icon" aria-hidden="true" />
          <div>
            <strong>{t("product.details.codTitle")}</strong>
            <p>{t("product.details.codDesc", { min: nationwideDeliveryDays.min, max: nationwideDeliveryDays.max })}</p>
          </div>
        </div>
        <div className="trust-guarantee-item">
          <ShieldCheck size={20} className="trust-icon" aria-hidden="true" />
          <div>
            <strong>{t("product.details.authenticTitle")}</strong>
            <p>{t("product.details.authenticDesc")}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
