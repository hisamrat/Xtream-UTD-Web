import rawProducts from "../../design-reference/data/sample_products.json";
import { calculateDiscountPercentage, hasValidOldPrice } from "./format";
import { type Product, productsSchema, type StockStatus } from "./product-schema";

export type SortKey =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "title"
  | "featured";

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

export type ProductValidationIssue = {
  productSlug: string;
  message: string;
};

const parsedProducts = productsSchema.parse(rawProducts);

const productIndex = new Map(parsedProducts.map((product, index) => [product.slug, index]));
const productMap = new Map(parsedProducts.map((product) => [product.slug, product]));

export const products: Product[] = parsedProducts;

export const stockStatuses: StockStatus[] = ["In stock", "Low stock", "Out of stock"];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return productMap.get(slug);
}

export function getCategories(): string[] {
  return Array.from(new Set(products.map((product) => product.category))).sort();
}

export function getPriceRange(source: Product[] = products): { min: number; max: number } {
  return source.reduce(
    (range, product) => ({
      min: Math.min(range.min, product.price),
      max: Math.max(range.max, product.price)
    }),
    { min: Number.POSITIVE_INFINITY, max: 0 }
  );
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const direct = product.related_products
    .map((slug) => getProductBySlug(slug))
    .filter((item): item is Product => Boolean(item))
    .slice(0, limit);

  if (direct.length >= limit) {
    return direct;
  }

  const seen = new Set([product.slug, ...direct.map((item) => item.slug)]);
  const fallback = products.filter((item) => item.category === product.category && !seen.has(item.slug));
  const broaderFallback = products.filter((item) => !seen.has(item.slug) && !fallback.includes(item));

  return [...direct, ...fallback, ...broaderFallback].slice(0, limit);
}

export function validateProductLinks(source: Product[] = products): ProductValidationIssue[] {
  const slugs = new Set(source.map((product) => product.slug));
  return source.flatMap((product) =>
    product.related_products
      .filter((slug) => !slugs.has(slug))
      .map((slug) => ({
        productSlug: product.slug,
        message: `Related product slug not found: ${slug}`
      }))
  );
}

export function normalizeSearch(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function productMatchesSearch(product: Product, query: string): boolean {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) {
    return true;
  }

  const searchText = [
    product.title,
    product.category,
    product.subcategory,
    product.short,
    ...product.features,
    ...product.tags,
    ...Object.keys(product.specifications),
    ...Object.values(product.specifications)
  ]
    .join(" ")
    .toLowerCase();

  return searchText.includes(normalizedQuery);
}

export function filterProducts(
  source: Product[],
  filters: CatalogueFilters = {}
): Product[] {
  const categorySet = new Set(filters.categories?.filter(Boolean) ?? []);
  const availabilitySet = new Set(filters.availability ?? []);

  const filtered = source.filter((product) => {
    if (filters.query && !productMatchesSearch(product, filters.query)) {
      return false;
    }

    if (categorySet.size > 0 && !categorySet.has(product.category)) {
      return false;
    }

    if (availabilitySet.size > 0 && !availabilitySet.has(product.stock)) {
      return false;
    }

    if (typeof filters.priceMin === "number" && product.price < filters.priceMin) {
      return false;
    }

    if (typeof filters.priceMax === "number" && product.price > filters.priceMax) {
      return false;
    }

    if (filters.newArrivals && !product.new_arrival) {
      return false;
    }

    if (filters.bestSellers && !product.best_seller) {
      return false;
    }

    if (filters.discounted && !hasValidOldPrice(product)) {
      return false;
    }

    return true;
  });

  return sortProducts(filtered, filters.sort ?? "newest");
}

export function sortProducts(source: Product[], sort: SortKey): Product[] {
  return [...source].sort((a, b) => {
    if (sort === "price-asc") {
      return a.price - b.price;
    }

    if (sort === "price-desc") {
      return b.price - a.price;
    }

    if (sort === "title") {
      return a.title.localeCompare(b.title);
    }

    if (sort === "featured") {
      return Number(b.featured) - Number(a.featured) || datasetOrder(a) - datasetOrder(b);
    }

    return datasetOrder(a) - datasetOrder(b);
  });
}

export function getSuggestedCategories(query: string, limit = 3): string[] {
  const matches = filterProducts(products, { query });
  return Array.from(new Set(matches.map((product) => product.category))).slice(0, limit);
}

export function isDiscounted(product: Product): boolean {
  return calculateDiscountPercentage(product) > 0;
}

function datasetOrder(product: Product): number {
  return productIndex.get(product.slug) ?? Number.MAX_SAFE_INTEGER;
}
