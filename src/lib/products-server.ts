import { getAllProducts } from "./products";
import type { Product } from "./product-schema";

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
      console.error("[products-server] Google Sheets fetch failed, falling back to local JSON:", error);
      return getAllProducts();
    }
  }

  return getAllProducts();
}
