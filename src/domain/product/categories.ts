import type { ProductSummary } from "./product-summary";

type Categorized = Pick<ProductSummary, "category">;

/** Categories present in the given products, alphabetically. */
export function getCategories(products: readonly Categorized[]): string[] {
  return Array.from(new Set(products.map((product) => product.category))).sort((a, b) => a.localeCompare(b));
}

export function countByCategory(products: readonly Categorized[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const product of products) {
    counts[product.category] = (counts[product.category] ?? 0) + 1;
  }
  return counts;
}
