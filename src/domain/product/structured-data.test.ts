import { describe, expect, it } from "vitest";
import { makeProduct } from "@/test/fixtures";
import { toProductJsonLd } from "./structured-data";

describe("toProductJsonLd", () => {
  it("describes the offer from catalogue data only", () => {
    const product = makeProduct({ slug: "lamp", title: "Lamp", price: 900, stock: "Low stock", cover_image: "https://x/lamp.jpg" });
    const data = toProductJsonLd(product, "https://shop.example/products/lamp");

    expect(data).toMatchObject({
      "@type": "Product",
      name: "Lamp",
      image: ["https://x/lamp.jpg"],
      offers: { price: 900, priceCurrency: "BDT", availability: "https://schema.org/LimitedAvailability", url: "https://shop.example/products/lamp" }
    });
    expect(data).not.toHaveProperty("aggregateRating");
    expect(data).not.toHaveProperty("review");
  });
});
