import { describe, expect, it } from "vitest";
import { parseCatalogueQuery, serializeCatalogueQuery } from "./catalogue-query";
import { getPageCount, getVisiblePageNumbers } from "./pagination";

describe("catalogue URL contract", () => {
  it("parses every supported parameter", () => {
    expect(
      parseCatalogueQuery({
        q: "lamp",
        category: "Night Lights, Mixers",
        stock: "In stock,Bogus",
        min: "100",
        max: "abc",
        new: "1",
        best: "0",
        discount: "1",
        sort: "price-asc"
      })
    ).toEqual({
      query: "lamp",
      categories: ["Night Lights", "Mixers"],
      availability: ["In stock"],
      priceMin: 100,
      priceMax: undefined,
      newArrivals: true,
      bestSellers: false,
      discounted: true,
      sort: "price-asc"
    });
  });

  it("falls back to the default sort and takes the first of repeated params", () => {
    const filters = parseCatalogueQuery({ q: ["first", "second"], sort: "cheapest" });
    expect(filters.query).toBe("first");
    expect(filters.sort).toBe("newest");
  });

  it("round-trips through the query string and omits defaults", () => {
    const filters = parseCatalogueQuery({ q: "desk lamp", category: "Night Lights", min: "50", best: "1", sort: "title" });
    const query = serializeCatalogueQuery(filters);
    expect(query).toBe("?q=desk+lamp&category=Night+Lights&min=50&best=1&sort=title");
    expect(parseCatalogueQuery(Object.fromEntries(new URLSearchParams(query.slice(1))))).toEqual(filters);
    expect(serializeCatalogueQuery({ sort: "newest" })).toBe("");
  });
});

describe("pagination", () => {
  it("counts pages", () => {
    expect(getPageCount(0)).toBe(1);
    expect(getPageCount(25)).toBe(3);
  });

  it("windows the visible page numbers around the current page", () => {
    expect(getVisiblePageNumbers(1, 3, 5)).toEqual([1, 2, 3]);
    expect(getVisiblePageNumbers(6, 20, 5)).toEqual([4, 5, 6, 7, 8]);
    expect(getVisiblePageNumbers(1, 20, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getVisiblePageNumbers(20, 20, 5)).toEqual([16, 17, 18, 19, 20]);
  });
});
