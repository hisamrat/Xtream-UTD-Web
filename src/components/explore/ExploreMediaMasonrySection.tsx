"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Pause, ArrowUpRight, Move } from "lucide-react";
import { useLanguage } from "@/components/site/LanguageProvider";
import type { Product } from "@/lib/product-schema";

export type ShowcaseItem = {
  id: string;
  kind: "video" | "image";
  title: {
    en: string;
    bn: string;
  };
  category: "camera" | "audio" | "studio" | "lighting" | "gear";
  ratio: number; // width / height, e.g. 4/5 = 0.8, 1/1 = 1, 3/2 = 1.5, 2/3 = 0.667
  imageUrl: string;
  videoSrc?: string;
  youtubeId?: string;
  productSlug?: string;
  price?: number;
};

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "showcase-1",
    kind: "video",
    title: {
      en: "Sony A7 IV Hybrid Cinema",
      bn: "সোনি এ৭ ৪ হাইব্রিড সিনেমা"
    },
    category: "camera",
    ratio: 4 / 5,
    imageUrl: "/products/sony-a7-iv/cover.jpg",
    videoSrc: "https://framerusercontent.com/assets/OevNeIH8dSgSBVEi6nEZyi5pRJU.mp4",
    youtubeId: "aL5qS3E4Lq8",
    productSlug: "sony-a7-iv",
    price: 235000
  },
  {
    id: "showcase-2",
    kind: "image",
    title: {
      en: "Sennheiser HD 660S",
      bn: "সেনহাইজার এইচডি ৬৬০এস"
    },
    category: "audio",
    ratio: 1,
    imageUrl: "/products/sennheiser-hd-660s/cover.jpg",
    productSlug: "sennheiser-hd-660s",
    price: 46000
  },
  {
    id: "showcase-3",
    kind: "video",
    title: {
      en: "DJI RS 3 Pro Stabilizer",
      bn: "ডিজেআই আরএস ৩ প্রো"
    },
    category: "studio",
    ratio: 2 / 3,
    imageUrl: "/products/dji-rs-3-pro/cover.jpg",
    videoSrc: "https://framerusercontent.com/assets/dClAqDx2W8igpK6WWr06wAwO54.mp4",
    youtubeId: "FzG4uDgje3M",
    productSlug: "dji-rs-3-pro",
    price: 89000
  },
  {
    id: "showcase-4",
    kind: "video",
    title: {
      en: "Blackmagic Cinema 6K Pro",
      bn: "ব্ল্যাকম্যাজিক সিনেমা ৬কে প্রো"
    },
    category: "camera",
    ratio: 4 / 5,
    imageUrl: "/products/blackmagic-pocket-cinema-6k/cover.jpg",
    videoSrc: "https://framerusercontent.com/assets/xAPtScp7qNyCLLiS5XDstx18.mp4",
    youtubeId: "xqyUdNXb4tU",
    productSlug: "blackmagic-pocket-cinema-6k",
    price: 320000
  },
  {
    id: "showcase-5",
    kind: "image",
    title: {
      en: "Sony FE Prime & G-Master",
      bn: "সোনি প্রাইম লেন্স কিট"
    },
    category: "camera",
    ratio: 3 / 2,
    imageUrl: "/products/sony-a7-iv/01.jpg",
    productSlug: "sony-a7-iv",
    price: 145000
  },
  {
    id: "showcase-6",
    kind: "image",
    title: {
      en: "Creator Studio Desk",
      bn: "ক্রিয়েটর স্টুডিও ডেস্ক"
    },
    category: "studio",
    ratio: 4 / 5,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
    productSlug: "sennheiser-hd-660s",
    price: 85000
  },
  {
    id: "showcase-7",
    kind: "image",
    title: {
      en: "DJI Pro Transmission",
      bn: "ডিজেআই প্রো ট্রান্সমিশন"
    },
    category: "gear",
    ratio: 1,
    imageUrl: "/products/dji-rs-3-pro/01.jpg",
    productSlug: "dji-rs-3-pro",
    price: 58000
  },
  {
    id: "showcase-8",
    kind: "image",
    title: {
      en: "Precision Transducer Core",
      bn: "প্রিসিশন ট্রান্সডিউসার"
    },
    category: "audio",
    ratio: 3 / 4,
    imageUrl: "/products/sennheiser-hd-660s/01.jpg",
    productSlug: "sennheiser-hd-660s",
    price: 46000
  },
  {
    id: "showcase-9",
    kind: "image",
    title: {
      en: "Custom Anamorphic Rig",
      bn: "কাস্টম অ্যানামরফিক রিগ"
    },
    category: "camera",
    ratio: 3 / 2,
    imageUrl: "/products/blackmagic-pocket-cinema-6k/01.jpg",
    productSlug: "blackmagic-pocket-cinema-6k",
    price: 320000
  },
  {
    id: "showcase-10",
    kind: "image",
    title: {
      en: "Continuous Key Light",
      bn: "স্টুডিও কি-লাইট"
    },
    category: "lighting",
    ratio: 1,
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80",
    productSlug: "sony-a7-iv",
    price: 42000
  },
  {
    id: "showcase-11",
    kind: "image",
    title: {
      en: "Broadcast Audio Hub",
      bn: "ব্রডকাস্ট অডিও হাব"
    },
    category: "audio",
    ratio: 4 / 5,
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80",
    productSlug: "sennheiser-hd-660s",
    price: 72000
  },
  {
    id: "showcase-12",
    kind: "image",
    title: {
      en: "Location Field Bag",
      bn: "ফিল্ড ক্যামেরা ব্যাগ"
    },
    category: "gear",
    ratio: 1,
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80",
    productSlug: "dji-rs-3-pro",
    price: 35000
  }
];

type PositionedItem = ShowcaseItem & {
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

type ExploreMediaMasonrySectionProps = {
  products?: Product[];
};

export function ExploreMediaMasonrySection({ products: _products = [] }: ExploreMediaMasonrySectionProps) {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1312);
  const [order, setOrder] = useState<string[]>(() => SHOWCASE_ITEMS.map((item) => item.id));
  const [dragState, setDragState] = useState<DragState | null>(null);
  
  // Track active in-card video state: which card is unmuted/playing
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isPlayingMap, setIsPlayingMap] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const lastSwapTimeRef = useRef<number>(0);
  const itemMap = useMemo(() => new Map(SHOWCASE_ITEMS.map((item) => [item.id, item])), []);

  // Measure container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleResize = () => {
      const w = el.clientWidth || el.getBoundingClientRect().width;
      if (w > 0) {
        setContainerWidth(w);
      }
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

  // Column count and layout geometry
  const gap = 16;
  const cols = useMemo(() => {
    if (containerWidth < 640) return 2;
    if (containerWidth < 1024) return 3;
    return 4;
  }, [containerWidth]);

  // Compute masonry layout positions
  const { layoutItems, totalHeight } = useMemo(() => {
    if (containerWidth <= 0) {
      return { layoutItems: [], totalHeight: 0 };
    }

    const colW = Math.max(120, (containerWidth - gap * (cols - 1)) / cols);
    const colHeights = Array(cols).fill(0);
    const positioned: PositionedItem[] = [];

    for (const id of order) {
      const item = itemMap.get(id);
      if (!item) continue;

      // Find shortest column
      let minCol = 0;
      for (let c = 1; c < cols; c++) {
        if (colHeights[c] < colHeights[minCol] - 0.5) {
          minCol = c;
        }
      }

      const h = Math.round(colW / item.ratio);
      const x = minCol * (colW + gap);
      const y = colHeights[minCol];

      positioned.push({
        ...item,
        x,
        y,
        width: colW,
        height: h,
        colIndex: minCol
      });

      colHeights[minCol] += h + gap;
    }

    const maxH = Math.max(...colHeights);
    return {
      layoutItems: positioned,
      totalHeight: Math.max(0, maxH - gap)
    };
  }, [order, itemMap, containerWidth, cols, gap]);

  // Toggle in-card video playback with audio
  const toggleInCardVideo = useCallback((item: ShowcaseItem) => {
    const videoEl = videoRefs.current.get(item.id);
    if (!videoEl) return;

    if (activeVideoId === item.id) {
      if (videoEl.paused) {
        videoEl.play().catch(() => {});
        setIsPlayingMap((prev) => ({ ...prev, [item.id]: true }));
      } else {
        videoEl.pause();
        setIsPlayingMap((prev) => ({ ...prev, [item.id]: false }));
      }
    } else {
      if (activeVideoId) {
        const prevVideo = videoRefs.current.get(activeVideoId);
        if (prevVideo) {
          prevVideo.muted = true;
        }
      }
      setActiveVideoId(item.id);
      videoEl.muted = false;
      videoEl.play().catch(() => {
        videoEl.muted = true;
        videoEl.play().catch(() => {});
      });
      setIsPlayingMap((prev) => ({ ...prev, [item.id]: true }));
    }
  }, [activeVideoId]);

  // Pointer Handlers for Dragging & Swapping
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, item: PositionedItem) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const target = e.currentTarget;

      try {
        target.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      setDragState({
        id: item.id,
        startX: e.clientX,
        startY: e.clientY,
        origX: item.x,
        origY: item.y,
        currentX: item.x,
        currentY: item.y,
        pointerId: e.pointerId,
        tilt: 0,
        hasMoved: false
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

      const hasMoved = dragState.hasMoved || distSq > 25; // 5px threshold
      const newX = dragState.origX + dx;
      const newY = dragState.origY + dy;
      const tilt = Math.max(-4, Math.min(4, dx * 0.08));

      setDragState((prev) =>
        prev
          ? {
              ...prev,
              currentX: newX,
              currentY: newY,
              tilt,
              hasMoved
            }
          : null
      );

      if (!hasMoved) return;

      // Real-time Collision Detection & Slot Swapping
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (now - lastSwapTimeRef.current < 110) return;

      const currentHeld = layoutItems.find((p) => p.id === dragState.id);
      if (!currentHeld) return;

      const centerHeldX = newX + currentHeld.width / 2;
      const centerHeldY = newY + currentHeld.height / 2;

      let hitItem: PositionedItem | null = null;
      for (const item of layoutItems) {
        if (item.id === dragState.id) continue;
        const padX = item.width * 0.15;
        const padY = item.height * 0.15;
        if (
          centerHeldX >= item.x + padX &&
          centerHeldX <= item.x + item.width - padX &&
          centerHeldY >= item.y + padY &&
          centerHeldY <= item.y + item.height - padY
        ) {
          hitItem = item;
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
      } catch {
        // ignore
      }

      const moved = dragState.hasMoved;
      setDragState(null);

      // If clicked without dragging
      if (!moved) {
        if (item.kind === "video") {
          toggleInCardVideo(item);
        }
      }
    },
    [dragState, toggleInCardVideo]
  );

  return (
    <section className="explore-section-block explore-draggable-showcase-section" aria-labelledby="showcase-heading">
      {/* Section Header */}
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

        {/* Drag to rearrange Section Header Text */}
        <div className="showcase-drag-hint" aria-hidden="true">
          <Move size={13} className="drag-hint-icon" />
          <span>{language === "bn" ? "ড্র্যাগ করে সাজান" : "Drag to rearrange"}</span>
        </div>
      </div>

      {/* Masonry Canvas Container */}
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
          const isVideo = item.kind === "video";
          const isCurrentActiveVideo = activeVideoId === item.id;
          const isPlaying = isPlayingMap[item.id] ?? true;
          const title = item.title[language] ?? item.title.en;

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
                  : "transform 380ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 250ms ease, width 200ms ease, height 200ms ease"
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
                  if (isVideo) {
                    toggleInCardVideo(item);
                  }
                }
              }}
            >
              {/* Media Visual Layer */}
              <div className="showcase-card-media" style={{ position: "relative", width: "100%", height: "100%" }}>
                {isVideo && item.videoSrc ? (
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current.set(item.id, el);
                      else videoRefs.current.delete(item.id);
                    }}
                    src={item.videoSrc}
                    poster={item.imageUrl}
                    autoPlay
                    loop
                    muted={!isCurrentActiveVideo}
                    playsInline
                    preload="metadata"
                    className="showcase-media-content showcase-video-element"
                  />
                ) : (
                  <Image
                    src={item.imageUrl}
                    alt={title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="showcase-media-content showcase-image-element"
                    loading="lazy"
                    draggable={false}
                  />
                )}
                <div className="showcase-card-scrim" aria-hidden="true" />
              </div>

              {/* TOP HEADER: ONLY Title in Top Center of Card */}
              <div className="showcase-card-top-bar">
                <span className="showcase-card-top-title" title={title}>
                  {title}
                </span>
              </div>

              {/* BOTTOM RIGHT ONLY: Round Circular Action Icon for Details or Video Play/Pause */}
              <div className="showcase-card-bottom-bar">
                <div className="showcase-bottom-spacer" />

                {isVideo ? (
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
                ) : item.productSlug ? (
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="showcase-action-icon-btn details-link-btn"
                    aria-label={`View details for ${title}`}
                    title="View Product Details"
                    onClick={(e) => {
                      if (dragState?.hasMoved) {
                        e.preventDefault();
                      }
                    }}
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
