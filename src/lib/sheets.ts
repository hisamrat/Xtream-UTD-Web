/**
 * Google Sheets data-source for products.
 *
 * Authenticates with Sheets API v4 via an API key or service account,
 * fetches the "Products" sheet, parses pipe-delimited columns,
 * converts Google Drive image URLs to embeddable format,
 * and caches the result in memory.
 */

import { google } from "googleapis";
import { formatGoogleDriveImageUrl } from "./image-utils";
import type { Product, StockStatus } from "./product-schema";

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

const DEFAULT_CACHE_TTL_MS = 60_000; // 60 seconds

interface CacheEntry {
  data: Product[];
  fetchedAt: number;
}

let cache: CacheEntry | null = null;

function getCacheTtl(): number {
  const env = process.env.SHEETS_CACHE_TTL_MS;
  if (env) {
    const parsed = Number(env);
    if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
  }
  return DEFAULT_CACHE_TTL_MS;
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
// Row parsing utilities
// ---------------------------------------------------------------------------

/** Split a pipe-separated string, trimming each entry. */
function pipeSplit(value: string | undefined): string[] {
  if (!value || !value.trim()) return [];
  return value
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Parse "Key:Value|Key2:Value2" into a Record. */
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

/** Normalise a stock-status string to a valid enum value. */
function parseStock(value: string | undefined): StockStatus {
  const trimmed = (value ?? "").trim();
  if (trimmed === "Low stock") return "Low stock";
  if (trimmed === "Out of stock") return "Out of stock";
  return "In stock";
}

/** Convert a Google Sheets boolean ("TRUE"/"FALSE") to a boolean. */
function parseBool(value: string | undefined): boolean {
  return (value ?? "").trim().toUpperCase() === "TRUE";
}

/** Parse a numeric value, returning fallback when empty / NaN. */
function parseNumber(value: string | undefined, fallback: number): number {
  if (!value || !value.trim()) return fallback;
  const n = Number(value.replace(/[^0-9.-]+/g, ""));
  return Number.isNaN(n) ? fallback : n;
}

// ---------------------------------------------------------------------------
// Row -> Product
// ---------------------------------------------------------------------------

/**
 * Maps a single sheet row (columns A-V) to a Product.
 */
function rowToProduct(row: string[]): Product {
  const col = (index: number): string => (row[index] ?? "").trim();

  const slug = col(0);
  const coverImage = col(13);
  const mainImage = col(14);
  const galleryRaw = pipeSplit(col(15));

  const price = parseNumber(col(3), 0);
  const oldPrice = parseNumber(col(4), 0);

  return {
    // Generated ID
    id: `prd-${slug}`,

    // Direct column mappings
    slug,
    title: col(1) || slug,
    category: col(2) || "Uncategorized",
    price,
    old_price: oldPrice,
    stock: parseStock(col(5)),
    badge: col(6) || "",
    accent: col(7) || "#00E5FF",
    kind: col(8) || "camera",
    short: col(9) || "",
    featured: parseBool(col(10)),
    new_arrival: parseBool(col(11)),
    best_seller: parseBool(col(12)),

    // Images normalized with Google Drive direct viewer
    cover_image: coverImage ? formatGoogleDriveImageUrl(coverImage) : undefined,
    main_image: mainImage ? formatGoogleDriveImageUrl(mainImage) : (coverImage ? formatGoogleDriveImageUrl(coverImage) : ""),
    gallery_images: galleryRaw.map(formatGoogleDriveImageUrl),

    // Pipe-delimited parsed arrays
    features: pipeSplit(col(16)),
    specifications: parseSpecifications(col(17)),
    colours: pipeSplit(col(18)),
    sizes_or_variants: pipeSplit(col(19)),
    tags: pipeSplit(col(20)),
    related_products: pipeSplit(col(21)),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch products from the configured Google Sheet.
 * Results are cached in memory for SHEETS_CACHE_TTL_MS (default 60s).
 */
export async function fetchProductsFromSheet(): Promise<Product[]> {
  // Check cache
  const ttl = getCacheTtl();
  if (cache) {
    const age = Date.now() - cache.fetchedAt;
    if (age < ttl) {
      console.log(`[sheets] Using cached data (${age}ms old)`);
      return cache.data;
    }
  }

  console.log("[sheets] Fetching products from Google Sheets...");

  const { sheets, spreadsheetId } = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Products!A2:V", // skip header row
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    throw new Error("[sheets] No data found in the Products sheet.");
  }

  const products: Product[] = rows
    .filter((row): row is string[] => Array.isArray(row) && row.length > 0 && Boolean((row[0] as string | undefined)?.trim()))
    .map(rowToProduct);

  if (products.length === 0) {
    throw new Error("[sheets] Products sheet contained rows but none had a valid slug.");
  }

  // Update cache
  cache = { data: products, fetchedAt: Date.now() };

  return products;
}
