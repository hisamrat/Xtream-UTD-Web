/**
 * Google Sheets data-source for products and showcase gallery.
 *
 * Authenticates with Sheets API v4 via an API key or service account,
 * dynamically detects sheet tabs and header rows,
 * parses pipe-delimited columns, converts Google Drive image URLs to embeddable format,
 * and caches the result.
 */

import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";
import { formatGoogleDriveImageUrl } from "./image-utils";
import type { Product, StockStatus } from "./product-schema";
import type { GalleryShowcaseItem, GalleryMediaType } from "./gallery-schema";

// ---------------------------------------------------------------------------
// Cache Configuration
// ---------------------------------------------------------------------------

const DEFAULT_CACHE_TTL_MS = 60_000; // 60 seconds

interface ProductCacheEntry {
  data: Product[];
  fetchedAt: number;
}

interface GalleryCacheEntry {
  data: GalleryShowcaseItem[];
  fetchedAt: number;
}

let productMemoryCache: ProductCacheEntry | null = null;
let galleryMemoryCache: GalleryCacheEntry | null = null;

function getCacheTtl(): number {
  const env = process.env.SHEETS_CACHE_TTL_MS;
  if (env) {
    const parsed = Number(env);
    if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
  }
  return DEFAULT_CACHE_TTL_MS;
}

function getProductDiskCachePath(): string {
  return path.join(process.cwd(), ".cache", "sheets-products.json");
}

function getGalleryDiskCachePath(): string {
  return path.join(process.cwd(), ".cache", "sheets-gallery.json");
}

function readProductDiskCache(ttl: number): Product[] | null {
  try {
    const cacheFile = getProductDiskCachePath();
    if (fs.existsSync(cacheFile)) {
      const content = fs.readFileSync(cacheFile, "utf8");
      const parsed = JSON.parse(content) as ProductCacheEntry;
      if (Date.now() - parsed.fetchedAt < ttl && Array.isArray(parsed.data) && parsed.data.length > 0) {
        return parsed.data;
      }
    }
  } catch {
    // Ignore cache read errors
  }
  return null;
}

function writeProductDiskCache(data: Product[]): void {
  try {
    const cacheFile = getProductDiskCachePath();
    const dir = path.dirname(cacheFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(cacheFile, JSON.stringify({ data, fetchedAt: Date.now() }), "utf8");
  } catch {
    // Ignore cache write errors
  }
}

function readGalleryDiskCache(ttl: number): GalleryShowcaseItem[] | null {
  try {
    const cacheFile = getGalleryDiskCachePath();
    if (fs.existsSync(cacheFile)) {
      const content = fs.readFileSync(cacheFile, "utf8");
      const parsed = JSON.parse(content) as GalleryCacheEntry;
      if (Date.now() - parsed.fetchedAt < ttl && Array.isArray(parsed.data)) {
        return parsed.data;
      }
    }
  } catch {
    // Ignore cache read errors
  }
  return null;
}

function writeGalleryDiskCache(data: GalleryShowcaseItem[]): void {
  try {
    const cacheFile = getGalleryDiskCachePath();
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

function parseBoolDefaultTrue(value: string | undefined): boolean {
  const trimmed = (value ?? "").trim().toUpperCase();
  if (trimmed === "FALSE") return false;
  return true;
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value || !value.trim()) return fallback;
  const n = Number(value.replace(/[^0-9.-]+/g, ""));
  return Number.isNaN(n) ? fallback : n;
}

function parseAspectRatio(value: string | undefined): number {
  if (!value || !value.trim()) return 0.8;
  const trimmed = value.trim().replace(/\s+/g, "");

  if (trimmed.includes(":") || trimmed.includes("/")) {
    const parts = trimmed.split(/[:/]/);
    if (parts.length === 2) {
      const w = Number(parts[0]);
      const h = Number(parts[1]);
      if (!Number.isNaN(w) && !Number.isNaN(h) && w > 0 && h > 0) {
        return w / h;
      }
    }
  }

  const num = Number(trimmed);
  if (!Number.isNaN(num) && num > 0) {
    return num;
  }

  return 0.8;
}

function parseMediaType(value: string | undefined): GalleryMediaType {
  const trimmed = (value ?? "").trim().toLowerCase();
  if (trimmed === "video" || trimmed.includes("video") || trimmed.includes("mp4")) {
    return "video";
  }
  return "image";
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
  if (productMemoryCache && Date.now() - productMemoryCache.fetchedAt < ttl) {
    return productMemoryCache.data;
  }

  // 2. Check disk cache (for multi-worker Next.js SSG builds)
  const diskCached = readProductDiskCache(ttl);
  if (diskCached) {
    productMemoryCache = { data: diskCached, fetchedAt: Date.now() };
    return diskCached;
  }

  console.log("[sheets] Fetching products from Google Sheets...");

  const { sheets, spreadsheetId } = getSheetsClient();

  // Dynamically get sheet tabs
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetList = meta.data.sheets ?? [];
  const targetSheet =
    sheetList.find((s) => s.properties?.title?.toLowerCase().includes("product") && !s.properties?.title?.toLowerCase().includes("gallery") && !s.properties?.title?.toLowerCase().includes("image")) ??
    sheetList.find((s) => s.properties?.sheetId === 0) ??
    sheetList[0];

  const sheetTitle = targetSheet?.properties?.title ?? "Product Information Management";

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

    const posterRaw = getCol(
      row,
      "poster_image_url",
      "poster_image",
      "poster_url",
      "poster",
      "cover_image_url",
      "cover_image",
      "cover_url",
      "cover",
      "image_url",
      "image"
    );
    const mainRaw = getCol(row, "main_image_url", "main_image", "main_url", "main");
    const galleryRaw = pipeSplit(
      getCol(
        row,
        "gallery_images_url",
        "gallery_images",
        "gallery_image_url",
        "gallery_image",
        "gallery_urls",
        "gallery_url",
        "gallery"
      )
    );

    const posterImageUrl = posterRaw ? formatGoogleDriveImageUrl(posterRaw) : "";
    const galleryImagesUrl = galleryRaw.map(formatGoogleDriveImageUrl).filter(Boolean);
    const mainImage = mainRaw
      ? formatGoogleDriveImageUrl(mainRaw)
      : (posterImageUrl || (galleryImagesUrl.length > 0 ? galleryImagesUrl[0] : ""));

    const features = pipeSplit(getCol(row, "features", "key_features"));
    const specifications = parseSpecifications(getCol(row, "specifications", "ppecifications", "specs"));
    const variantsRaw = pipeSplit(getCol(row, "colours_or_sizes_or_variants", "sizes_or_variants", "variants"));
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
      poster_image_url: posterImageUrl || undefined,
      gallery_images_url: galleryImagesUrl,
      cover_image: posterImageUrl || undefined,
      main_image: mainImage,
      gallery_images: galleryImagesUrl,
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
  productMemoryCache = { data: products, fetchedAt: Date.now() };
  writeProductDiskCache(products);

  return products;
}

/**
 * Fetch showcase gallery items from Google Sheets tab ("Product Image and Video Gallery").
 * If no data exists, returns empty array.
 */
export async function fetchGalleryItemsFromSheet(): Promise<GalleryShowcaseItem[]> {
  const ttl = getCacheTtl();

  // 1. Check in-memory cache
  if (galleryMemoryCache && Date.now() - galleryMemoryCache.fetchedAt < ttl) {
    return galleryMemoryCache.data;
  }

  // 2. Check disk cache
  const diskCached = readGalleryDiskCache(ttl);
  if (diskCached) {
    galleryMemoryCache = { data: diskCached, fetchedAt: Date.now() };
    return diskCached;
  }

  console.log("[sheets] Fetching gallery showcase from Google Sheets...");

  const { sheets, spreadsheetId } = getSheetsClient();

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetList = meta.data.sheets ?? [];
  const targetSheet =
    sheetList.find((s) => /gallery|showcase|media/i.test(s.properties?.title ?? "")) ??
    sheetList.find((s) => s.properties?.sheetId === 662705131);

  if (!targetSheet) {
    console.log("[sheets] No gallery showcase sheet found.");
    return [];
  }

  const sheetTitle = targetSheet.properties?.title ?? "Product Image and Video Gallery";

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetTitle}'!A1:Z`,
  });

  const rawRows = (response.data.values ?? []) as string[][];
  if (rawRows.length === 0) {
    return [];
  }

  // Locate header row
  let headerRowIndex = -1;
  const headerMap = new Map<string, number>();

  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const row = rawRows[i];
    const normalized = row.map(normalizeHeader);
    if (
      normalized.includes("media_type") ||
      normalized.includes("media_url") ||
      (normalized.includes("slug") && normalized.includes("title"))
    ) {
      headerRowIndex = i;
      normalized.forEach((h, colIdx) => {
        if (h) headerMap.set(h, colIdx);
      });
      break;
    }
  }

  if (headerRowIndex === -1) {
    console.warn(`[sheets] Could not find header row in gallery sheet "${sheetTitle}".`);
    return [];
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
  const items: GalleryShowcaseItem[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const slug = getCol(row, "slug", "product_slug");
    const title = getCol(row, "title", "name", "media_title", "product_title");
    const mediaTypeRaw = getCol(row, "media_type", "media", "type", "kind");
    const mediaUrlRaw = getCol(
      row,
      "media_url", "media_urls", "media_link",
      "url", "video_url", "youtube_url",
      "image_url", "video", "media"
    );
    const posterUrlRaw = getCol(
      row,
      "poster_image_url", "poster_images_url",
      "poster_url", "poster",
      "thumbnail_url", "thumbnail",
      "cover_url", "cover_image_url", "cover_image"
    );
    const aspectRatioRaw = getCol(row, "aspect_ratio", "aspect", "ratio", "dimensions");
    const activeRaw = getCol(row, "active", "enabled", "published", "status");

    // Skip empty placeholder/template rows
    if (!slug && !title && !mediaUrlRaw && !posterUrlRaw) {
      continue;
    }

    const active = parseBoolDefaultTrue(activeRaw);
    if (!active) continue;

    let mediaType = parseMediaType(mediaTypeRaw);
    // Auto-detect video if URL looks like YouTube or a video file
    if (mediaType === "image" && mediaUrlRaw && /(?:youtube\.com|youtu\.be|\.mp4|\.webm|\.mov)/i.test(mediaUrlRaw)) {
      mediaType = "video";
    }
    // For YouTube URLs, preserve the original URL (not reformatted as Drive)
    const mediaUrl = mediaUrlRaw
      ? (/(?:youtube\.com|youtu\.be)/i.test(mediaUrlRaw) ? mediaUrlRaw.trim() : formatGoogleDriveImageUrl(mediaUrlRaw))
      : "";
    const posterUrl = posterUrlRaw ? formatGoogleDriveImageUrl(posterUrlRaw) : "";
    const aspectRatio = parseAspectRatio(aspectRatioRaw);

    items.push({
      id: `gallery-${slug || i + 1}`,
      slug,
      title: title || slug || "Showcase Item",
      mediaType,
      mediaUrl,
      posterUrl,
      aspectRatio,
      active,
    });
  }

  galleryMemoryCache = { data: items, fetchedAt: Date.now() };
  writeGalleryDiskCache(items);

  return items;
}


