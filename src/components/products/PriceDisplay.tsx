import { formatDiscount, formatPrice, hasValidOldPrice } from "@/lib/format";
import type { Product } from "@/lib/product-schema";

type PriceDisplayProps = {
  product: Product;
  showDiscount?: boolean;
  size?: "sm" | "md" | "lg";
};

export function PriceDisplay({ product, showDiscount = false, size = "md" }: PriceDisplayProps) {
  const hasOld = hasValidOldPrice(product);
  const discountText = formatDiscount(product);
  const savings = hasOld ? product.old_price - product.price : 0;

  return (
    <div className={`price-row price-row-${size}`}>
      <span className="current-price">{formatPrice(product.price)}</span>
      {hasOld ? (
        <span className="old-price">
          {size === "lg" ? "Was: " : ""}
          {formatPrice(product.old_price)}
        </span>
      ) : null}
      {showDiscount && hasOld && discountText ? (
        <span className="price-discount-pill">
          {discountText}
          {size === "lg" && savings > 0 ? ` (Save ${formatPrice(savings)})` : ""}
        </span>
      ) : null}
    </div>
  );
}
