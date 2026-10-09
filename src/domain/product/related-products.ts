import type { Product } from "./product-schema";

type RelatedSource = Pick<Product, "slug" | "category">;

/**
 * Explicit related products first, then same-category products, then anything else.
 * All candidates come from `all`, so only products that exist in the current data source are returned.
 */
export function getRelatedProducts<T extends RelatedSource>(
  product: Pick<Product, "slug" | "category" | "related_products">,
  all: readonly T[],
  limit = 3
): T[] {
  const bySlug = new Map(all.map((item) => [item.slug, item]));
  const direct = product.related_products
    .map((slug) => bySlug.get(slug))
    .filter((item): item is T => item !== undefined && item.slug !== product.slug)
    .slice(0, limit);

  if (direct.length >= limit) {
    return direct;
  }

  const seen = new Set([product.slug, ...direct.map((item) => item.slug)]);
  const sameCategory = all.filter((item) => item.category === product.category && !seen.has(item.slug));
  const sameCategorySlugs = new Set(sameCategory.map((item) => item.slug));
  const others = all.filter((item) => !seen.has(item.slug) && !sameCategorySlugs.has(item.slug));

  return [...direct, ...sameCategory, ...others].slice(0, limit);
}

export type ProductLinkIssue = {
  productSlug: string;
  message: string;
};

export function findBrokenRelatedLinks(products: readonly Pick<Product, "slug" | "related_products">[]): ProductLinkIssue[] {
  const slugs = new Set(products.map((product) => product.slug));
  return products.flatMap((product) =>
    product.related_products
      .filter((slug) => !slugs.has(slug))
      .map((slug) => ({ productSlug: product.slug, message: `Related product slug not found: ${slug}` }))
  );
}
