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

  it("accurately parses user renamed sheet columns with or without Kind and Sr No", () => {
    const renamedRowsWithAll = [
      [
        "Sr No ",
        "Product No 📍",
        "Slug 📍",
        "Title",
        "Category",
        "Price",
        "Old Price",
        "Stock",
        "Badge",
        "Accent",
        "Kind",
        "Short",
        "Featured",
        "New Arrival",
        "Best Seller",
        "Poster Image URL",
        "Gallery Images URL",
        "Features",
        "Specifications",
        "Colours Or Sizes Or Variants",
        "Tags",
        "Related Products"
      ],
      [
        "1",
        "101",
        "tulip-mirror",
        "Cloud Tulip Mirror Light",
        "Night Lights",
        "1490",
        "1990",
        "In stock",
        "Trending",
        "#FF69B4",
        "decor",
        "Handmade flower night lamp.",
        "TRUE",
        "TRUE",
        "TRUE",
        `https://drive.google.com/file/d/${DRIVE_ID}/view?usp=sharing`,
        `https://drive.google.com/file/d/${DRIVE_ID}/view?usp=sharing`,
        "DIY Tulip | 20 Flowers | Ambient Glow",
        "Material: Acrylic | LED: Warm",
        "Pink | Blue | Purple",
        "mirror | tulip | light",
        "desk-lamp"
      ]
    ];

    const resultWithAll = parseProductsSheet(renamedRowsWithAll);
    expect(resultWithAll.products).toHaveLength(1);
    expect(resultWithAll.products[0]).toMatchObject({
      id: "101",
      slug: "tulip-mirror",
      title: "Cloud Tulip Mirror Light",
      category: "Night Lights",
      price: 1490,
      old_price: 1990,
      stock: "In stock",
      badge: "Trending",
      accent: "#FF69B4",
      short: "Handmade flower night lamp.",
      featured: true,
      new_arrival: true,
      best_seller: true,
      cover_image: `https://lh3.googleusercontent.com/d/${DRIVE_ID}`,
      features: ["DIY Tulip", "20 Flowers", "Ambient Glow"],
      specifications: { Material: "Acrylic", LED: "Warm" },
      sizes_or_variants: ["Pink", "Blue", "Purple"],
      tags: ["mirror", "tulip", "light"],
      related_products: ["desk-lamp"]
    });

    // Test with Kind and Sr No REMOVED:
    const renamedRowsWithoutKindAndSrNo = [
      [
        "Product No 📍",
        "Slug 📍",
        "Title",
        "Category",
        "Price",
        "Old Price",
        "Stock",
        "Badge",
        "Accent",
        "Short",
        "Featured",
        "New Arrival",
        "Best Seller",
        "Poster Image URL",
        "Gallery Images URL",
        "Features",
        "Specifications",
        "Colours Or Sizes Or Variants",
        "Tags",
        "Related Products"
      ],
      [
        "102",
        "tulip-mirror-clean",
        "Cloud Tulip Mirror Light Clean",
        "Night Lights",
        "1490",
        "1990",
        "In stock",
        "Trending",
        "#FF69B4",
        "Handmade flower night lamp.",
        "TRUE",
        "TRUE",
        "TRUE",
        `https://drive.google.com/file/d/${DRIVE_ID}/view?usp=sharing`,
        `https://drive.google.com/file/d/${DRIVE_ID}/view?usp=sharing`,
        "DIY Tulip | 20 Flowers",
        "Material: Acrylic",
        "Pink | Blue",
        "mirror | tulip",
        "desk-lamp"
      ]
    ];

    const resultClean = parseProductsSheet(renamedRowsWithoutKindAndSrNo);
    expect(resultClean.products).toHaveLength(1);
    expect(resultClean.products[0].slug).toBe("tulip-mirror-clean");
    expect(resultClean.products[0].id).toBe("102");
    expect(resultClean.products[0].sizes_or_variants).toEqual(["Pink", "Blue"]);
  });
});

describe("parseStock", () => {
  it("normalizes stock labels", () => {
    expect(parseStock(" Low Stock ")).toBe("Low stock");
    expect(parseStock("out of stock")).toBe("Out of stock");
    expect(parseStock("")).toBe("In stock");
  });
});
