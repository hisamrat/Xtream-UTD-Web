/**
 * Image URL utilities, with special support for Google Drive shared images.
 */

export function extractGoogleDriveFileId(urlOrId: string): string | null {
  if (!urlOrId || typeof urlOrId !== "string") return null;
  const trimmed = urlOrId.trim();

  // If it's a folder URL, it cannot be rendered as an image directly
  if (trimmed.includes("/folders/")) {
    return null;
  }

  // If already a raw file ID (25-50 alphanumeric/dash/underscore chars)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  // https://lh3.googleusercontent.com/d/{id}
  const lh3Match = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (lh3Match && lh3Match[1]) return lh3Match[1];

  // https://drive.google.com/file/d/{id}/view
  const fileDMatch = trimmed.match(/\/file\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // https://drive.google.com/open?id={id} or ?export=view&id={id} or ?id={id}
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  return null;
}

export function formatGoogleDriveImageUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return trimmed.includes("/folders/") ? "" : trimmed;
}

export function getGoogleDriveImageCandidates(urlOrId?: string | null): string[] {
  if (!urlOrId || typeof urlOrId !== "string") return [];
  const trimmed = urlOrId.trim();
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

export function isGoogleDriveUrl(url: string): boolean {
  if (!url) return false;
  return url.includes("drive.google.com") || url.includes("googleusercontent.com");
}
