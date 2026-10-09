"use client";

import Link from "next/link";
import { Check, MessageCircle, Minus, Plus, Share2, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { commerceConfig } from "@/config/commerce";
import { formatPrice } from "@/domain/commerce/money";
import type { Product } from "@/domain/product/product-schema";
import { getProductVariants } from "@/domain/product/product-summary";
import { useCart, useCartPanel } from "@/features/cart/state/CartProvider";
import { PriceDisplay } from "@/features/product/components/PriceDisplay";
import { StockBadge } from "@/features/product/components/StockBadge";
import { useI18n } from "@/i18n/LanguageProvider";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import type { InquiryLine } from "./InquiryDialog";

type BuyBoxProps = {
  product: Product;
  onInquiry: (lines: InquiryLine[]) => void;
};

export function BuyBox({ product, onInquiry }: BuyBoxProps) {
  const { t, tCategory, formatNumber } = useI18n();
  const { addItem, addItems } = useCart();
  const { openCheckout } = useCartPanel();
  const { copy, isCopied } = useCopyToClipboard();
  const [cartAdded, setCartAdded] = useState(false);
  const addedTimerRef = useRef<number | null>(null);

  const variants = getProductVariants(product);
  const hasVariants = variants.length > 0;

  // Multi-variant quantities map: { [variantName]: quantity }
  // Default: no variant selected ({}), default quantity is 0
  const [variantQuantities, setVariantQuantities] = useState<Record<string, number>>(() => {
    if (hasVariants) {
      const initialMap: Record<string, number> = {};
      return initialMap;
    }
    return { "": 1 };
  });

  // Currently focused variant for the quantity stepper (default: none / "")
  const [activeVariant, setActiveVariant] = useState<string>("");

  useEffect(
    () => () => {
      if (addedTimerRef.current !== null) window.clearTimeout(addedTimerRef.current);
    },
    []
  );

  const isOutOfStock = product.stock === "Out of stock";
  const categoryHref = `/products?category=${encodeURIComponent(product.category)}`;
  const { nationwideDeliveryDays } = commerceConfig;

  // Selected entries with quantity > 0
  const selectedEntries: [string, number][] = hasVariants
    ? Object.entries(variantQuantities).filter(([, qty]) => qty > 0)
    : [["", variantQuantities[""] ?? 1]];

  const totalSelectedCount = selectedEntries.reduce((sum, [, qty]) => sum + qty, 0);
  const currentStepperQty = hasVariants ? (activeVariant ? (variantQuantities[activeVariant] ?? 0) : 0) : (variantQuantities[""] ?? 1);
  const isNoQuantity = hasVariants && totalSelectedCount <= 0;
  const isActionsDisabled = isOutOfStock || isNoQuantity;

  const handleVariantClick = (variant: string) => {
    setActiveVariant(variant);
  };

  const handleIncrease = () => {
    if (hasVariants) {
      const targetVariant = activeVariant || (variants[0] ?? "");
      if (!targetVariant) return;
      if (!activeVariant) setActiveVariant(targetVariant);
      setVariantQuantities((prev) => {
        const currentQty = prev[targetVariant] ?? 0;
        return {
          ...prev,
          [targetVariant]: currentQty + 1
        };
      });
    } else {
      setVariantQuantities((prev) => {
        const currentQty = prev[""] ?? 1;
        return { "": currentQty + 1 };
      });
    }
  };

  const handleDecrease = () => {
    if (hasVariants) {
      if (!activeVariant) return;
      setVariantQuantities((prev) => {
        const currentQty = prev[activeVariant] ?? 0;
        return {
          ...prev,
          [activeVariant]: Math.max(0, currentQty - 1)
        };
      });
    } else {
      setVariantQuantities((prev) => {
        const currentQty = prev[""] ?? 1;
        return { "": Math.max(1, currentQty - 1) };
      });
    }
  };

  const resetSelection = () => {
    if (hasVariants) {
      setVariantQuantities({});
      setActiveVariant("");
    } else {
      setVariantQuantities({ "": 1 });
    }
  };

  const handleAddToCart = () => {
    if (isActionsDisabled) return;
    if (hasVariants) {
      const itemsToAdd = selectedEntries.map(([v, qty]) => ({
        product,
        variant: v,
        quantity: qty
      }));
      addItems(itemsToAdd);
    } else {
      addItem(product, "", currentStepperQty);
    }
    resetSelection();
    setCartAdded(true);
    if (addedTimerRef.current !== null) window.clearTimeout(addedTimerRef.current);
    addedTimerRef.current = window.setTimeout(() => setCartAdded(false), 1400);
  };

  const handleBuyNow = () => {
    if (isActionsDisabled) return;
    if (hasVariants) {
      const itemsToAdd = selectedEntries.map(([v, qty]) => ({
        product,
        variant: v,
        quantity: qty
      }));
      addItems(itemsToAdd);
    } else {
      addItem(product, "", currentStepperQty);
    }
    resetSelection();
    openCheckout();
  };

  const handleInquiryClick = () => {
    const lines: InquiryLine[] =
      selectedEntries.length > 0
        ? selectedEntries.map(([v, qty]) => ({
            variant: v,
            quantity: qty
          }))
        : [{ variant: "", quantity: 1 }];
    onInquiry(lines);
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

      {hasVariants ? (
        <div className="filter-section">
          <div className="filter-heading-row">
            <span className="filter-heading" id="variant-heading">
              {t("product.details.selectVariant")}
            </span>
          </div>
          <div className="variant-row" role="group" aria-labelledby="variant-heading">
            {variants.map((variant) => {
              const qty = variantQuantities[variant] ?? 0;
              const isSelected = qty > 0;
              const isActive = activeVariant === variant;
              return (
                <button
                  key={variant}
                  className={`variant-chip ${isSelected ? "is-selected" : ""} ${isActive ? "is-active" : ""}`}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleVariantClick(variant)}
                >
                  <span className="variant-chip-label">{variant}</span>
                  {qty > 0 ? <span className="variant-qty-badge">×{formatNumber(qty)}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="filter-section">
        <div className="filter-heading-row">
          <span className="filter-heading">{t("product.details.quantity")}</span>
        </div>
        <div className="quantity-row">
          <button
            className="quantity-button"
            type="button"
            onClick={handleDecrease}
            aria-label={t("product.details.decreaseQuantity")}
          >
            <Minus size={16} aria-hidden="true" />
          </button>
          <span className="quantity-value" aria-live="polite">
            {formatNumber(currentStepperQty)}
          </span>
          <button
            className="quantity-button"
            type="button"
            onClick={handleIncrease}
            aria-label={t("product.details.increaseQuantity")}
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {totalSelectedCount > 0 ? (
        <div className="selected-total-row">
          <span className="selected-total-amount">
            {t("product.details.totalAmount", { amount: formatPrice(totalSelectedCount * product.price) })}
          </span>
        </div>
      ) : null}

      <div className="details-main-actions">
        <button
          className={`button primary add-to-cart-btn-main ${cartAdded ? "is-added" : ""}`}
          type="button"
          onClick={handleAddToCart}
          disabled={isActionsDisabled}
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

        <button className="button buy-now-btn-main" type="button" onClick={handleBuyNow} disabled={isActionsDisabled}>
          <span>{t("product.details.orderNow")}</span>
        </button>
      </div>

      <div className="details-secondary-actions">
        <button className="button light details-inquiry-btn" type="button" onClick={handleInquiryClick}>
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
