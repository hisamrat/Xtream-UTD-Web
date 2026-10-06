import type { Product } from "./product-schema";

type Priced = Pick<Product, "price" | "old_price">;

export function hasValidOldPrice(product: Priced): boolean {
  return product.old_price > product.price;
}

export function calculateDiscountPercentage(product: Priced): number {
  if (!hasValidOldPrice(product)) {
    return 0;
  }

  return Math.round(((product.old_price - product.price) / product.old_price) * 100);
}

export function calculateSavings(product: Priced): number {
  return hasValidOldPrice(product) ? product.old_price - product.price : 0;
}
