import { describe, expect, it } from "vitest";
import { productSchema } from "./product-schema";

describe("productSchema", () => {
  it("normalizes legacy image fields into cover/main/gallery", () => {
    const product = productSchema.parse({
      slug: "lamp",
      poster_image_url: "https://example.com/poster.jpg",
      gallery_images_url: ["https://example.com/1.jpg", ""]
    });

    expect(product.cover_image).toBe("https://example.com/poster.jpg");
    expect(product.main_image).toBe("https://example.com/poster.jpg");
    expect(product.gallery_images).toEqual(["https://example.com/1.jpg"]);
    expect(product).not.toHaveProperty("poster_image_url");
    expect(product).not.toHaveProperty("gallery_images_url");
  });

  it("fills id and title from the slug and falls back for invalid values", () => {
    const product = productSchema.parse({ slug: "lamp", accent: "red", stock: "Sold out" });

    expect(product.id).toBe("prd-lamp");
    expect(product.title).toBe("lamp");
    expect(product.accent).toBe("#00E5FF");
    expect(product.stock).toBe("In stock");
    expect(product.price).toBe(0);
  });

  it("coerces numeric strings and rejects a missing slug", () => {
    expect(productSchema.parse({ slug: "lamp", price: "450" }).price).toBe(450);
    expect(productSchema.safeParse({ slug: " " }).success).toBe(false);
    expect(productSchema.safeParse({ slug: "lamp", price: "1,200" }).success).toBe(false);
  });
});
