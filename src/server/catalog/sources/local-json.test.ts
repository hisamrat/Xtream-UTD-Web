import { describe, expect, it } from "vitest";
import { findBrokenRelatedLinks } from "@/domain/product/related-products";
import { loadLocalProducts } from "./local-json";

describe("bundled fallback catalogue", () => {
  const products = loadLocalProducts();

  it("contains valid products with unique slugs", () => {
    expect(products.length).toBeGreaterThan(0);
    expect(new Set(products.map((product) => product.slug)).size).toBe(products.length);
  });

  it("has no broken related-product links", () => {
    expect(findBrokenRelatedLinks(products)).toEqual([]);
  });
});
