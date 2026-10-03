"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Pause, ArrowUpRight, Package } from "lucide-react";
import { useLanguage } from "@/components/site/LanguageProvider";
import {
  getGoogleDriveImageCandidates,
  extractYouTubeVideoId,
  isYouTubeUrl,
  getYouTubeEmbedUrl,
} from "@/lib/image-utils";
import type { GalleryShowcaseItem } from "@/lib/gallery-schema";
import type { Product } from "@/lib/product-schema";

type PositionedItem = GalleryShowcaseItem & {
  x: number;
  y: number;
  width: number;
  height: number;
  colIndex: number;
};

type ShowcaseCardMediaProps = {
  item: GalleryShowcaseItem;
  title: string;
  isVideo: boolean;
  isCurrentActiveVideo: boolean;
  videoRefCallback: (el: HTMLVideoElement | null) => void;
};

function ShowcaseCardMedia({
  item,
  title,
  isVideo,
  isCurrentActiveVideo,
  videoRefCallback,
}: ShowcaseCardMediaProps) {
  const [imgError, setImgError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [candidateIndex, setCandidateIndex] = useState(0);

  const youtubeId = useMemo(() => {
    return extractYouTubeVideoId(item.mediaUrl) || extractYouTubeVideoId(item.posterUrl);
  }, [item.mediaUrl, item.posterUrl]);

  const isYouTube = Boolean(youtubeId);

  const candidates = useMemo(() => {
    const list: string[] = [];
    const add = (url?: string) => {
      if (!url) return;
      const trimmed = url.trim();
      if (!trimmed || trimmed.includes("/folders/")) return;
      const c = getGoogleDriveImageCandidates(trimmed);
      if (c.length > 0) list.push(...c);
      else list.push(trimmed);
    };

    if (item.posterUrl) add(item.posterUrl);

    if (isYouTube && youtubeId) {
      list.push(`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`);
      list.push(`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`);
      list.push(`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`);
    }

    if (!isVideo && item.mediaUrl) {
      add(item.mediaUrl);
    }

    return Array.from(new Set(list));
  }, [item, isVideo, isYouTube, youtubeId]);

  useEffect(() => {
    setCandidateIndex(0);
    setImgError(false);
    setVideoError(false);
  }, [candidates, item.mediaUrl]);

  const activeSrc = candidates[candidateIndex] || "";

  const handleImageError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setImgError(true);
    }
  };

  // 1. YouTube Video Showcase - plays when activated
  if (isVideo && isYouTube && youtubeId) {
    const embedUrl = isCurrentActiveVideo
      ? getYouTubeEmbedUrl(youtubeId, {
          autoplay: true,
          mute: false,
          loop: true,
          controls: true,
        })
      : "";

    return (
      <div className="showcase-card-media" style={{ position: "relative", width: "100%", height: "100%" }}>
        {activeSrc && !imgError ? (
          <img
            src={activeSrc}
            alt={title}
            className="showcase-media-content showcase-poster-underlay"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              opacity: isCurrentActiveVideo ? 0 : 1,
              transition: "opacity 300ms ease",
            }}
            referrerPolicy="no-referrer"
            loading="lazy"
            draggable={false}
            onError={handleImageError}
          />
        ) : null}

        {isCurrentActiveVideo && embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            className="showcase-media-content showcase-youtube-iframe"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : null}

        <div className="showcase-card-scrim" aria-hidden="true" />
      </div>
    );
  }

  // 2. Direct MP4/Video File Showcase
  if (isVideo && item.mediaUrl && !videoError) {
    return (
      <div className="showcase-card-media" style={{ position: "relative", width: "100%", height: "100%" }}>
        <video
          ref={videoRefCallback}
          src={item.mediaUrl}
          poster={activeSrc || undefined}
          loop
          muted
          playsInline
          preload="metadata"
          className="showcase-media-content showcase-video-element"
          onError={() => setVideoError(true)}
        />
        <div className="showcase-card-scrim" aria-hidden="true" />
      </div>
    );
  }

  // 3. Image or poster fallback
  if (activeSrc && !imgError) {
    return (
      <div className="showcase-card-media" style={{ position: "relative", width: "100%", height: "100%" }}>
        <div className="product-placeholder-underlay" aria-hidden="true">
          <div className="product-placeholder-backdrop" />
          <div className="product-placeholder-content">
            <div className="product-placeholder-icon-wrap">
              <Package size={28} className="product-placeholder-icon" strokeWidth={1.5} />
            </div>
          </div>
        </div>
        <img
          src={activeSrc}
          alt={title}
          className="showcase-media-content showcase-image-element"
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
          referrerPolicy="no-referrer"
          loading="lazy"
          draggable={false}
          onError={handleImageError}
        />
        <div className="showcase-card-scrim" aria-hidden="true" />
      </div>
    );
  }

  // 4. Placeholder fallback
  return (
    <div className="showcase-card-media" style={{ position: "relative", width: "100%", height: "100%" }}>
      <div className="product-placeholder-wrap" aria-hidden="true">
        <div className="product-placeholder-backdrop" />
        <div className="product-placeholder-content">
          <div className="product-placeholder-icon-wrap">
            <Package size={36} className="product-placeholder-icon" strokeWidth={1.5} />
          </div>
        </div>
      </div>
      <div className="showcase-card-scrim" aria-hidden="true" />
    </div>
  );
}

type ExploreMediaMasonrySectionProps = {
  products?: Product[];
  showcaseItems?: GalleryShowcaseItem[];
};

export function ExploreMediaMasonrySection({
  products = [],
  showcaseItems = [],
}: ExploreMediaMasonrySectionProps) {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1312);

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isPlayingMap, setIsPlayingMap] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Determine items to display: use showcaseItems from Google Sheets or fallback to products
  const displayItems = useMemo(() => {
    if (showcaseItems && showcaseItems.length > 0) {
      return showcaseItems;
    }
    if (products && products.length > 0) {
      return products.slice(0, 8).map((p, idx) => ({
        id: `gallery-product-${p.slug || p.id}`,
        slug: p.slug,
        title: p.title,
        mediaType: "image" as const,
        mediaUrl: p.main_image || p.cover_image || "",
        posterUrl: "",
        aspectRatio: idx % 3 === 0 ? 0.75 : idx % 3 === 1 ? 1 : 0.85,
        active: true,
      }));
    }
    return [];
  }, [showcaseItems, products]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleResize = () => {
      const w = el.clientWidth || el.getBoundingClientRect().width;
      if (w > 0) setContainerWidth(w);
    };

    handleResize();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(handleResize);
      ro.observe(el);
      return () => ro.disconnect();
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const gap = 16;
  const cols = useMemo(() => {
    if (containerWidth < 640) return 2;
    if (containerWidth < 1024) return 3;
    return 4;
  }, [containerWidth]);

  const { layoutItems, totalHeight } = useMemo(() => {
    if (containerWidth <= 0 || displayItems.length === 0) {
      return { layoutItems: [], totalHeight: 0 };
    }

    const colW = Math.max(120, (containerWidth - gap * (cols - 1)) / cols);
    const colHeights = Array(cols).fill(0);
    const positioned: PositionedItem[] = [];

    for (const item of displayItems) {
      let minCol = 0;
      for (let c = 1; c < cols; c++) {
        if (colHeights[c] < colHeights[minCol] - 0.5) minCol = c;
      }

      const ratio = item.aspectRatio > 0 ? item.aspectRatio : 0.8;
      const h = Math.round(colW / ratio);
      const x = minCol * (colW + gap);
      const y = colHeights[minCol];

      positioned.push({ ...item, x, y, width: colW, height: h, colIndex: minCol });
      colHeights[minCol] += h + gap;
    }

    const maxH = Math.max(...colHeights);
    return { layoutItems: positioned, totalHeight: Math.max(0, maxH - gap) };
  }, [displayItems, containerWidth, cols, gap]);

  const toggleInCardVideo = useCallback((item: GalleryShowcaseItem) => {
    const isYt = isYouTubeUrl(item.mediaUrl) || isYouTubeUrl(item.posterUrl);

    if (isYt) {
      if (activeVideoId === item.id) {
        setActiveVideoId(null);
        setIsPlayingMap((prev) => ({ ...prev, [item.id]: false }));
      } else {
        setActiveVideoId(item.id);
        setIsPlayingMap((prev) => ({ ...prev, [item.id]: true }));
      }
      return;
    }

    const videoEl = videoRefs.current.get(item.id);
    if (!videoEl) return;

    // Pause any previously active video
    if (activeVideoId && activeVideoId !== item.id) {
      const prevVideo = videoRefs.current.get(activeVideoId);
      if (prevVideo) {
        prevVideo.pause();
        prevVideo.muted = true;
      }
      setIsPlayingMap((prev) => ({ ...prev, [activeVideoId]: false }));
    }

    if (activeVideoId === item.id) {
      // Already active: toggle play/pause
      if (videoEl.paused) {
        videoEl.muted = false;
        videoEl.play().catch(() => {});
        setIsPlayingMap((prev) => ({ ...prev, [item.id]: true }));
      } else {
        videoEl.pause();
        setIsPlayingMap((prev) => ({ ...prev, [item.id]: false }));
      }
    } else {
      // New video: start playing
      setActiveVideoId(item.id);
      videoEl.muted = false;
      videoEl.play().catch(() => {
        videoEl.muted = true;
        videoEl.play().catch(() => {});
      });
      setIsPlayingMap((prev) => ({ ...prev, [item.id]: true }));
    }
  }, [activeVideoId]);

  if (displayItems.length === 0) return null;

  return (
    <section className="explore-section-block explore-draggable-showcase-section" aria-labelledby="showcase-heading">
      <div className="explore-section-header showcase-header">
        <div className="explore-section-header-left">
          <span className="explore-section-kicker">
            {language === "bn" ? "ফিচার্ড শোকেস" : "FEATURED SHOWCASE"}
          </span>
          <h2 id="showcase-heading" className="explore-section-title">
            {language === "bn"
              ? "এক্সপ্লোর প্রোডাক্টস ইমেজ ও ভিডিও গ্যালারি"
              : "Explore Products Image and Video Gallery"}
          </h2>
        </div>
      </div>

      <div
        ref={containerRef}
        className="showcase-masonry-canvas"
        style={{ height: totalHeight > 0 ? `${totalHeight}px` : "auto" }}
        role="region"
        aria-label="Interactive media masonry gallery"
      >
        {layoutItems.map((item) => {
          const isVideo = item.mediaType === "video";
          const isCurrentActiveVideo = activeVideoId === item.id;
          const isPlaying = isPlayingMap[item.id] ?? false;
          const title = item.title;
          const productHref = item.slug ? `/products/${item.slug}` : "/products";

          const titleBadge = title ? (
            <div className="showcase-card-top-bar">
              <span className="showcase-card-top-title" title={title}>
                {title}
              </span>
            </div>
          ) : null;

          if (isVideo) {
            return (
              <div
                key={item.id}
                className={`showcase-card is-video ${isCurrentActiveVideo ? "is-active-video" : ""}`}
                style={{
                  width: `${item.width}px`,
                  height: `${item.height}px`,
                  transform: `translate3d(${item.x}px, ${item.y}px, 0px)`,
                  transition: "transform 380ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 250ms ease, width 200ms ease, height 200ms ease",
                }}
                role="button"
                tabIndex={0}
                aria-label={`${title} (Video) - ${isCurrentActiveVideo && isPlaying ? "Pause video" : "Play video"}`}
                onClick={() => toggleInCardVideo(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleInCardVideo(item);
                  }
                }}
              >
                <ShowcaseCardMedia
                  item={item}
                  title={title}
                  isVideo={true}
                  isCurrentActiveVideo={isCurrentActiveVideo}
                  videoRefCallback={(el) => {
                    if (el) videoRefs.current.set(item.id, el);
                    else videoRefs.current.delete(item.id);
                  }}
                />

                {titleBadge}

                <div className="showcase-card-bottom-bar">
                  <div className="showcase-bottom-spacer" />
                  <button
                    type="button"
                    className="showcase-action-icon-btn video-trigger-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleInCardVideo(item);
                    }}
                    aria-label={isCurrentActiveVideo && isPlaying ? "Pause video" : "Play video"}
                    title={isCurrentActiveVideo && isPlaying ? "Pause" : "Play"}
                  >
                    {isCurrentActiveVideo && isPlaying ? (
                      <Pause size={15} fill="currentColor" />
                    ) : (
                      <Play size={15} fill="currentColor" />
                    )}
                  </button>
                </div>
              </div>
            );
          }

          // Image Card: Clean Next.js Link directly to the product details page
          return (
            <Link
              key={item.id}
              href={productHref}
              className="showcase-card is-image"
              style={{
                width: `${item.width}px`,
                height: `${item.height}px`,
                transform: `translate3d(${item.x}px, ${item.y}px, 0px)`,
                transition: "transform 380ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 250ms ease, width 200ms ease, height 200ms ease",
              }}
              aria-label={`${title} - ${language === "bn" ? "বিস্তারিত দেখুন" : "View Details"}`}
            >
              <ShowcaseCardMedia
                item={item}
                title={title}
                isVideo={false}
                isCurrentActiveVideo={false}
                videoRefCallback={() => {}}
              />

              {titleBadge}

              {/* View details button ONLY on images */}
              <div className="showcase-card-bottom-bar">
                <div className="showcase-bottom-spacer" />
                <span
                  className="showcase-action-icon-btn details-link-btn"
                  title={language === "bn" ? "বিস্তারিত দেখুন" : "View Product Details"}
                  aria-hidden="true"
                >
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
