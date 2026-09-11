"use client";

import Link from "next/link";
import { ArrowUpRight, Check, ShoppingCart } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/product-schema";
import { useLanguage } from "@/components/site/LanguageProvider";
import { useCart } from "@/components/cart/CartProvider";
import { ProductArtwork } from "./ProductArtwork";
import { PriceDisplay } from "./PriceDisplay";
import { StockStatus } from "./StockStatus";

type ProductCardProps = {
  product: Product;
  compact?: boolean;
  selected?: boolean;
  onClick?: () => void;
};

export function ProductCard({ product, compact = false, selected = false, onClick }: ProductCardProps) {
  const { t, tCategory } = useLanguage();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock === "Out of stock";

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
      onClick={onClick}
      aria-label={`View details for ${product.title}, ${product.category}, ${product.stock}`}
    >
      <div className="product-media">
        <div className="product-media-header">
          <div className="product-media-badges">
            <StockStatus stock={product.stock} dotOnly />
            {product.badge ? <span className="badge badge-featured">{product.badge}</span> : null}
          </div>
        </div>

        <ProductArtwork product={product} compact={compact} />
      </div>

      <div className="product-meta">
        <div className="product-meta-header">
          <span className="product-category">{tCategory(product.category)}</span>
        </div>
        <h3 className="product-title">{product.title}</h3>
        <PriceDisplay product={product} showDiscount={!compact} />
      </div>

      <div className="product-card-footer">
        <button
          type="button"
          className={`card-quick-cart-btn ${added ? "is-added" : ""}`}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          title={added ? t("added_to_cart") : t("add_to_cart")}
          aria-label={`${t("add_to_cart")} ${product.title}`}
        >
          {added ? (
            <>
              <Check size={14} className="quick-cart-check" aria-hidden="true" />
              <span className="cart-btn-label">{t("added_to_cart")}</span>
            </>
          ) : (
            <>
              <ShoppingCart size={14} aria-hidden="true" />
              <span className="cart-btn-label">{t("add_to_cart")}</span>
            </>
          )}
        </button>

        <span className="view-details-action">
          <span>{t("view_details")}</span>
          <ArrowUpRight size={13} className="view-details-arrow" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
