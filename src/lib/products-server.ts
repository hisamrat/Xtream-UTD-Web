import { getAllProducts } from "./products";
import type { Product } from "./product-schema";
import type { GalleryShowcaseItem } from "./gallery-schema";

/**
 * Fetch products from Google Sheets if configured, otherwise fall back to local JSON.
 * Supports either GOOGLE_SHEETS_API_KEY (simple) or Service Account credentials.
 * This function runs only on the server (Server Components and API routes).
 */
export async function fetchAllProducts(): Promise<Product[]> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const saKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  const isConfigured = Boolean(spreadsheetId && (apiKey || (saEmail && saKey)));

  if (isConfigured) {
    try {
      const { fetchProductsFromSheet } = await import("./sheets");
      return await fetchProductsFromSheet();
    } catch (error) {
      console.error("[products-server] Google Sheets products fetch failed, falling back to local JSON:", error);
      return getAllProducts();
    }
  }

  return getAllProducts();
}

/**
 * Fetch gallery showcase items from Google Sheets if configured.
 * If not configured or empty, returns an empty array.
 */
export async function fetchGalleryShowcaseItems(): Promise<GalleryShowcaseItem[]> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const saKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  const isConfigured = Boolean(spreadsheetId && (apiKey || (saEmail && saKey)));

  if (isConfigured) {
    try {
      const { fetchGalleryItemsFromSheet } = await import("./sheets");
      return await fetchGalleryItemsFromSheet();
    } catch (error) {
      console.error("[products-server] Google Sheets gallery fetch failed:", error);
      return [];
    }
  }

  return [];
}

