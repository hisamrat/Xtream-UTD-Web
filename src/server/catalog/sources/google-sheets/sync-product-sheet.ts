import "server-only";
import type { Product } from "@/domain/product/product-schema";

const DEFAULT_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbwgZnY_0Zi_Uxmo1lajhO-Mxz73GWoJuFAvkrpMrPDq4X4omof6741TAGB8YEhASKC3Ag/exec";

/**
 * Formats a Product into the exact 21 columns configured for 'Website Product Information':
 * 1. Sr No
 * 2. Product No 📍
 * 3. Slug 📍
 * 4. Title
 * 5. Category
 * 6. Price
 * 7. Old Price
 * 8. Stock
 * 9. Badge
 * 10. Accent
 * 11. Short
 * 12. Featured
 * 13. New Arrival
 * 14. Best Seller
 * 15. Poster Image URL
 * 16. Gallery Images URL
 * 17. Features
 * 18. Specifications
 * 19. Colours Or Sizes Or Variants
 * 20. Tags
 * 21. Related Products
 */
export function formatProductRowForSheet(product: Product, index: number = 1): (string | number | boolean)[] {
  return [
    index, // 1. Sr No
    product.id || `prd-${product.slug}`, // 2. Product No 📍
    product.slug, // 3. Slug 📍
    product.title, // 4. Title
    product.category || "General", // 5. Category
    product.price || 0, // 6. Price
    product.old_price || 0, // 7. Old Price
    product.stock || "In stock", // 8. Stock
    product.badge || "", // 9. Badge
    product.accent || "#00E5FF", // 10. Accent
    product.short || "", // 11. Short
    Boolean(product.featured), // 12. Featured
    Boolean(product.new_arrival), // 13. New Arrival
    Boolean(product.best_seller), // 14. Best Seller
    product.cover_image || product.main_image || "", // 15. Poster Image URL
    (product.gallery_images || []).join(" | "), // 16. Gallery Images URL
    (product.features || []).join(" | "), // 17. Features
    Object.entries(product.specifications || {})
      .map(([k, v]) => `${k}:${v}`)
      .join(" | "), // 18. Specifications
    (product.sizes_or_variants || []).join(" | "), // 19. Colours Or Sizes Or Variants
    (product.tags || []).join(" | "), // 20. Tags
    (product.related_products || []).join(" | ") // 21. Related Products
  ];
}

export type SheetSyncResult = {
  synced: boolean;
  message: string;
  error?: string;
};

export async function syncProductToSheet(
  action: "create" | "update" | "delete" | "sync_all",
  options: {
    product?: Product;
    productId?: string;
    slug?: string;
    allProducts?: Product[];
  }
): Promise<SheetSyncResult> {
  const webhookUrl =
    process.env.CATALOG_WEBHOOK_URL?.trim() ||
    process.env.ORDER_SHEET_WEBHOOK_URL?.trim() ||
    DEFAULT_WEBHOOK_URL;

  if (!webhookUrl) {
    return { synced: false, message: "No Google Sheet Webhook URL configured." };
  }

  try {
    const row = options.product ? formatProductRowForSheet(options.product) : undefined;
    const allRows = options.allProducts
      ? options.allProducts.map((p, i) => formatProductRowForSheet(p, i + 1))
      : undefined;

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: action === "delete" ? "delete_product" : action === "sync_all" ? "sync_all_products" : "save_product",
        productId: options.productId || options.product?.id,
        slug: options.slug || options.product?.slug,
        product: options.product,
        row,
        productsRows: allRows
      }),
      redirect: "follow",
      signal: AbortSignal.timeout(12000)
    });

    if (!res.ok) {
      return { synced: false, message: `Sheet Webhook status ${res.status}` };
    }

    const json = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
    return {
      synced: Boolean(json.success),
      message: json.message || "Google Sheet sync processed."
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sync error";
    console.warn("[syncProductToSheet] Notice:", msg);
    return { synced: false, message: "Could not reach Google Sheet webhook.", error: msg };
  }
}

