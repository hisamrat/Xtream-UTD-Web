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
    expect(products.length).toBeGreaterThanOrEqual(60);
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
    const product = getProductBySlug("portable-folding-laptop-stand");
    expect(product).toBeDefined();
    if (!product) {
      return;
    }

    expect(hasValidOldPrice(product)).toBe(true);
    expect(calculateDiscountPercentage(product)).toBe(27);
  });

  it("searches title, category, features, and tags", () => {
    expect(filterProducts(getAllProducts(), { query: "earbuds" })).toHaveLength(2);
    expect(filterProducts(getAllProducts(), { query: "desk accessories" }).length).toBeGreaterThan(1);
    expect(filterProducts(getAllProducts(), { query: "editable feature" }).length).toBeGreaterThanOrEqual(60);
  });

  it("filters and sorts products", () => {
    const results = filterProducts(getAllProducts(), {
      categories: ["Smart Gadgets"],
      discounted: true,
      sort: "price-desc"
    });

    expect(results.map((product) => product.category).every((category) => category === "Smart Gadgets")).toBe(true);
    expect(results[0]?.price).toBeGreaterThanOrEqual(results[1]?.price ?? 0);
  });
});

describe("order inquiry", () => {
  it("creates a Messenger-ready product summary", () => {
    const product = getProductBySlug("portable-folding-laptop-stand");
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

    expect(message).toContain("Portable Folding Laptop Stand");
    expect(message).toContain("৳255");
    expect(message).toContain("Quantity: 2");
  });
});
