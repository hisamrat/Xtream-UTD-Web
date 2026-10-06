import { describe, expect, it } from "vitest";
import { pickGalleryTab, pickProductsTab } from "./client";

const tabs = [
  { title: "Product Image and Video Gallery", sheetId: 662705131 },
  { title: "Product Information Management", sheetId: 0 },
  { title: "Notes", sheetId: 5 }
];

describe("sheet tab selection", () => {
  it("prefers configured tab names", () => {
    expect(pickProductsTab(tabs, "Notes")).toBe("Notes");
    expect(pickGalleryTab(tabs, "Notes")).toBe("Notes");
  });

  it("detects the products and gallery tabs by title", () => {
    expect(pickProductsTab(tabs)).toBe("Product Information Management");
    expect(pickGalleryTab(tabs)).toBe("Product Image and Video Gallery");
  });

  it("falls back to the first sheet for products and to nothing for the gallery", () => {
    expect(pickProductsTab([{ title: "Sheet1", sheetId: 9 }])).toBe("Sheet1");
    expect(pickGalleryTab([{ title: "Sheet1", sheetId: 9 }])).toBeNull();
    expect(pickProductsTab([])).toBeNull();
  });
});
