import { z } from "zod";

export const galleryMediaTypeSchema = z.enum(["video", "image"]);

export const galleryItemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().default(""),
  title: z.string().default(""),
  mediaType: galleryMediaTypeSchema.default("image"),
  mediaUrl: z.string().default(""),
  posterUrl: z.string().default(""),
  aspectRatio: z.number().positive().default(0.8),
  active: z.boolean().default(true),
});

export const galleryItemsSchema = z.array(galleryItemSchema);

export type GalleryMediaType = z.infer<typeof galleryMediaTypeSchema>;
export type GalleryShowcaseItem = z.infer<typeof galleryItemSchema>;
