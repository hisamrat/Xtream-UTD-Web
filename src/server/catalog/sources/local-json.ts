import "server-only";
import rawProducts from "../../../../data/sample_products.json";
import { type Product, productSchema } from "@/domain/product/product-schema";

import fs from "fs";
import path from "path";

/**
 * Bundled fallback catalogue, used when Google Sheets is not configured or unavailable.
 * Reads dynamically from disk so admin inventory updates are reflected immediately on cache revalidation.
 */
export function loadLocalProducts(): Product[] {
  let sourceArray: unknown = rawProducts;

  try {
    const jsonPath = path.join(process.cwd(), "data", "sample_products.json");
    if (fs.existsSync(jsonPath)) {
      const fileData = fs.readFileSync(jsonPath, "utf-8");
      sourceArray = JSON.parse(fileData);
    }
  } catch (err) {
    console.warn("[catalog] Reading dynamic sample_products.json failed, falling back to bundled:", err);
  }

  if (!Array.isArray(sourceArray)) {
    return [];
  }

  const products: Product[] = [];
  for (const raw of sourceArray) {
    const result = productSchema.safeParse(raw);
    if (result.success) {
      products.push(result.data);
    } else {
      console.warn("[catalog] Skipping invalid product in bundled catalogue:", result.error.issues[0]);
    }
  }
  return products;
}
