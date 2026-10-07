import { type Product, type ProductInput, productSchema, type StockStatus } from "@/domain/product/product-schema";
import { toEmbeddableImageUrl } from "@/shared/media/google-drive";
import {
  getCell,
  parseBoolean,
  parseKeyValueList,
  parseLooseNumber,
  pipeSplit,
  readTable,
  type SheetRow,
  type SheetTable
} from "./table";

export type RowIssue = { row: number; message: string };

export type ParsedProducts = { products: Product[]; issues: RowIssue[] };

const POSTER_COLUMNS = [
  "poster_image_url",
  "poster_image",
  "poster_url",
  "poster",
  "cover_image_url",
  "cover_image",
  "cover_url",
  "cover",
  "image_url",
  "image"
];
const MAIN_IMAGE_COLUMNS = ["main_image_url", "main_image", "main_url", "main"];
const GALLERY_COLUMNS = [
  "gallery_images_url",
  "gallery_images",
  "gallery_image_url",
  "gallery_image",
  "gallery_urls",
  "gallery_url",
  "gallery"
];
// "ppecifications" is a known typo in the live sheet header.
const SPECIFICATION_COLUMNS = ["specifications", "ppecifications", "specs"];
const VARIANT_COLUMNS = ["colours_or_sizes_or_variants", "sizes_or_variants", "variants"];

function isProductHeader(headers: readonly string[]): boolean {
  return (
    headers.includes("slug") ||
    headers.includes("slug_") ||
    (headers.includes("title") && headers.includes("price"))
  );
}

export function parseStock(value: string): StockStatus {
  const normalized = value.trim().toLowerCase();
  if (normalized === "low stock") return "Low stock";
  if (normalized === "out of stock") return "Out of stock";
  return "In stock";
}

export function rowToProductInput(table: SheetTable, row: SheetRow): ProductInput | null {
  const cell = (...aliases: string[]) => getCell(table, row, ...aliases);
  const slug = cell("slug", "slug_");
  if (!slug) {
    return null;
  }

  const posterImage = toEmbeddableImageUrl(cell(...POSTER_COLUMNS));
  const galleryImages = pipeSplit(cell(...GALLERY_COLUMNS)).map(toEmbeddableImageUrl).filter(Boolean);
  const mainImageRaw = cell(...MAIN_IMAGE_COLUMNS);
  const rawId = cell("product_no", "product_id", "product_number", "id", "no", "productno", "product_no_");

  return {
    id: rawId || `prd-${slug}`,
    slug,
    title: cell("title") || slug,
    category: cell("category") || "General",
    price: parseLooseNumber(cell("price"), 0),
    old_price: parseLooseNumber(cell("old_price"), 0),
    stock: parseStock(cell("stock")),
    badge: cell("badge"),
    accent: cell("accent") || undefined,
    short: cell("short"),
    featured: parseBoolean(cell("featured")),
    new_arrival: parseBoolean(cell("new_arrival")),
    best_seller: parseBoolean(cell("best_seller")),
    cover_image: posterImage || undefined,
    main_image: mainImageRaw ? toEmbeddableImageUrl(mainImageRaw) : posterImage || galleryImages[0] || "",
    gallery_images: galleryImages,
    features: pipeSplit(cell("features", "key_features")),
    specifications: parseKeyValueList(cell(...SPECIFICATION_COLUMNS)),
    colours: [],
    sizes_or_variants: pipeSplit(cell(...VARIANT_COLUMNS)),
    tags: pipeSplit(cell("tags")),
    related_products: pipeSplit(cell("related_products", "related"))
  };
}

/** Parses a products tab. Rows without a slug are skipped; invalid rows are reported in `issues`. */
export function parseProductsSheet(values: readonly SheetRow[]): ParsedProducts {
  const table = readTable(values, isProductHeader);
  if (!table) {
    throw new Error("Could not find a header row containing 'slug' (or 'title' and 'price').");
  }

  const products: Product[] = [];
  const issues: RowIssue[] = [];
  const seenSlugs = new Set<string>();

  table.rows.forEach((row, index) => {
    const sheetRowNumber = table.headerRowIndex + index + 2;
    const input = rowToProductInput(table, row);
    if (!input) {
      return;
    }

    const result = productSchema.safeParse(input);
    if (!result.success) {
      const issue = result.error.issues[0];
      issues.push({ row: sheetRowNumber, message: `${issue?.path.join(".") ?? "row"}: ${issue?.message ?? "invalid"}` });
      return;
    }

    if (seenSlugs.has(result.data.slug)) {
      issues.push({ row: sheetRowNumber, message: `Duplicate slug "${result.data.slug}" ignored` });
      return;
    }

    seenSlugs.add(result.data.slug);
    products.push(result.data);
  });

  return { products, issues };
}
