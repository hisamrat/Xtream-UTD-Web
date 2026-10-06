"use client";

import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { type CatalogueFilters, DEFAULT_SORT, filterProducts } from "@/domain/product/catalogue-filter";
import type { StockStatus } from "@/domain/product/product-schema";
import type { ProductSummary } from "@/domain/product/product-summary";
import { serializeCatalogueQuery } from "../lib/catalogue-query";
import { getPageCount, PRODUCTS_PER_PAGE } from "../lib/pagination";

/**
 * Catalogue state: filters mirrored to the URL, deferred filtering, and pagination.
 */
export function useCatalogueFilters(products: ProductSummary[], initialFilters: CatalogueFilters) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<CatalogueFilters>(initialFilters);
  const [requestedPage, setRequestedPage] = useState(1);

  const deferredFilters = useDeferredValue(filters);
  const results = useMemo(() => filterProducts(products, deferredFilters), [deferredFilters, products]);

  const pageCount = getPageCount(results.length);
  const currentPage = Math.min(requestedPage, pageCount);
  const pageStart = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = useMemo(() => results.slice(pageStart, pageStart + PRODUCTS_PER_PAGE), [results, pageStart]);

  const updateFilters = (next: CatalogueFilters) => {
    setRequestedPage(1);
    setFilters(next);
    startTransition(() => {
      router.replace(`${pathname}${serializeCatalogueQuery(next)}`, { scroll: false });
    });
  };

  const setFilter = <Key extends keyof CatalogueFilters>(key: Key, value: CatalogueFilters[Key]) =>
    updateFilters({ ...filters, [key]: value });

  const toggleAvailability = (stock: StockStatus) => {
    const current = new Set(filters.availability ?? []);
    if (current.has(stock)) {
      current.delete(stock);
    } else {
      current.add(stock);
    }
    updateFilters({ ...filters, availability: Array.from(current) });
  };

  const clearFilters = () => updateFilters({ sort: DEFAULT_SORT });

  return {
    filters,
    results,
    visibleProducts,
    isUpdating: isPending || deferredFilters !== filters,
    pagination: {
      currentPage,
      pageCount,
      visibleStart: results.length ? pageStart + 1 : 0,
      visibleEnd: Math.min(pageStart + visibleProducts.length, results.length),
      goToPage: (page: number) => setRequestedPage(Math.min(pageCount, Math.max(1, page)))
    },
    updateFilters,
    setFilter,
    toggleAvailability,
    clearFilters
  };
}
