import { describe, expect, it } from "vitest";
import { makeSummary, sampleSummaries } from "@/test/fixtures";
import { countActiveFilters, filterProducts, getPriceRange, isSortKey, sortProducts } from "./catalogue-filter";

const slugs = (items: { slug: string }[]) => items.map((item) => item.slug);

describe("filterProducts", () => {
  it("searches title, category, features, tags and specifications", () => {
    expect(slugs(filterProducts(sampleSummaries, { query: "desk lamp" }))).toEqual(["desk-lamp"]);
    expect(slugs(filterProducts(sampleSummaries, { query: "night lights" }))).toEqual(["desk-lamp", "cloud-light"]);
    expect(slugs(filterProducts(sampleSummaries, { query: "touch dimmer" }))).toEqual(["desk-lamp"]);
    expect(slugs(filterProducts(sampleSummaries, { query: "LIGHTING" }))).toEqual(["desk-lamp"]);
    expect(slugs(filterProducts(sampleSummaries, { query: "usb rechargeable" }))).toEqual(["milk-frother"]);
    expect(filterProducts(sampleSummaries, { query: "nonexistent" })).toHaveLength(0);
  });

  it("combines category, availability, price and flag filters", () => {
    expect(slugs(filterProducts(sampleSummaries, { categories: ["Night Lights"], availability: ["Low stock"] }))).toEqual([
      "cloud-light"
    ]);
    expect(slugs(filterProducts(sampleSummaries, { priceMin: 500, priceMax: 1000 }))).toEqual(["desk-lamp", "cloud-light"]);
    expect(slugs(filterProducts(sampleSummaries, { newArrivals: true }))).toEqual(["desk-lamp"]);
    expect(slugs(filterProducts(sampleSummaries, { bestSellers: true }))).toEqual(["milk-frother"]);
    expect(slugs(filterProducts(sampleSummaries, { discounted: true }))).toEqual(["desk-lamp"]);
  });

  it("keeps data-source order for 'newest', including products only present in the live source", () => {
    const liveOnly = makeSummary({ slug: "sheet-only-product" });
    const source = [liveOnly, ...sampleSummaries];
    expect(slugs(filterProducts(source, { sort: "newest" }))[0]).toBe("sheet-only-product");
  });
});

describe("sortProducts", () => {
  it("sorts by price, title, and featured-first", () => {
    expect(slugs(sortProducts(sampleSummaries, "price-asc"))).toEqual(["milk-frother", "cloud-light", "desk-lamp", "laptop-stand"]);
    expect(slugs(sortProducts(sampleSummaries, "price-desc"))[0]).toBe("laptop-stand");
    expect(slugs(sortProducts(sampleSummaries, "title"))[0]).toBe("laptop-stand");
    expect(slugs(sortProducts(sampleSummaries, "featured"))[0]).toBe("cloud-light");
  });
});

describe("catalogue helpers", () => {
  it("computes the price range and active filter count", () => {
    expect(getPriceRange(sampleSummaries)).toEqual({ min: 350, max: 1500 });
    expect(getPriceRange([])).toEqual({ min: 0, max: 0 });
    expect(countActiveFilters({ categories: ["A"], availability: ["In stock"], priceMin: 10, priceMax: 20, discounted: true })).toBe(4);
  });

  it("recognizes sort keys", () => {
    expect(isSortKey("price-asc")).toBe(true);
    expect(isSortKey("cheapest")).toBe(false);
  });
});
