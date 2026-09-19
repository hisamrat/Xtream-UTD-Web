"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/product-schema";
import { useLanguage } from "@/components/site/LanguageProvider";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice, hasValidOldPrice } from "@/lib/format";
import { ProductArtwork } from "./ProductArtwork";

function getQuickHighlight(product: Product, language?: string): string {
  if (product.best_seller) {
    return language === "bn" ? "বেস্ট সেলার" : "BEST SELLER";
  }
  if (product.new_arrival) {
    return language === "bn" ? "নতুন কালেকশন" : "NEW ARRIVAL";
  }
  if (product.discount_percentage && product.discount_percentage > 0) {
    return language === "bn" ? `${product.discount_percentage}% ছাড়` : `${product.discount_percentage}% OFF`;
  }
  if (product.badge && product.badge.trim().length > 0) {
    return product.badge.trim().toUpperCase();
  }
  return "";
}

type ProductCardProps = {
  product: Product;
  compact?: boolean;
  selected?: boolean;
  onClick?: () => void;
};

export function ProductCard({ product, compact = false, selected = false, onClick }: ProductCardProps) {
  const { t, tCategory, language } = useLanguage();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock === "Out of stock";
  const hasOld = hasValidOldPrice(product);

  const quickHighlight = getQuickHighlight(product, language);

  const className = [
    "product-card",
    compact ? "compact" : "",
    selected ? "is-selected" : "",
    isOutOfStock ? "out-of-stock" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={className}
      data-flip-id={product.id}
      onClick={onClick}
      aria-label={`View details for ${product.title}, ${product.category}, ${product.stock}`}
    >
      {/* 1. Full Fit Image Container */}
      <div className="product-media">
        {/* Top Badges (Left: Quick Highlights, Right: Clean / Sold Out only) */}
        <div className="product-media-header">
          {quickHighlight ? (
            <span className="card-top-badge badge-highlight" title={quickHighlight}>
              {quickHighlight}
            </span>
          ) : null}

          {isOutOfStock ? (
            <span className="card-top-badge badge-stock-out">
              {language === "bn" ? "স্টক শেষ" : "SOLD OUT"}
            </span>
          ) : null}
        </div>

        {/* Full-bleed centered vector artwork */}
        <div className="product-artwork-container">
          <ProductArtwork product={product} compact={compact} />
        </div>

        {/* Hover Action Overlay: Bottom-Left "+ Add to Cart", Bottom-Right "View Details" icon */}
        <div className="product-card-hover-actions">
          <button
            type="button"
            className={`card-hover-cart-btn ${added ? "is-added" : ""}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            title={added ? t("added_to_cart") : t("add_to_cart")}
            aria-label={`${t("add_to_cart")} ${product.title}`}
          >
            {added ? (
              <>
                <Check size={14} className="quick-cart-check" aria-hidden="true" />
                <span>{language === "bn" ? "যোগ হয়েছে" : "ADDED"}</span>
              </>
            ) : isOutOfStock ? (
              <span>{language === "bn" ? "স্টক শেষ" : "SOLD OUT"}</span>
            ) : (
              <>
                <Plus size={14} aria-hidden="true" />
                <span>{language === "bn" ? "কার্টে যোগ করুন" : "ADD TO CART"}</span>
              </>
            )}
          </button>

          <span
            className="card-hover-details-btn"
            title={t("view_details")}
            aria-label={`View details for ${product.title}`}
          >
            <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </div>
      </div>

      {/* 2. Product Meta Info Below Image (Matching Reference Image 1) */}
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
            {hasOld ? <span className="old-price">{formatPrice(product.old_price)}</span> : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
