"use client";

import { formatPrice } from "@/domain/commerce/money";
import { calculateDiscountPercentage, calculateSavings, hasValidOldPrice } from "@/domain/product/pricing";
import type { Product } from "@/domain/product/product-schema";
import { useI18n } from "@/i18n/LanguageProvider";

type PriceDisplayProps = {
  product: Pick<Product, "price" | "old_price">;
  showDiscount?: boolean;
  size?: "sm" | "md" | "lg";
};

export function PriceDisplay({ product, showDiscount = false, size = "md" }: PriceDisplayProps) {
  const { t } = useI18n();
  const hasOld = hasValidOldPrice(product);
  const discount = calculateDiscountPercentage(product);
  const savings = calculateSavings(product);

  return (
    <div className={`price-row price-row-${size}`}>
      <span className="current-price">{formatPrice(product.price)}</span>
      {hasOld ? <span className="old-price">{formatPrice(product.old_price)}</span> : null}
      {showDiscount && discount > 0 ? (
        <span className="price-discount-pill">
          {`-${discount}%`}
          {size === "lg" && savings > 0 ? t("product.price.save", { amount: formatPrice(savings) }) : ""}
        </span>
      ) : null}
    </div>
  );
}
