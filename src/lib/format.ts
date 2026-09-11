import type { Product } from "./product-schema";

export function formatPrice(value: number): string {
  return `৳${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(value)}`;
}

export function hasValidOldPrice(product: Pick<Product, "old_price" | "price">): boolean {
  return product.old_price > product.price;
}

export function calculateDiscountPercentage(
  product: Pick<Product, "old_price" | "price" | "discount_percentage">
): number {
  if (!hasValidOldPrice(product)) {
    return 0;
  }

  return Math.round(((product.old_price - product.price) / product.old_price) * 100);
}

export function formatDiscount(product: Pick<Product, "old_price" | "price" | "discount_percentage">): string {
  const discount = calculateDiscountPercentage(product);
  return discount > 0 ? `-${discount}%` : "";
}
