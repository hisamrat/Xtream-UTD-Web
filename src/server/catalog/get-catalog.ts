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

const DEFAULT_CATALOG_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbwgZnY_0Zi_Uxmo1lajhO-Mxz73GWoJuFAvkrpMrPDq4X4omof6741TAGB8YEhASKC3Ag/exec";

type WebhookCatalogResponse = {
  success?: boolean;
  productsRows?: unknown[][];
  galleryRows?: unknown[][];
  products?: unknown[];
  gallery?: unknown[];
};

function normalize2dRows(raw: unknown[][]): string[][] {
  return raw.map((row) =>
    Array.isArray(row)
      ? row.map((cell) => (cell === null || cell === undefined ? "" : String(cell)))
      : []
  );
}

async function fetchFromWebhook(): Promise<{ products: Product[]; gallery: GalleryShowcaseItem[] } | null> {
  const url =
    process.env.CATALOG_WEBHOOK_URL?.trim() ||
    process.env.ORDER_SHEET_WEBHOOK_URL?.trim() ||
    DEFAULT_CATALOG_WEBHOOK_URL;
  if (!url) return null;

  try {
    const res = await fetch(url, { redirect: "follow", cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as WebhookCatalogResponse;
    if (!data || data.success === false) return null;

    let products: Product[] = [];
    let gallery: GalleryShowcaseItem[] = [];

    if (Array.isArray(data.productsRows) && data.productsRows.length > 0) {
      const { products: parsedProducts } = parseProductsSheet(normalize2dRows(data.productsRows));
      products = parsedProducts;
    }

    if (Array.isArray(data.galleryRows) && data.galleryRows.length > 0) {
      gallery = parseGallerySheet(normalize2dRows(data.galleryRows));
    }

    if (products.length === 0) return null;

    return { products, gallery };
  } catch (error) {
    console.warn("[catalog] Webhook catalog fetch skipped or unavailable:", error);
    return null;
  }
}

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

async function fetchGalleryFromSheets(): Promise<GalleryShowcaseItem[]> {
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
}

const getCachedCatalog = unstable_cache(
  async (): Promise<Catalog> => {
    const fromWebhook = await fetchFromWebhook();
    if (fromWebhook && fromWebhook.products.length > 0) {
      return { products: fromWebhook.products, source: "google-sheets" };
    }

    const fromSheets = await fetchCatalogFromSheets();
    if (fromSheets && fromSheets.products.length > 0) {
      return fromSheets;
    }

    return { products: loadLocalProducts(), source: "bundled-json" };
  },
  ["catalog-products"],
  { tags: [CATALOG_CACHE_TAG], revalidate: CATALOG_REVALIDATE_SECONDS }
);

const getCachedGallery = unstable_cache(
  async (): Promise<GalleryShowcaseItem[]> => {
    const fromWebhook = await fetchFromWebhook();
    if (fromWebhook && fromWebhook.gallery.length > 0) {
      return fromWebhook.gallery;
    }

    return await fetchGalleryFromSheets();
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
