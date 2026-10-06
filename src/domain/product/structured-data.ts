import { commerceConfig } from "@/config/commerce";
import type { Product } from "./product-schema";

const availability: Record<Product["stock"], string> = {
  "In stock": "https://schema.org/InStock",
  "Low stock": "https://schema.org/LimitedAvailability",
  "Out of stock": "https://schema.org/OutOfStock"
};

/**
 * schema.org Product data for search engines. Uses only catalogue fields —
 * no ratings, reviews or brand claims are added.
 */
export function toProductJsonLd(product: Product, productUrl?: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    sku: product.id,
    category: product.category,
    ...(product.short ? { description: product.short } : {}),
    ...(product.cover_image ? { image: [product.cover_image, ...product.gallery_images] } : {}),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: commerceConfig.currency,
      availability: availability[product.stock],
      ...(productUrl ? { url: productUrl } : {})
    }
  };
}
