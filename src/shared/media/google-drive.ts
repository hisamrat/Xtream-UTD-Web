/** Google Drive / googleusercontent image URL helpers. */

export function extractGoogleDriveFileId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  if (!trimmed || trimmed.includes("/folders/")) {
    return null;
  }

  // Already a raw file ID.
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  const patterns = [
    /googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/, // https://lh3.googleusercontent.com/d/{id}
    /\/file\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/, // https://drive.google.com/file/d/{id}/view
    /[?&]id=([a-zA-Z0-9_-]+)/ // ?id={id}
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

/** Converts any Drive share link to an embeddable URL; other URLs pass through. */
export function toEmbeddableImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return trimmed.includes("/folders/") ? "" : trimmed;
}

/** Default display widths (CSS px × ~2 for high-DPI screens) used when requesting Drive images. */
export const IMAGE_WIDTHS = {
  thumbnail: 240,
  compact: 360,
  card: 600,
  hero: 800,
  detail: 800
} as const;

/**
 * Ordered list of URLs to try for an image. Drive files are requested from Google's image CDN
 * resized to `targetWidth` and re-encoded as JPEG (`-rj`): uploads are usually multi-megabyte PNGs,
 * and a 600px JPEG is ~95% smaller (≈55 KB instead of ≈1.2 MB). The resized PNG, the Drive thumbnail
 * service and the original file follow as fallbacks.
 */
export function getImageCandidates(urlOrId?: string | null, targetWidth: number = IMAGE_WIDTHS.card): string[] {
  const trimmed = urlOrId?.trim() ?? "";
  if (!trimmed || trimmed.includes("/folders/")) return [];

  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    const candidates: string[] = [];
    if (targetWidth > 0) {
      candidates.push(`https://lh3.googleusercontent.com/d/${fileId}=w${targetWidth}-rj`);
      candidates.push(`https://lh3.googleusercontent.com/d/${fileId}=w${targetWidth}`);
      candidates.push(`https://drive.google.com/thumbnail?id=${fileId}&sz=w${targetWidth}`);
    }
    candidates.push(`https://lh3.googleusercontent.com/d/${fileId}`);
    candidates.push(`https://drive.google.com/uc?export=view&id=${fileId}`);
    return candidates;
  }

  return [trimmed];
}

/** Flattens several source URLs into one de-duplicated candidate list with CDN sizing. */
export function collectImageCandidates(
  urls: ReadonlyArray<string | null | undefined>,
  targetWidth: number = IMAGE_WIDTHS.card
): string[] {
  return Array.from(new Set(urls.flatMap((url) => getImageCandidates(url, targetWidth))));
}
