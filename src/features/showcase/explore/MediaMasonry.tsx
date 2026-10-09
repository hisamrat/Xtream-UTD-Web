"use client";

import Link from "next/link";
import { ArrowUpRight, Package, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GalleryShowcaseItem } from "@/domain/gallery/gallery-schema";
import type { ProductSummary } from "@/domain/product/product-summary";
import { useI18n } from "@/i18n/LanguageProvider";
import { collectImageCandidates } from "@/shared/media/google-drive";
import { extractYouTubeVideoId, getYouTubeEmbedUrl, getYouTubeThumbnailCandidates } from "@/shared/media/youtube";
import { layoutMasonry } from "./masonry-layout";

const CARD_TRANSITION =
  "transform 380ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 250ms ease, width 200ms ease, height 200ms ease";
const FALLBACK_ITEM_COUNT = 8;

/** Without a gallery sheet, show the first products' main images instead. */
function productsAsGalleryItems(products: readonly ProductSummary[]): GalleryShowcaseItem[] {
  return products.slice(0, FALLBACK_ITEM_COUNT).map((product, index) => ({
    id: `gallery-product-${product.slug}`,
    slug: product.slug,
    title: product.title,
    mediaType: "image",
    mediaUrl: product.main_image || product.cover_image,
    posterUrl: "",
    aspectRatio: index % 3 === 0 ? 0.75 : index % 3 === 1 ? 1 : 0.85,
    active: true
  }));
}

type MediaProps = {
  item: GalleryShowcaseItem;
  isVideo: boolean;
  isActiveVideo: boolean;
  videoRefCallback: (element: HTMLVideoElement | null) => void;
};

function ShowcaseCardMedia({ item, isVideo, isActiveVideo, videoRefCallback }: MediaProps) {
  const youtubeId = extractYouTubeVideoId(item.mediaUrl) ?? extractYouTubeVideoId(item.posterUrl);
  const candidates = useMemo(
    () =>
      Array.from(
        new Set([
          ...collectImageCandidates([item.posterUrl], 640),
          ...(youtubeId ? getYouTubeThumbnailCandidates(youtubeId) : []),
          ...(!isVideo ? collectImageCandidates([item.mediaUrl], 640) : [])
        ])
      ),
    [item.posterUrl, item.mediaUrl, isVideo, youtubeId]
  );
  const candidateKey = candidates.join("|");
  const [failure, setFailure] = useState({ key: candidateKey, failedCount: 0 });
  const [videoError, setVideoError] = useState(false);
  const failedCount = failure.key === candidateKey ? failure.failedCount : 0;
  const activeSrc = candidates[failedCount];
  const handleImageError = () => setFailure({ key: candidateKey, failedCount: failedCount + 1 });

  if (isVideo && youtubeId) {
    const embedUrl = isActiveVideo ? getYouTubeEmbedUrl(youtubeId, { autoplay: true, mute: false, loop: true, controls: true }) : "";
    return (
      <div className="showcase-card-media" style={{ position: "relative", width: "100%", height: "100%" }}>
        {activeSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote thumbnails with a fallback chain
          <img
            src={activeSrc}
            alt={item.title}
            className="showcase-media-content showcase-poster-underlay"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              opacity: isActiveVideo ? 0 : 1,
              transition: "opacity 300ms ease"
            }}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={handleImageError}
          />
        ) : null}

        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={item.title}
            className="showcase-media-content showcase-youtube-iframe"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : null}

        <div className="showcase-card-scrim" aria-hidden="true" />
      </div>
    );
  }

  if (isVideo && item.mediaUrl && !videoError) {
    return (
      <div className="showcase-card-media" style={{ position: "relative", width: "100%", height: "100%" }}>
        <video
          ref={videoRefCallback}
          src={item.mediaUrl}
          poster={activeSrc}
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

  if (activeSrc) {
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
        {/* eslint-disable-next-line @next/next/no-img-element -- remote Drive URLs need the manual fallback chain */}
        <img
          src={activeSrc}
          alt={item.title}
          className="showcase-media-content showcase-image-element"
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block"
          }}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={handleImageError}
        />
        <div className="showcase-card-scrim" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="showcase-card-media" style={{ position: "relative", width: "100%", height: "100%" }}>
      <div className="product-placeholder-wrap" aria-hidden="true">
        <div className="product-placeholder-content">
          <div className="product-placeholder-icon-wrap">
            <Package size={28} className="product-placeholder-icon" strokeWidth={1.5} />
          </div>
        </div>
      </div>
      <div className="showcase-card-scrim" aria-hidden="true" />
    </div>
  );
}

type MediaMasonryProps = {
  products: ProductSummary[];
  showcaseItems: GalleryShowcaseItem[];
};

export function MediaMasonry({ products, showcaseItems }: MediaMasonryProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [containerWidth, setContainerWidth] = useState(1312);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [playing, setPlaying] = useState<Record<string, boolean>>({});

  const displayItems = useMemo(
    () => (showcaseItems.length > 0 ? showcaseItems : productsAsGalleryItems(products)),
    [showcaseItems, products]
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const measure = () => {
      const width = element.clientWidth || element.getBoundingClientRect().width;
      if (width > 0) setContainerWidth(width);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => layoutMasonry(displayItems, containerWidth), [displayItems, containerWidth]);

  const toggleVideo = useCallback(
    (item: GalleryShowcaseItem) => {
      const isYouTube = extractYouTubeVideoId(item.mediaUrl) !== null || extractYouTubeVideoId(item.posterUrl) !== null;
      if (isYouTube) {
        const activating = activeVideoId !== item.id;
        setActiveVideoId(activating ? item.id : null);
        setPlaying((current) => ({ ...current, [item.id]: activating }));
        return;
      }

      const video = videoRefs.current.get(item.id);
      if (!video) return;

      if (activeVideoId && activeVideoId !== item.id) {
        const previous = videoRefs.current.get(activeVideoId);
        if (previous) {
          previous.pause();
          previous.muted = true;
        }
        setPlaying((current) => ({ ...current, [activeVideoId]: false }));
      }

      if (activeVideoId === item.id && !video.paused) {
        video.pause();
        setPlaying((current) => ({ ...current, [item.id]: false }));
        return;
      }

      setActiveVideoId(item.id);
      video.muted = false;
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => undefined);
      });
      setPlaying((current) => ({ ...current, [item.id]: true }));
    },
    [activeVideoId]
  );

  if (displayItems.length === 0) return null;

  return (
    <section className="explore-section-block explore-draggable-showcase-section" aria-labelledby="showcase-heading">
      <div className="explore-section-header showcase-header">
        <div className="explore-section-header-left">
          <span className="explore-section-kicker">{t("showcase.gallery.kicker")}</span>
          <h2 id="showcase-heading" className="explore-section-title">
            {t("showcase.gallery.title")}
          </h2>
        </div>
      </div>

      <div
        ref={containerRef}
        className="showcase-masonry-canvas"
        style={{ height: layout.totalHeight > 0 ? `${layout.totalHeight}px` : "auto" }}
        role="region"
        aria-label={t("showcase.gallery.aria")}
      >
        {layout.items.map((item) => {
          const position = {
            width: `${item.width}px`,
            height: `${item.height}px`,
            transform: `translate3d(${item.x}px, ${item.y}px, 0px)`,
            transition: CARD_TRANSITION
          };
          const titleBadge = item.title ? (
            <div className="showcase-card-top-bar">
              <span className="showcase-card-top-title" title={item.title}>
                {item.title}
              </span>
            </div>
          ) : null;

          if (item.mediaType === "video") {
            const isActive = activeVideoId === item.id;
            const isPlaying = isActive && (playing[item.id] ?? false);
            const actionLabel = isPlaying ? t("showcase.gallery.pause") : t("showcase.gallery.play");
            return (
              <div
                key={item.id}
                className={`showcase-card is-video ${isActive ? "is-active-video" : ""}`}
                style={position}
                role="button"
                tabIndex={0}
                aria-label={t("showcase.gallery.videoAria", { title: item.title, action: actionLabel })}
                onClick={() => toggleVideo(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleVideo(item);
                  }
                }}
              >
                <ShowcaseCardMedia
                  item={item}
                  isVideo
                  isActiveVideo={isActive}
                  videoRefCallback={(element) => {
                    if (element) videoRefs.current.set(item.id, element);
                    else videoRefs.current.delete(item.id);
                  }}
                />
                {titleBadge}
                <div className="showcase-card-bottom-bar">
                  <div className="showcase-bottom-spacer" />
                  <button
                    type="button"
                    className="showcase-action-icon-btn video-trigger-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleVideo(item);
                    }}
                    aria-label={actionLabel}
                    title={actionLabel}
                  >
                    {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
                  </button>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.slug ? `/products/${item.slug}` : "/products"}
              className="showcase-card is-image"
              style={position}
              aria-label={`${item.title} - ${t("action.viewDetails")}`}
            >
              <ShowcaseCardMedia item={item} isVideo={false} isActiveVideo={false} videoRefCallback={() => undefined} />
              {titleBadge}
              <div className="showcase-card-bottom-bar">
                <div className="showcase-bottom-spacer" />
                <span className="showcase-action-icon-btn details-link-btn" title={t("action.viewProductDetails")} aria-hidden="true">
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
