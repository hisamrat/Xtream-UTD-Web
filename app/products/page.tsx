import type { Metadata } from "next";
import { CatalogueClient } from "@/components/catalogue/CatalogueClient";
import { getAllProducts, type CatalogueFilters, type SortKey, stockStatuses } from "@/lib/products";
import type { StockStatus } from "@/lib/product-schema";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse Xtream UTD products by category, price, availability, and features."
};

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);

  return (
    <main className="page-main products-page-main">
      <CatalogueClient products={getAllProducts()} initialFilters={filters} />
    </main>
  );
}

function parseFilters(params: Record<string, string | string[] | undefined>): CatalogueFilters {
  const sort = first(params.sort);
  const availability = splitParam(params.stock).filter(isStockStatus);

  return {
    query: first(params.q),
    categories: splitParam(params.category),
    availability,
    priceMin: numericParam(params.min),
    priceMax: numericParam(params.max),
    newArrivals: first(params.new) === "1",
    bestSellers: first(params.best) === "1",
    discounted: first(params.discount) === "1",
    sort: isSortKey(sort) ? sort : "newest"
  };
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function splitParam(value: string | string[] | undefined): string[] {
  const item = first(value);
  return item ? item.split(",").map((part) => part.trim()).filter(Boolean) : [];
}

function numericParam(value: string | string[] | undefined): number | undefined {
  const item = first(value);
  if (!item) {
    return undefined;
  }

  const numeric = Number(item);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function isStockStatus(value: string): value is StockStatus {
  return stockStatuses.includes(value as StockStatus);
}

function isSortKey(value: string | undefined): value is SortKey {
  return value === "newest" || value === "price-asc" || value === "price-desc" || value === "title" || value === "featured";
}
