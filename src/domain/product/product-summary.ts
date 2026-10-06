import type { Product } from "./product-schema";

/**
 * Compact, serializable view of a product for lists, cards, search, cart and the
 * showcase. Keeps client payloads independent of description/specification size.
 */
export type ProductSummary = Pick<
  Product,
  | "id"
  | "slug"
  | "title"
  | "category"
  | "price"
  | "old_price"
  | "stock"
  | "badge"
  | "accent"
  | "cover_image"
  | "main_image"
  | "featured"
  | "new_arrival"
  | "best_seller"
  | "sizes_or_variants"
  | "colours"
> & {
  /** Lower-cased text used for catalogue search. */
  search_text: string;
};

export function buildSearchText(product: Product): string {
  return [
    product.title,
    product.category,
    product.short,
    ...product.features,
    ...product.tags,
    ...Object.keys(product.specifications),
    ...Object.values(product.specifications)
  ]
    .join(" ")
    .toLowerCase();
}

export function toProductSummary(product: Product): ProductSummary {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    category: product.category,
    price: product.price,
    old_price: product.old_price,
    stock: product.stock,
    badge: product.badge,
    accent: product.accent,
    cover_image: product.cover_image,
    main_image: product.main_image,
    featured: product.featured,
    new_arrival: product.new_arrival,
    best_seller: product.best_seller,
    sizes_or_variants: product.sizes_or_variants,
    colours: product.colours,
    search_text: buildSearchText(product)
  };
}

export function getProductVariants(product: Pick<Product, "colours" | "sizes_or_variants">): string[] {
  return product.colours.length > 0 ? product.colours : product.sizes_or_variants;
}

export const DEFAULT_VARIANT = "Standard";

export function getDefaultVariant(product: Pick<Product, "colours" | "sizes_or_variants">): string {
  return getProductVariants(product)[0] ?? DEFAULT_VARIANT;
}
