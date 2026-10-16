import { type GalleryMediaType, type GalleryShowcaseItem, galleryItemSchema } from "@/domain/gallery/gallery-schema";
import { toEmbeddableImageUrl } from "@/shared/media/google-drive";
import { looksLikeYouTubeUrl } from "@/shared/media/youtube";
import { getCell, parseBoolean, readTable, type SheetRow } from "./table";

const DEFAULT_ASPECT_RATIO = 0.8;

function isGalleryHeader(headers: readonly string[]): boolean {
  return (
    headers.includes("media_type") ||
    headers.includes("media_url") ||
    headers.includes("media_urls") ||
    headers.includes("media_link") ||
    headers.includes("video_url") ||
    headers.includes("video_link") ||
    headers.includes("image_url") ||
    headers.includes("youtube_url") ||
    headers.includes("poster_image_url") ||
    headers.includes("poster_url") ||
    headers.some((h) => h.includes("media") || h.includes("gallery") || h.includes("video") || h.includes("poster")) ||
    ((headers.includes("slug") || headers.includes("product_no") || headers.includes("id")) &&
      (headers.includes("title") || headers.includes("name") || headers.includes("product_name") || headers.includes("product_title")))
  );
}

/** Accepts "4:5", "4/5" or a plain ratio such as "0.8". */
export function parseAspectRatio(value: string): number {
  const compact = value.trim().replace(/\s+/g, "");
  if (!compact) return DEFAULT_ASPECT_RATIO;

  const parts = compact.split(/[:/]/);
  if (parts.length === 2) {
    const width = Number(parts[0]);
    const height = Number(parts[1]);
    if (width > 0 && height > 0) return width / height;
  }

  const ratio = Number(compact);
  return ratio > 0 ? ratio : DEFAULT_ASPECT_RATIO;
}

export function parseMediaType(typeValue: string, mediaUrl: string): GalleryMediaType {
  const normalized = typeValue.trim().toLowerCase();
  if (normalized.includes("video") || normalized.includes("mp4")) return "video";
  if (normalized.includes("image") || normalized.includes("photo") || normalized.includes("img")) return "image";
  if (mediaUrl && /(?:youtube\.com|youtu\.be|\.mp4|\.webm|\.mov)/i.test(mediaUrl)) return "video";
  return "image";
}

/** Parses the gallery tab. Inactive and empty template rows are skipped. */
export function parseGallerySheet(values: readonly SheetRow[]): GalleryShowcaseItem[] {
  const table = readTable(values, isGalleryHeader);
  if (!table) {
    return [];
  }

  const items: GalleryShowcaseItem[] = [];

  table.rows.forEach((row, index) => {
    const cell = (...aliases: string[]) => getCell(table, row, ...aliases);
    const slug = cell("slug", "product_slug", "product_no", "id");
    const title = cell("title", "name", "media_title", "product_title", "product_name");
    const mediaUrlRaw = cell(
      "media_url",
      "media_urls",
      "media_link",
      "url",
      "video_url",
      "video_link",
      "youtube_url",
      "image_url",
      "video",
      "media",
      "image_video_url",
      "gallery_images_url",
      "gallery_image_url"
    );
    const posterUrlRaw = cell(
      "poster_image_url",
      "poster_images_url",
      "poster_url",
      "poster",
      "thumbnail_url",
      "thumbnail",
      "cover_url",
      "cover_image_url",
      "cover_image",
      "product_image"
    );

    if (!slug && !title && !mediaUrlRaw && !posterUrlRaw) return;
    if (!parseBoolean(cell("active", "enabled", "published", "status"), true)) return;

    const result = galleryItemSchema.safeParse({
      id: `gallery-${slug ? `${slug}-${index + 1}` : index + 1}`,
      slug,
      title: title || slug || "Showcase Item",
      mediaType: parseMediaType(cell("media_type", "media", "type", "kind"), mediaUrlRaw),
      mediaUrl: mediaUrlRaw
        ? looksLikeYouTubeUrl(mediaUrlRaw)
          ? mediaUrlRaw.trim()
          : toEmbeddableImageUrl(mediaUrlRaw)
        : "",
      posterUrl: posterUrlRaw ? toEmbeddableImageUrl(posterUrlRaw) : "",
      aspectRatio: parseAspectRatio(cell("aspect_ratio", "aspect", "ratio", "dimensions")),
      active: true
    });

    if (result.success) {
      items.push(result.data);
    }
  });

  return items;
}
