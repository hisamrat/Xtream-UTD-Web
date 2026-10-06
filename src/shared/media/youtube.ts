/** YouTube URL helpers (privacy-enhanced embeds via youtube-nocookie.com). */

export function extractYouTubeVideoId(urlOrId?: string | null): string | null {
  const trimmed = urlOrId?.trim() ?? "";
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

export function isYouTubeUrl(url?: string | null): boolean {
  return extractYouTubeVideoId(url) !== null;
}

export function looksLikeYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

type EmbedOptions = { autoplay?: boolean; mute?: boolean; loop?: boolean; controls?: boolean };

export function getYouTubeEmbedUrl(videoId: string, options: EmbedOptions = {}): string {
  const { autoplay = true, mute = true, loop = true, controls = false } = options;
  const params = new URLSearchParams();
  if (autoplay) params.set("autoplay", "1");
  if (mute) params.set("mute", "1");
  if (loop) {
    params.set("loop", "1");
    params.set("playlist", videoId);
  }
  if (!controls) params.set("controls", "0");
  params.set("playsinline", "1");
  params.set("rel", "0");
  params.set("modestbranding", "1");
  params.set("enablejsapi", "1");

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function getYouTubeThumbnailCandidates(videoId: string): string[] {
  return ["maxresdefault", "hqdefault", "mqdefault"].map(
    (quality) => `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
  );
}
