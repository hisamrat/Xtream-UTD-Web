import { z } from "zod";

export const stockStatusSchema = z.enum(["In stock", "Low stock", "Out of stock"]);

export const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().min(1),
  price: z.number().nonnegative(),
  old_price: z.number().nonnegative(),
  stock: stockStatusSchema,
  badge: z.string(),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  kind: z.string().min(1),
  short: z.string().min(1),
  featured: z.boolean(),
  currency: z.literal("BDT"),
  discount_percentage: z.number().nonnegative(),
  quantity_available: z.number().int().nonnegative(),
  main_image: z.string().min(1),
  gallery_images: z.array(z.string().min(1)),
  video: z.string().nullable(),
  features: z.array(z.string().min(1)),
  specifications: z.record(z.string(), z.string()),
  colours: z.array(z.string().min(1)),
  sizes_or_variants: z.array(z.string().min(1)),
  new_arrival: z.boolean(),
  best_seller: z.boolean(),
  tags: z.array(z.string().min(1)),
  related_products: z.array(z.string().min(1)),
  order_link: z.string().min(1),
  facebook_post_link: z.string().min(1)
});

export const productsSchema = z.array(productSchema).min(1);

export type StockStatus = z.infer<typeof stockStatusSchema>;
export type Product = z.infer<typeof productSchema>;
