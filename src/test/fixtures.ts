import { type Product, type ProductInput, productSchema } from "@/domain/product/product-schema";
import { type ProductSummary, toProductSummary } from "@/domain/product/product-summary";

/** Builds a valid product for tests; only the fields a test cares about need to be given. */
export function makeProduct(overrides: Partial<ProductInput> & { slug: string }): Product {
  return productSchema.parse({ title: overrides.slug, price: 100, ...overrides });
}

export function makeSummary(overrides: Partial<ProductInput> & { slug: string }): ProductSummary {
  return toProductSummary(makeProduct(overrides));
}

/** A small catalogue covering the filterable attributes. */
export const sampleCatalogue: Product[] = [
  makeProduct({
    slug: "desk-lamp",
    title: "Desk Lamp",
    category: "Night Lights",
    price: 900,
    old_price: 1200,
    stock: "In stock",
    new_arrival: true,
    features: ["Touch dimmer"],
    tags: ["lighting"],
    related_products: ["cloud-light", "missing-product"]
  }),
  makeProduct({
    slug: "cloud-light",
    title: "Cloud Light",
    category: "Night Lights",
    price: 550,
    stock: "Low stock",
    featured: true
  }),
  makeProduct({
    slug: "milk-frother",
    title: "Milk Frother",
    category: "Mixers",
    price: 350,
    stock: "Out of stock",
    best_seller: true,
    specifications: { Battery: "USB rechargeable" }
  }),
  makeProduct({ slug: "laptop-stand", title: "Aluminium Laptop Stand", category: "Laptop Stand", price: 1500 })
];

export const sampleSummaries: ProductSummary[] = sampleCatalogue.map(toProductSummary);
