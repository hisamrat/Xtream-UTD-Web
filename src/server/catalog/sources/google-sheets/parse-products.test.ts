import { describe, expect, it } from "vitest";
import { parseProductsSheet, parseStock } from "./parse-products";

const DRIVE_ID = "1molKCmrmkbMbY_Y3KiWoxqRG9pu7wfIZ";

/** Mirrors the live sheet: a title row above the header, aliased/typo'd headers, Drive share links. */
const sheetRows = [
  ["Product Information Management"],
  [
    "Slug",
    "Title",
    "Category",
    "Price",
    "Old Price",
    "Stock",
    "Accent",
    "Featured",
    "Poster Image",
    "Gallery Images URL",
    "Ppecifications",
    "Colours or Sizes or Variants",
    "Tags",
    "Related Products"
  ],
  [
    "desk-lamp",
    "Desk Lamp",
    "Night Lights",
    "৳1,290",
    "1500 BDT",
    "low stock",
    "not-a-colour",
    "TRUE",
    `https://drive.google.com/file/d/${DRIVE_ID}/view?usp=sharing`,
    `https://drive.google.com/open?id=${DRIVE_ID} | https://example.com/b.jpg`,
    "Power: USB | Colour Temp: 3000K",
    "White | Black",
    "lamp | desk",
    "cloud-light"
  ],
  ["", "Template row without slug"],
  ["cloud-light", "", "", "550", "", "OUT OF STOCK"],
  ["desk-lamp", "Duplicate", "Night Lights", "100"]
];

describe("parseProductsSheet", () => {
  const { products, issues } = parseProductsSheet(sheetRows);

  it("maps a sheet row to a validated product", () => {
    const lamp = products[0];
    expect(lamp).toMatchObject({
      id: "prd-desk-lamp",
      slug: "desk-lamp",
      title: "Desk Lamp",
      category: "Night Lights",
      price: 1290,
      old_price: 1500,
      stock: "Low stock",
      accent: "#00E5FF",
      featured: true,
      cover_image: `https://lh3.googleusercontent.com/d/${DRIVE_ID}`,
      main_image: `https://lh3.googleusercontent.com/d/${DRIVE_ID}`,
      gallery_images: [`https://lh3.googleusercontent.com/d/${DRIVE_ID}`, "https://example.com/b.jpg"],
      specifications: { Power: "USB", "Colour Temp": "3000K" },
      sizes_or_variants: ["White", "Black"],
      tags: ["lamp", "desk"],
      related_products: ["cloud-light"]
    });
  });

  it("defaults empty cells and skips rows without a slug", () => {
    expect(products.map((product) => product.slug)).toEqual(["desk-lamp", "cloud-light"]);
    expect(products[1]).toMatchObject({ title: "cloud-light", category: "General", stock: "Out of stock", old_price: 0 });
  });

  it("reports duplicate slugs instead of overwriting", () => {
    expect(issues).toEqual([{ row: 6, message: 'Duplicate slug "desk-lamp" ignored' }]);
  });

  it("fails clearly when no header row exists", () => {
    expect(() => parseProductsSheet([["just", "text"]])).toThrow(/header row/);
  });
});

describe("parseStock", () => {
  it("normalizes stock labels", () => {
    expect(parseStock(" Low Stock ")).toBe("Low stock");
    expect(parseStock("out of stock")).toBe("Out of stock");
    expect(parseStock("")).toBe("In stock");
  });
});
