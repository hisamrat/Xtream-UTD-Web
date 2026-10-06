"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/domain/commerce/money";
import { calculateDiscountPercentage, hasValidOldPrice } from "@/domain/product/pricing";
import type { ProductSummary } from "@/domain/product/product-summary";
import { useCart } from "@/features/cart/state/CartProvider";
import { useI18n } from "@/i18n/LanguageProvider";
import { ProductImage } from "./ProductImage";

type ProductCardProps = {
  product: ProductSummary;
  compact?: boolean;
  onClick?: () => void;
};

export function ProductCard({ product, compact = false, onClick }: ProductCardProps) {
  const { t, tCategory, tStock } = useI18n();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const addedTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (addedTimerRef.current !== null) window.clearTimeout(addedTimerRef.current);
    },
    []
  );

  const isOutOfStock = product.stock === "Out of stock";
  const discount = calculateDiscountPercentage(product);
  const quickHighlight = product.best_seller
    ? t("product.card.bestSeller")
    : product.new_arrival
      ? t("product.card.newArrival")
      : discount > 0
        ? t("product.card.percentOff", { discount: String(discount) })
        : product.badge.trim().toUpperCase();

  const className = ["product-card", compact ? "compact" : "", isOutOfStock ? "out-of-stock" : ""]
    .filter(Boolean)
    .join(" ");

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOutOfStock) return;
    addItem(product);
    setAdded(true);
    if (addedTimerRef.current !== null) window.clearTimeout(addedTimerRef.current);
    addedTimerRef.current = window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={className}
      data-flip-id={product.id}
      onClick={onClick}
      aria-label={t("product.card.ariaLabel", {
        title: product.title,
        category: tCategory(product.category),
        stock: tStock(product.stock)
      })}
    >
      <div className="product-media">
        <div className="product-media-header">
          {quickHighlight ? (
            <span className="card-top-badge badge-highlight" title={quickHighlight}>
              {quickHighlight}
            </span>
          ) : null}

          {isOutOfStock ? <span className="card-top-badge badge-stock-out">{t("product.card.soldOut")}</span> : null}
        </div>

        <div className="product-artwork-container">
          <ProductImage product={product} compact={compact} imageRole="cover" />
        </div>

        <div className="product-card-hover-actions">
          <button
            type="button"
            className={`card-hover-cart-btn ${added ? "is-added" : ""}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            title={added ? t("action.added") : t("action.addToCart")}
            aria-label={t("product.card.addToCartAria", { title: product.title })}
          >
            {added ? (
              <>
                <Check size={14} className="quick-cart-check" aria-hidden="true" />
                <span>{t("product.card.added")}</span>
              </>
            ) : isOutOfStock ? (
              <span>{t("product.card.soldOut")}</span>
            ) : (
              <>
                <Plus size={14} aria-hidden="true" />
                <span>{t("product.card.addToCart")}</span>
              </>
            )}
          </button>

          <span className="card-hover-details-btn" title={t("action.viewDetails")} aria-hidden="true">
            <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </div>
      </div>

      <div className="product-meta">
        <div className="product-meta-left">
          <h3 className="product-title" title={product.title}>
            {product.title}
          </h3>
          <span className="product-category">{tCategory(product.category)}</span>
        </div>
        <div className="product-meta-right">
          <div className="product-price-block">
            <span className="current-price">{formatPrice(product.price)}</span>
            {hasValidOldPrice(product) ? <span className="old-price">{formatPrice(product.old_price)}</span> : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
