import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { GalleryShowcaseItem } from "@/domain/gallery/gallery-schema";
import type { Product } from "@/domain/product/product-schema";
import { type ProductSummary, toProductSummary } from "@/domain/product/product-summary";
import { CATALOG_REVALIDATE_SECONDS, getSheetsConfig } from "@/server/env";
import { createSheetsReader, pickGalleryTab, pickProductsTab } from "./sources/google-sheets/client";
import { parseGallerySheet } from "./sources/google-sheets/parse-gallery";
import { parseProductsSheet } from "./sources/google-sheets/parse-products";
import { loadLocalProducts } from "./sources/local-json";

/** Cache tag for all catalogue data; invalidated by POST /api/revalidate. */
export const CATALOG_CACHE_TAG = "catalog";

export type CatalogSource = "google-sheets" | "bundled-json";

export type Catalog = {
  products: Product[];
  source: CatalogSource;
};

async function fetchCatalogFromSheets(): Promise<Catalog | null> {
  const config = getSheetsConfig();
  if (!config) {
    return null;
  }

  try {
    const reader = createSheetsReader(config);
    const tab = pickProductsTab(await reader.listTabs(), config.productsTab);
    if (!tab) {
      throw new Error("The spreadsheet has no tabs.");
    }

    const { products, issues } = parseProductsSheet(await reader.readTab(tab));
    if (issues.length > 0) {
      console.warn(`[catalog] ${issues.length} product row(s) in "${tab}" were skipped:`, issues.slice(0, 10));
    }
    if (products.length === 0) {
      throw new Error(`No valid products found in "${tab}".`);
    }

    return { products, source: "google-sheets" };
  } catch (error) {
    console.error("[catalog] Google Sheets unavailable, using the bundled catalogue instead:", error);
    return null;
  }
}

const getCachedCatalog = unstable_cache(
  async (): Promise<Catalog> =>
    (await fetchCatalogFromSheets()) ?? { products: loadLocalProducts(), source: "bundled-json" },
  ["catalog-products"],
  { tags: [CATALOG_CACHE_TAG], revalidate: CATALOG_REVALIDATE_SECONDS }
);

const getCachedGallery = unstable_cache(
  async (): Promise<GalleryShowcaseItem[]> => {
    const config = getSheetsConfig();
    if (!config) {
      return [];
    }

    try {
      const reader = createSheetsReader(config);
      const tab = pickGalleryTab(await reader.listTabs(), config.galleryTab);
      return tab ? parseGallerySheet(await reader.readTab(tab)) : [];
    } catch (error) {
      console.error("[catalog] Could not load the showcase gallery from Google Sheets:", error);
      return [];
    }
  },
  ["catalog-gallery"],
  { tags: [CATALOG_CACHE_TAG], revalidate: CATALOG_REVALIDATE_SECONDS }
);

/** The whole catalogue, deduplicated per request and cached across requests. */
export const getCatalog = cache(getCachedCatalog);

export async function getProducts(): Promise<Product[]> {
  return (await getCatalog()).products;
}

export const getProductSummaries = cache(async (): Promise<ProductSummary[]> => {
  return (await getProducts()).map(toProductSummary);
});

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((product) => product.slug === slug);
}

export const getGalleryItems = cache(getCachedGallery);
