import { describe, expect, it } from "vitest";
import { sampleCatalogue, sampleSummaries } from "@/test/fixtures";
import { countByCategory, getCategories } from "./categories";
import { findBrokenRelatedLinks, getRelatedProducts } from "./related-products";

const [deskLamp] = sampleCatalogue;

describe("getRelatedProducts", () => {
  it("uses explicit links first, skips unknown slugs, then fills from the same category and the rest", () => {
    if (!deskLamp) throw new Error("fixture missing");
    const related = getRelatedProducts(deskLamp, sampleSummaries, 3);
    expect(related.map((product) => product.slug)).toEqual(["cloud-light", "milk-frother", "laptop-stand"]);
    expect(related.some((product) => product.slug === deskLamp.slug)).toBe(false);
  });

  it("only returns products from the given catalogue", () => {
    if (!deskLamp) throw new Error("fixture missing");
    expect(getRelatedProducts(deskLamp, [])).toEqual([]);
  });
});

describe("categories", () => {
  it("derives categories and counts from the data", () => {
    expect(getCategories(sampleSummaries)).toEqual(["Laptop Stand", "Mixers", "Night Lights"]);
    expect(countByCategory(sampleSummaries)).toEqual({ "Night Lights": 2, Mixers: 1, "Laptop Stand": 1 });
  });
});

describe("findBrokenRelatedLinks", () => {
  it("reports related slugs that do not exist", () => {
    expect(findBrokenRelatedLinks(sampleCatalogue)).toEqual([
      { productSlug: "desk-lamp", message: "Related product slug not found: missing-product" }
    ]);
  });
});
