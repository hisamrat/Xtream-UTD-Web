/**
 * Google Sheets data-source for products.
 *
 * Authenticates with Sheets API v4 via an API key or service account,
 * dynamically detects the products sheet tab and header row,
 * parses pipe-delimited columns, converts Google Drive image URLs to embeddable format,
 * and caches the result.
 */

import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";
import { formatGoogleDriveImageUrl } from "./image-utils";
import type { Product, StockStatus } from "./product-schema";

// ---------------------------------------------------------------------------
// Cache Configuration
// ---------------------------------------------------------------------------

const DEFAULT_CACHE_TTL_MS = 60_000; // 60 seconds

interface CacheEntry {
  data: Product[];
  fetchedAt: number;
}

let memoryCache: CacheEntry | null = null;

function getCacheTtl(): number {
  const env = process.env.SHEETS_CACHE_TTL_MS;
  if (env) {
    const parsed = Number(env);
    if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
  }
  return DEFAULT_CACHE_TTL_MS;
}

function getDiskCachePath(): string {
  return path.join(process.cwd(), ".cache", "sheets-products.json");
}

function readDiskCache(ttl: number): Product[] | null {
  try {
    const cacheFile = getDiskCachePath();
    if (fs.existsSync(cacheFile)) {
      const content = fs.readFileSync(cacheFile, "utf8");
      const parsed = JSON.parse(content) as CacheEntry;
      if (Date.now() - parsed.fetchedAt < ttl && Array.isArray(parsed.data) && parsed.data.length > 0) {
        return parsed.data;
      }
    }
  } catch {
    // Ignore cache read errors
  }
  return null;
}

function writeDiskCache(data: Product[]): void {
  try {
    const cacheFile = getDiskCachePath();
    const dir = path.dirname(cacheFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(cacheFile, JSON.stringify({ data, fetchedAt: Date.now() }), "utf8");
  } catch {
    // Ignore cache write errors
  }
}

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

function getSheetsClient() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!spreadsheetId) {
    throw new Error("[sheets] Missing required environment variable: GOOGLE_SHEETS_SPREADSHEET_ID");
  }

  // Method 1: Google Cloud API Key
  if (apiKey) {
    const sheets = google.sheets({ version: "v4", auth: apiKey });
    return { sheets, spreadsheetId };
  }

  // Method 2: Service Account JWT Key
  if (email && rawKey) {
    const privateKey = rawKey.replace(/\\n/g, "\n");
    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    return { sheets, spreadsheetId };
  }

  throw new Error(
    "[sheets] Missing credentials. Provide either GOOGLE_SHEETS_API_KEY or GOOGLE_SERVICE_ACCOUNT_EMAIL/KEY."
  );
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

function normalizeHeader(h: string | undefined): string {
  return (h ?? "")
    .toLowerCase()
    .replace(/[^\w]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function pipeSplit(value: string | undefined): string[] {
  if (!value || !value.trim()) return [];
  return value
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseSpecifications(value: string | undefined): Record<string, string> {
  const pairs = pipeSplit(value);
  const result: Record<string, string> = {};
  for (const pair of pairs) {
    const idx = pair.indexOf(":");
    if (idx > 0) {
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      if (key) result[key] = val;
    }
  }
  return result;
}

function parseStock(value: string | undefined): StockStatus {
  const trimmed = (value ?? "").trim().toLowerCase();
  if (trimmed === "low stock") return "Low stock";
  if (trimmed === "out of stock") return "Out of stock";
  return "In stock";
}

function parseBool(value: string | undefined): boolean {
  return (value ?? "").trim().toUpperCase() === "TRUE";
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value || !value.trim()) return fallback;
  const n = Number(value.replace(/[^0-9.-]+/g, ""));
  return Number.isNaN(n) ? fallback : n;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch products from Google Sheets with dynamic tab and header detection.
 */
export async function fetchProductsFromSheet(): Promise<Product[]> {
  const ttl = getCacheTtl();

  // 1. Check in-memory cache
  if (memoryCache && Date.now() - memoryCache.fetchedAt < ttl) {
    return memoryCache.data;
  }

  // 2. Check disk cache (for multi-worker Next.js SSG builds)
  const diskCached = readDiskCache(ttl);
  if (diskCached) {
    memoryCache = { data: diskCached, fetchedAt: Date.now() };
    return diskCached;
  }

  console.log("[sheets] Fetching products from Google Sheets...");

  const { sheets, spreadsheetId } = getSheetsClient();

  // Dynamically get sheet tabs
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetList = meta.data.sheets ?? [];
  const targetSheet =
    sheetList.find((s) => s.properties?.title?.toLowerCase().includes("product")) ??
    sheetList[0];

  const sheetTitle = targetSheet?.properties?.title ?? "Products Information";

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetTitle}'!A1:Z`,
  });

  const rawRows = (response.data.values ?? []) as string[][];
  if (rawRows.length === 0) {
    throw new Error(`[sheets] No data found in sheet "${sheetTitle}".`);
  }

  // Locate the header row
  let headerRowIndex = -1;
  const headerMap = new Map<string, number>();

  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const row = rawRows[i];
    const normalized = row.map(normalizeHeader);
    if (normalized.includes("slug") || (normalized.includes("title") && normalized.includes("price"))) {
      headerRowIndex = i;
      normalized.forEach((h, colIdx) => {
        if (h) headerMap.set(h, colIdx);
      });
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error(`[sheets] Could not find header row with 'slug' or 'title' in sheet "${sheetTitle}".`);
  }

  const getCol = (row: string[], ...keys: string[]): string => {
    for (const k of keys) {
      const idx = headerMap.get(k);
      if (idx !== undefined && row[idx] !== undefined) {
        return (row[idx] ?? "").trim();
      }
    }
    return "";
  };

  const dataRows = rawRows.slice(headerRowIndex + 1);
  const products: Product[] = [];

  for (const row of dataRows) {
    const slug = getCol(row, "slug");
    if (!slug) continue;

    const title = getCol(row, "title") || slug;
    const category = getCol(row, "category") || "General";
    const price = parseNumber(getCol(row, "price"), 0);
    const oldPrice = parseNumber(getCol(row, "old_price"), 0);
    const stock = parseStock(getCol(row, "stock"));
    const badge = getCol(row, "badge");
    const accent = getCol(row, "accent") || "#00E5FF";
    const kind = getCol(row, "kind") || "camera";
    const short = getCol(row, "short");
    const featured = parseBool(getCol(row, "featured"));
    const newArrival = parseBool(getCol(row, "new_arrival"));
    const bestSeller = parseBool(getCol(row, "best_seller"));

    const coverRaw = getCol(row, "cover_image", "cover");
    const mainRaw = getCol(row, "main_image", "main");
    const galleryRaw = pipeSplit(getCol(row, "gallery_images", "gallery"));

    const coverImage = coverRaw ? formatGoogleDriveImageUrl(coverRaw) : "";
    const mainImage = mainRaw
      ? formatGoogleDriveImageUrl(mainRaw)
      : (coverImage || (galleryRaw.length > 0 ? formatGoogleDriveImageUrl(galleryRaw[0]) : ""));
    const galleryImages = galleryRaw.map(formatGoogleDriveImageUrl);

    const features = pipeSplit(getCol(row, "features"));
    const specifications = parseSpecifications(getCol(row, "specifications", "ppecifications", "specs"));
    const variantsRaw = pipeSplit(getCol(row, "colours_or_sizes_or_variants", "sizes_or_variants", "variants", "colours"));
    const tags = pipeSplit(getCol(row, "tags"));
    const relatedProducts = pipeSplit(getCol(row, "related_products", "related"));

    products.push({
      id: `prd-${slug}`,
      slug,
      title,
      category,
      price,
      old_price: oldPrice,
      stock,
      badge,
      accent,
      kind,
      short,
      featured,
      new_arrival: newArrival,
      best_seller: bestSeller,
      cover_image: coverImage || undefined,
      main_image: mainImage || "",
      gallery_images: galleryImages,
      features,
      specifications,
      colours: [],
      sizes_or_variants: variantsRaw,
      tags,
      related_products: relatedProducts,
    });
  }

  if (products.length === 0) {
    throw new Error(`[sheets] No valid products parsed from "${sheetTitle}".`);
  }

  // Update caches
  memoryCache = { data: products, fetchedAt: Date.now() };
  writeDiskCache(products);

  return products;
}
