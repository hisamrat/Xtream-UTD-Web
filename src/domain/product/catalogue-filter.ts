import { hasValidOldPrice } from "./pricing";
import type { StockStatus } from "./product-schema";
import type { ProductSummary } from "./product-summary";

export const sortKeys = ["featured", "newest", "price-asc", "price-desc", "title"] as const;

export type SortKey = (typeof sortKeys)[number];

export const DEFAULT_SORT: SortKey = "newest";

export function isSortKey(value: unknown): value is SortKey {
  return typeof value === "string" && (sortKeys as readonly string[]).includes(value);
}

export type CatalogueFilters = {
  query?: string;
  categories?: string[];
  availability?: StockStatus[];
  priceMin?: number;
  priceMax?: number;
  newArrivals?: boolean;
  bestSellers?: boolean;
  discounted?: boolean;
  sort?: SortKey;
};

export type BooleanFilterKey = "newArrivals" | "bestSellers" | "discounted";

type Searchable = Pick<ProductSummary, "search_text">;

export function normalizeSearch(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function matchesSearch(item: Searchable, query: string): boolean {
  const normalizedQuery = normalizeSearch(query);
  return !normalizedQuery || item.search_text.includes(normalizedQuery);
}

/**
 * Filters and sorts catalogue items. "newest" keeps the order of `source`
 * (the order products appear in the data source).
 */
export function filterProducts<T extends ProductSummary>(source: readonly T[], filters: CatalogueFilters = {}): T[] {
  const categorySet = new Set(filters.categories?.filter(Boolean) ?? []);
  const availabilitySet = new Set(filters.availability ?? []);

  const filtered = source.filter((product) => {
    if (filters.query && !matchesSearch(product, filters.query)) return false;
    if (categorySet.size > 0 && !categorySet.has(product.category)) return false;
    if (availabilitySet.size > 0 && !availabilitySet.has(product.stock)) return false;
    if (typeof filters.priceMin === "number" && product.price < filters.priceMin) return false;
    if (typeof filters.priceMax === "number" && product.price > filters.priceMax) return false;
    if (filters.newArrivals && !product.new_arrival) return false;
    if (filters.bestSellers && !product.best_seller) return false;
    if (filters.discounted && !hasValidOldPrice(product)) return false;
    return true;
  });

  return sortProducts(filtered, filters.sort ?? DEFAULT_SORT, source);
}

export function sortProducts<T extends ProductSummary>(
  items: readonly T[],
  sort: SortKey,
  originalOrder: readonly T[] = items
): T[] {
  const position = new Map(originalOrder.map((product, index) => [product.slug, index]));
  const orderOf = (product: T) => position.get(product.slug) ?? Number.MAX_SAFE_INTEGER;

  return [...items].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "title":
        return a.title.localeCompare(b.title);
      case "featured":
        return Number(b.featured) - Number(a.featured) || orderOf(a) - orderOf(b);
      default:
        return orderOf(a) - orderOf(b);
    }
  });
}

export function getPriceRange(source: readonly Pick<ProductSummary, "price">[]): { min: number; max: number } {
  if (source.length === 0) {
    return { min: 0, max: 0 };
  }

  return source.reduce(
    (range, product) => ({
      min: Math.min(range.min, product.price),
      max: Math.max(range.max, product.price)
    }),
    { min: Number.POSITIVE_INFINITY, max: 0 }
  );
}

export function countActiveFilters(filters: CatalogueFilters): number {
  return (
    (filters.categories?.length ?? 0) +
    (filters.availability?.length ?? 0) +
    (filters.newArrivals ? 1 : 0) +
    (filters.bestSellers ? 1 : 0) +
    (filters.discounted ? 1 : 0) +
    (typeof filters.priceMin === "number" || typeof filters.priceMax === "number" ? 1 : 0)
  );
}
