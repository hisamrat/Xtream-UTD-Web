import "server-only";
import rawProducts from "../../../../data/sample_products.json";
import { type Product, productSchema } from "@/domain/product/product-schema";

/**
 * Bundled fallback catalogue, used when Google Sheets is not configured or unavailable.
 * This is the only module that reads the JSON file.
 */
export function loadLocalProducts(): Product[] {
  if (!Array.isArray(rawProducts)) {
    return [];
  }

  const products: Product[] = [];
  for (const raw of rawProducts) {
    const result = productSchema.safeParse(raw);
    if (result.success) {
      products.push(result.data);
    } else {
      console.warn("[catalog] Skipping invalid product in bundled catalogue:", result.error.issues[0]);
    }
  }
  return products;
}
