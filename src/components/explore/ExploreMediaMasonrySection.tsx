"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Pause, ArrowUpRight, Move, Package } from "lucide-react";
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

type DragState = {
  id: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  currentX: number;
  currentY: number;
  pointerId: number;
  tilt: number;
  hasMoved: boolean;
};

type ShowcaseCardMediaProps = {
  item: GalleryShowcaseItem;
  title: string;
  isVideo: boolean;
  isHeld: boolean;
  isCurrentActiveVideo: boolean;
  videoRefCallback: (el: HTMLVideoElement | null) => void;
};

function ShowcaseCardMedia({
  item,
  title,
  isVideo,
  isHeld,
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

  // 1. YouTube Video Showcase - paused by default, plays only when user activates
  if (isVideo && isYouTube && youtubeId) {
    // Only load the iframe when the user has explicitly clicked play
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
        {/* Poster image - always shown when paused, hidden behind iframe when playing */}
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

        {/* YouTube iframe - only mounted when playing */}
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
              pointerEvents: isHeld ? "none" : "auto",
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : null}

        <div className="showcase-card-scrim" aria-hidden="true" />
      </div>
    );
  }

  // 2. Direct MP4/Video File Showcase - paused by default
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
        <img
          src={activeSrc}
          alt={title}
          className="showcase-media-content showcase-image-element"
          style={{
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
        <div className="product-placeholder-content">
          <Package size={36} className="product-placeholder-icon" strokeWidth={1.5} />
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
  showcaseItems = [],
}: ExploreMediaMasonrySectionProps) {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1312);
  const [order, setOrder] = useState<string[]>(() => showcaseItems.map((item) => item.id));
  const [dragState, setDragState] = useState<DragState | null>(null);

  useEffect(() => {
    setOrder(showcaseItems.map((item) => item.id));
  }, [showcaseItems]);

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isPlayingMap, setIsPlayingMap] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const lastSwapTimeRef = useRef<number>(0);
  const itemMap = useMemo(() => new Map(showcaseItems.map((item) => [item.id, item])), [showcaseItems]);

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
    if (containerWidth <= 0 || showcaseItems.length === 0) {
      return { layoutItems: [], totalHeight: 0 };
    }

    const colW = Math.max(120, (containerWidth - gap * (cols - 1)) / cols);
    const colHeights = Array(cols).fill(0);
    const positioned: PositionedItem[] = [];

    for (const id of order) {
      const item = itemMap.get(id);
      if (!item) continue;

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
  }, [order, itemMap, containerWidth, cols, gap, showcaseItems.length]);

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

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, item: PositionedItem) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      setDragState({
        id: item.id,
        startX: e.clientX, startY: e.clientY,
        origX: item.x, origY: item.y,
        currentX: item.x, currentY: item.y,
        pointerId: e.pointerId, tilt: 0, hasMoved: false,
      });
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragState || dragState.pointerId !== e.pointerId) return;

      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      const distSq = dx * dx + dy * dy;
      const hasMoved = dragState.hasMoved || distSq > 25;
      const newX = dragState.origX + dx;
      const newY = dragState.origY + dy;
      const tilt = Math.max(-4, Math.min(4, dx * 0.08));

      setDragState((prev) => prev ? { ...prev, currentX: newX, currentY: newY, tilt, hasMoved } : null);

      if (!hasMoved) return;

      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (now - lastSwapTimeRef.current < 110) return;

      const currentHeld = layoutItems.find((p) => p.id === dragState.id);
      if (!currentHeld) return;

      const centerHeldX = newX + currentHeld.width / 2;
      const centerHeldY = newY + currentHeld.height / 2;

      let hitItem: PositionedItem | null = null;
      for (const it of layoutItems) {
        if (it.id === dragState.id) continue;
        const padX = it.width * 0.15;
        const padY = it.height * 0.15;
        if (
          centerHeldX >= it.x + padX && centerHeldX <= it.x + it.width - padX &&
          centerHeldY >= it.y + padY && centerHeldY <= it.y + it.height - padY
        ) {
          hitItem = it;
          break;
        }
      }

      if (hitItem) {
        lastSwapTimeRef.current = now;
        setOrder((prevOrder) => {
          const fromIdx = prevOrder.indexOf(dragState.id);
          const toIdx = prevOrder.indexOf(hitItem.id);
          if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return prevOrder;
          const updated = [...prevOrder];
          const [moved] = updated.splice(fromIdx, 1);
          updated.splice(toIdx, 0, moved);
          return updated;
        });
      }
    },
    [dragState, layoutItems]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, item: PositionedItem) => {
      if (!dragState || dragState.pointerId !== e.pointerId) return;
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch { /* ignore */ }

      const moved = dragState.hasMoved;
      setDragState(null);

      if (!moved && item.mediaType === "video") {
        toggleInCardVideo(item);
      }
    },
    [dragState, toggleInCardVideo]
  );

  if (showcaseItems.length === 0) return null;

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
        <div className="showcase-drag-hint" aria-hidden="true">
          <Move size={13} className="drag-hint-icon" />
          <span>{language === "bn" ? "ড্র্যাগ করে সাজান" : "Drag to rearrange"}</span>
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
          const isHeld = dragState?.id === item.id;
          const currentPosX = isHeld && dragState ? dragState.currentX : item.x;
          const currentPosY = isHeld && dragState ? dragState.currentY : item.y;
          const tilt = isHeld && dragState ? dragState.tilt : 0;
          const isVideo = item.mediaType === "video";
          const isCurrentActiveVideo = activeVideoId === item.id;
          const isPlaying = isPlayingMap[item.id] ?? false;
          const title = item.title;

          return (
            <div
              key={item.id}
              className={`showcase-card ${isHeld ? "is-held" : ""} ${isVideo ? "is-video" : "is-image"} ${isCurrentActiveVideo ? "is-active-video" : ""}`}
              style={{
                width: `${item.width}px`,
                height: `${item.height}px`,
                transform: `translate3d(${currentPosX}px, ${currentPosY}px, 0px) scale(${isHeld ? 1.05 : 1}) rotate(${tilt}deg)`,
                zIndex: isHeld ? 50 : 1,
                transition: isHeld
                  ? "box-shadow 150ms ease, opacity 150ms ease"
                  : "transform 380ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 250ms ease, width 200ms ease, height 200ms ease",
              }}
              onPointerDown={(e) => handlePointerDown(e, item)}
              onPointerMove={handlePointerMove}
              onPointerUp={(e) => handlePointerUp(e, item)}
              onPointerCancel={(e) => handlePointerUp(e, item)}
              role="button"
              tabIndex={0}
              aria-label={`${title} (${isVideo ? "Video" : "Image"}) - Click to play or view details`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (isVideo) toggleInCardVideo(item);
                }
              }}
            >
              <ShowcaseCardMedia
                item={item}
                title={title}
                isVideo={isVideo}
                isHeld={isHeld}
                isCurrentActiveVideo={isCurrentActiveVideo}
                videoRefCallback={(el) => {
                  if (el) videoRefs.current.set(item.id, el);
                  else videoRefs.current.delete(item.id);
                }}
              />

              {title ? (
                <div className="showcase-card-top-bar">
                  <span className="showcase-card-top-title" title={title}>{title}</span>
                </div>
              ) : null}

              <div className="showcase-card-bottom-bar">
                <div className="showcase-bottom-spacer" />
                {isVideo ? (
                  <button
                    type="button"
                    className="showcase-action-icon-btn video-trigger-btn"
                    onClick={(e) => { e.stopPropagation(); toggleInCardVideo(item); }}
                    aria-label={isCurrentActiveVideo && isPlaying ? "Pause video" : "Play video"}
                    title={isCurrentActiveVideo && isPlaying ? "Pause" : "Play"}
                  >
                    {isCurrentActiveVideo && isPlaying ? (
                      <Pause size={15} fill="currentColor" />
                    ) : (
                      <Play size={15} fill="currentColor" />
                    )}
                  </button>
                ) : item.slug ? (
                  <Link
                    href={`/products/${item.slug}`}
                    className="showcase-action-icon-btn details-link-btn"
                    aria-label={`View details for ${title}`}
                    title="View Product Details"
                    onClick={(e) => { if (dragState?.hasMoved) e.preventDefault(); }}
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}



