import { z } from "zod";

export const stockStatusSchema = z.enum(["In stock", "Low stock", "Out of stock"]);

export const stockStatuses = stockStatusSchema.options;

const DEFAULT_ACCENT = "#00E5FF";

/**
 * Shape accepted from external sources (bundled JSON, Google Sheets rows).
 * Legacy duplicate image fields are accepted here and normalized away below.
 */
const productInputSchema = z.object({
  id: z.string().default(""),
  slug: z.string().trim().min(1),
  title: z.string().default(""),
  category: z.string().trim().default("General"),
  price: z.coerce.number().nonnegative().default(0),
  old_price: z.coerce.number().nonnegative().default(0),
  stock: stockStatusSchema.catch("In stock").default("In stock"),
  badge: z.string().default(""),
  accent: z
    .string()
    .default(DEFAULT_ACCENT)
    .transform((value) => (/^#[0-9A-Fa-f]{6}$/.test(value) ? value : DEFAULT_ACCENT)),
  short: z.string().default(""),
  featured: z.boolean().default(false),
  poster_image_url: z.string().optional(),
  gallery_images_url: z.array(z.string()).default([]),
  cover_image: z.string().optional(),
  main_image: z.string().default(""),
  gallery_images: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  specifications: z.record(z.string(), z.string()).default({}),
  colours: z.array(z.string()).default([]),
  sizes_or_variants: z.array(z.string()).default([]),
  new_arrival: z.boolean().default(false),
  best_seller: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  related_products: z.array(z.string()).default([])
});

export const productSchema = productInputSchema.transform(
  ({ poster_image_url, gallery_images_url, ...product }) => {
    const galleryImages = (product.gallery_images.length > 0 ? product.gallery_images : gallery_images_url).filter(
      Boolean
    );
    const coverImage = product.cover_image || poster_image_url || product.main_image || galleryImages[0] || "";

    return {
      ...product,
      id: product.id || `prd-${product.slug}`,
      title: product.title || product.slug,
      category: product.category || "General",
      cover_image: coverImage,
      main_image: product.main_image || coverImage,
      gallery_images: galleryImages
    };
  }
);

export type ProductInput = z.input<typeof productSchema>;
export type StockStatus = z.infer<typeof stockStatusSchema>;
export type Product = z.infer<typeof productSchema>;
