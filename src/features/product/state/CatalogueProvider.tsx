"use client";

import { createContext, useContext } from "react";
import type { ProductSummary } from "@/domain/product/product-summary";

const CatalogueContext = createContext<ProductSummary[] | null>(null);

/**
 * Makes the catalogue summaries (sent once by the root layout) available to client
 * features that need to resolve products by slug: header search, cart, recently viewed.
 */
export function CatalogueProvider({ products, children }: { products: ProductSummary[]; children: React.ReactNode }) {
  return <CatalogueContext.Provider value={products}>{children}</CatalogueContext.Provider>;
}

export function useCatalogue(): ProductSummary[] {
  const products = useContext(CatalogueContext);
  if (!products) {
    throw new Error("useCatalogue must be used within a CatalogueProvider");
  }
  return products;
}
