import { type CatalogueFilters, DEFAULT_SORT, isSortKey } from "@/domain/product/catalogue-filter";
import { type StockStatus, stockStatuses } from "@/domain/product/product-schema";

/**
 * The `/products` URL contract. Query parameters:
 * q, category (comma list), stock (comma list), min, max, new=1, best=1, discount=1, sort.
 */
export type SearchParamsRecord = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function splitList(value: string | string[] | undefined): string[] {
  const item = first(value);
  return item
    ? item
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
    : [];
}

function parseNumber(value: string | string[] | undefined): number | undefined {
  const item = first(value);
  if (!item) return undefined;
  const numeric = Number(item);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function isStockStatus(value: string): value is StockStatus {
  return (stockStatuses as readonly string[]).includes(value);
}

export function parseCatalogueQuery(params: SearchParamsRecord): CatalogueFilters {
  const sort = first(params.sort);
  return {
    query: first(params.q),
    categories: splitList(params.category),
    availability: splitList(params.stock).filter(isStockStatus),
    priceMin: parseNumber(params.min),
    priceMax: parseNumber(params.max),
    newArrivals: first(params.new) === "1",
    bestSellers: first(params.best) === "1",
    discounted: first(params.discount) === "1",
    sort: isSortKey(sort) ? sort : DEFAULT_SORT
  };
}

export function serializeCatalogueQuery(filters: CatalogueFilters): string {
  const params = new URLSearchParams();

  if (filters.query) params.set("q", filters.query);
  if (filters.categories?.length) params.set("category", filters.categories.join(","));
  if (filters.availability?.length) params.set("stock", filters.availability.join(","));
  if (typeof filters.priceMin === "number") params.set("min", String(filters.priceMin));
  if (typeof filters.priceMax === "number") params.set("max", String(filters.priceMax));
  if (filters.newArrivals) params.set("new", "1");
  if (filters.bestSellers) params.set("best", "1");
  if (filters.discounted) params.set("discount", "1");
  if (filters.sort && filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort);

  const query = params.toString();
  return query ? `?${query}` : "";
}
