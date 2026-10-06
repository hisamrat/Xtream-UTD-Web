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

/** Ordered list of URLs to try for an image; Drive files get several mirrors. */
export function getImageCandidates(urlOrId?: string | null): string[] {
  const trimmed = urlOrId?.trim() ?? "";
  if (!trimmed || trimmed.includes("/folders/")) return [];

  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    return [
      `https://lh3.googleusercontent.com/d/${fileId}`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`,
      `https://drive.google.com/uc?export=view&id=${fileId}`
    ];
  }

  return [trimmed];
}

/** Flattens several source URLs into one de-duplicated candidate list. */
export function collectImageCandidates(urls: ReadonlyArray<string | null | undefined>): string[] {
  return Array.from(new Set(urls.flatMap((url) => getImageCandidates(url))));
}
