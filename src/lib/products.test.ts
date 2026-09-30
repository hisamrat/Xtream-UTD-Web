import { describe, expect, it } from "vitest";
import {
  filterProducts,
  getAllProducts,
  getProductBySlug,
  validateProductLinks
} from "./products";
import { calculateDiscountPercentage, formatPrice, hasValidOldPrice } from "./format";
import { createOrderMessage } from "./order";

describe("product data", () => {
  it("loads the complete sample catalogue", () => {
    const products = getAllProducts();
    expect(products.length).toBeGreaterThanOrEqual(1);
    expect(new Set(products.map((product) => product.slug)).size).toBe(products.length);
  });

  it("has valid related product links", () => {
    expect(validateProductLinks()).toEqual([]);
  });
});

describe("catalogue helpers", () => {
  it("formats Bangladeshi taka prices", () => {
    expect(formatPrice(1290)).toBe("৳1,290");
  });

  it("calculates valid discounts", () => {
    const product = getProductBySlug("refillable-perfume-bottle-8ml");
    expect(product).toBeDefined();
    if (!product) {
      return;
    }

    expect(hasValidOldPrice(product)).toBe(true);
    expect(calculateDiscountPercentage(product)).toBe(20);
  });

  it("searches title, category, features, and tags", () => {
    expect(filterProducts(getAllProducts(), { query: "mirrorless" }).length).toBeGreaterThanOrEqual(1);
    expect(filterProducts(getAllProducts(), { query: "Desk Accessories" }).length).toBeGreaterThanOrEqual(1);
    expect(filterProducts(getAllProducts(), { query: "nonexistent-query-xyz" })).toHaveLength(0);
  });

  it("filters and sorts products", () => {
    const results = filterProducts(getAllProducts(), {
      categories: ["Audio & Microphones"],
      sort: "price-desc"
    });

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.every((product) => product.category === "Audio & Microphones")).toBe(true);
  });
});

describe("order inquiry", () => {
  it("creates a Messenger-ready product summary", () => {
    const product = getProductBySlug("refillable-perfume-bottle-8ml");
    expect(product).toBeDefined();
    if (!product) {
      return;
    }

    const message = createOrderMessage({
      product,
      variant: "Black",
      quantity: 2,
      customerName: "Sample Customer",
      phone: "01XXXXXXXXX",
      address: "Dhaka",
      note: "Please confirm availability"
    });

    expect(message).toContain("Refillable Perfume Bottle 8ml");
    expect(message).toContain("৳199");
    expect(message).toContain("Quantity: 2");
  });
});
