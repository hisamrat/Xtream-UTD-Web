import { z } from "zod";

export const stockStatusSchema = z.enum(["In stock", "Low stock", "Out of stock"]);

export const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  price: z.number().nonnegative(),
  old_price: z.number().nonnegative().default(0),
  stock: stockStatusSchema.default("In stock"),
  badge: z.string().default(""),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#00E5FF"),
  kind: z.string().min(1).default("camera"),
  short: z.string().default(""),
  featured: z.boolean().default(false),
  cover_image: z.string().optional(),
  main_image: z.string().min(1),
  gallery_images: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  specifications: z.record(z.string(), z.string()).default({}),
  colours: z.array(z.string()).default([]),
  sizes_or_variants: z.array(z.string()).default([]),
  new_arrival: z.boolean().default(false),
  best_seller: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  related_products: z.array(z.string()).default([]),
});

export const productsSchema = z.array(productSchema).min(1);

export type StockStatus = z.infer<typeof stockStatusSchema>;
export type Product = z.infer<typeof productSchema>;
