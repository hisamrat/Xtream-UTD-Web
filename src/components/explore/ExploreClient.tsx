"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductArtwork } from "@/components/products/ProductArtwork";
import { useLanguage } from "@/components/site/LanguageProvider";
import { HomeFeaturesSection } from "@/components/home/HomeFeaturesSection";
import { ExploreTopSellingSection } from "./ExploreTopSellingSection";
import { ExploreMediaMasonrySection } from "./ExploreMediaMasonrySection";
import { ExploreReviewsSection } from "./ExploreReviewsSection";
import type { Product } from "@/lib/product-schema";
import type { GalleryShowcaseItem } from "@/lib/gallery-schema";

export type ExploreClientProps = {
  products: Product[];
  showcaseItems?: GalleryShowcaseItem[];
};

type ViewportSize = {
  width: number;
  height: number;
};

const CAROUSEL_PERSPECTIVE = 1400;
const VISIBLE_RANGE = 7.5;
const CAROUSEL_EASE = 0.14;
const dragThreshold = 7;

export function ExploreClient({ products, showcaseItems = [] }: ExploreClientProps) {
  const router = useRouter();
  const { t, tCategory } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [viewportSize, setViewportSize] = useState<ViewportSize>({ width: 1440, height: 900 });
  const [isPaused, setIsPaused] = useState(false);

  const cameraSlotTargetRef = useRef(0);
  const cameraSlotCurrentRef = useRef(0);
  const plateNodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const lastInputTimeRef = useRef(0);
  const lastUserInteractionTimeRef = useRef(Date.now());

  // Mouse-drag state (desktop only — touch users scroll normally)
  const mouseDragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    lastX: number;
    distance: number;
    isHorizontal: boolean | null;
  }>({ active: false, startX: 0, startY: 0, lastX: 0, distance: 0, isHorizontal: null });

  // Ensure continuous ribbon of at least 18 cards
  const carouselProducts = useMemo(() => {
    if (products.length === 0) return [];
    let list = [...products];
    while (list.length < 18) {
      list = [...list, ...products];
    }
    return list;
  }, [products]);

  const cardHeight = useMemo(() => {
    const maxAvailableH = Math.max(240, viewportSize.height - 180);
    if (viewportSize.width < 700) {
      return Math.min(maxAvailableH, Math.min(500, Math.max(340, Math.round(viewportSize.height * 0.58))));
    }
    if (viewportSize.width < 1024) {
      return Math.min(maxAvailableH, Math.min(480, Math.max(340, Math.round(viewportSize.height * 0.55))));
    }
    if (viewportSize.width < 1440) {
      return Math.min(maxAvailableH, Math.min(550, Math.max(390, Math.round(viewportSize.height * 0.61))));
    }
    return Math.min(maxAvailableH, Math.min(620, Math.max(440, Math.round(viewportSize.height * 0.65))));
  }, [viewportSize.width, viewportSize.height]);

  const cardWidth = useMemo(() => {
    const targetW = Math.round(cardHeight * 0.76);
    if (viewportSize.width < 700) {
      return Math.min(380, Math.max(260, Math.round(viewportSize.width * 0.82)));
    }
    if (viewportSize.width < 1024) {
      return Math.min(365, Math.max(260, targetW));
    }
    if (viewportSize.width < 1440) {
      return Math.min(418, Math.max(295, targetW));
    }
    return Math.min(470, Math.max(330, targetW));
  }, [cardHeight, viewportSize.width]);

  const cardGapPx = useMemo(() => {
    if (viewportSize.width < 700) return 10;
    if (viewportSize.width < 1024) return 12;
    return 14;
  }, [viewportSize.width]);

  useEffect(() => {
    setMounted(true);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    router.prefetch("/");
    router.prefetch("/products");

    const updateViewport = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    const updatePaused = () => {
      setIsPaused(document.hidden || document.body.classList.contains("modal-open"));
    };

    updateViewport();
    updatePaused();
    window.addEventListener("resize", updateViewport);
    document.addEventListener("visibilitychange", updatePaused);
    return () => {
      window.removeEventListener("resize", updateViewport);
      document.removeEventListener("visibilitychange", updatePaused);
    };
  }, [router]);

  const handlePrev = useCallback(() => {
    lastUserInteractionTimeRef.current = Date.now();
    lastInputTimeRef.current = Date.now();
    cameraSlotTargetRef.current -= 1.0;
  }, []);

  const handleNext = useCallback(() => {
    lastUserInteractionTimeRef.current = Date.now();
    lastInputTimeRef.current = Date.now();
    cameraSlotTargetRef.current += 1.0;
  }, []);

  // Listen to navigation events from BottomSwitch dock
  useEffect(() => {
    const onPrev = () => handlePrev();
    const onNext = () => handleNext();
    const onReload = () => {
      lastUserInteractionTimeRef.current = Date.now();
      lastInputTimeRef.current = Date.now();
      cameraSlotTargetRef.current += 1.0;
    };

    window.addEventListener("xtream-utd:explore-prev", onPrev);
    window.addEventListener("xtream-utd:explore-next", onNext);
    window.addEventListener("xtream-utd:world-reload", onReload);

    return () => {
      window.removeEventListener("xtream-utd:explore-prev", onPrev);
      window.removeEventListener("xtream-utd:explore-next", onNext);
      window.removeEventListener("xtream-utd:world-reload", onReload);
    };
  }, [handlePrev, handleNext]);

  // Autoplay engine: advances when user is idle for >= 3.2s
  useEffect(() => {
    if (!mounted || isPaused) return;
    const interval = window.setInterval(() => {
      const now = Date.now();
      if (now - lastUserInteractionTimeRef.current >= 3200 && !mouseDragRef.current.active) {
        cameraSlotTargetRef.current += 1.0;
      }
    }, 3200);
    return () => window.clearInterval(interval);
  }, [mounted, isPaused]);

  const [isReady, setIsReady] = useState(false);

  // Frame Loop (Momentum & Math placement)
  useEffect(() => {
    let rafId: number;

    const place = (node: HTMLDivElement | null, d: number) => {
      if (!node) return;
      const absD = Math.abs(d);

      if (absD > VISIBLE_RANGE) {
        node.style.visibility = "hidden";
        node.style.opacity = "0";
        node.style.pointerEvents = "none";
        return;
      }

      let scale: number;
      let integratedW: number;

      if (absD <= 1.0) {
        scale = 0.48 + 0.52 * Math.pow(Math.cos((absD * Math.PI) / 2), 2);
        integratedW = cardWidth * (0.74 * absD + (0.26 / Math.PI) * Math.sin(Math.PI * absD));
      } else {
        const excess = absD - 1.0;
        scale = 0.48 * Math.pow(0.66, excess);
        integratedW = cardWidth * (0.74 + 1.1553 * (1 - Math.pow(0.66, excess)));
      }

      const sign = d >= 0 ? 1 : -1;
      const x = sign * (integratedW + absD * cardGapPx);
      const y = 0;
      const z = -absD * 18;
      const rotateY = -sign * Math.min(14, absD * 3.4);
      const opacity = absD <= 5.5 ? Math.pow(Math.cos((absD * Math.PI) / 11), 2) : 0;
      const blur = absD <= 0.4 ? 0 : Math.min(6.0, (absD - 0.4) * 1.4);
      const zIndex = Math.round(100 - absD * 8);

      const hudOpacity = Math.max(0, Math.min(1, 1 - absD * 1.8));
      node.style.setProperty("--hud-opacity", hudOpacity.toFixed(3));
      node.style.setProperty("--hud-pointer", hudOpacity > 0.75 ? "auto" : "none");

      node.style.visibility = "visible";
      node.style.opacity = opacity.toFixed(3);
      node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      node.style.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "none";
      node.style.zIndex = String(zIndex);
      node.style.pointerEvents = opacity > 0.2 ? "auto" : "none";
    };

    const count = carouselProducts.length;
    if (count > 0) {
      const initialPos = cameraSlotCurrentRef.current;
      for (let i = 0; i < count; i += 1) {
        let d = (i - initialPos) % count;
        while (d > count / 2) d -= count;
        while (d < -count / 2) d += count;
        place(plateNodesRef.current[i], d);
      }
      setIsReady(true);
    }

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (count < 2) return;

      if (Date.now() - lastInputTimeRef.current > 140) {
        const nearest = Math.round(cameraSlotTargetRef.current);
        cameraSlotTargetRef.current += (nearest - cameraSlotTargetRef.current) * 0.12;
      }

      cameraSlotCurrentRef.current += (cameraSlotTargetRef.current - cameraSlotCurrentRef.current) * CAROUSEL_EASE;
      const position = cameraSlotCurrentRef.current;

      const focusIndex = ((Math.round(position) % count) + count) % count;
      const activeProd = carouselProducts[focusIndex];
      if (activeProd && activeProd.accent && bgRef.current) {
        bgRef.current.style.setProperty("--active-tint", activeProd.accent);
      }

      for (let i = 0; i < count; i += 1) {
        let d = (i - position) % count;
        while (d > count / 2) d -= count;
        while (d < -count / 2) d += count;
        place(plateNodesRef.current[i], d);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [carouselProducts, cardGapPx, cardWidth, cardHeight]);

  // ──────────────────────────────────────────────
  // Desktop-only mouse drag (does NOT block scroll)
  // Touch users scroll naturally — arrows navigate
  // ──────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    lastUserInteractionTimeRef.current = Date.now();
    mouseDragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      distance: 0,
      isHorizontal: null,
    };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const drag = mouseDragRef.current;
    if (!drag.active) return;
    lastUserInteractionTimeRef.current = Date.now();
    lastInputTimeRef.current = Date.now();
    const dx = e.clientX - drag.lastX;
    drag.distance += Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY);
    drag.lastX = e.clientX;
    cameraSlotTargetRef.current -= dx * 0.0035;
  }, []);

  const onMouseUp = useCallback(() => {
    mouseDragRef.current.active = false;
  }, []);

  const handleCardClick = useCallback(
    (product: Product, index: number) => {
      lastUserInteractionTimeRef.current = Date.now();
      if (mouseDragRef.current.distance > dragThreshold) return;

      const count = carouselProducts.length;
      let d = (index - cameraSlotCurrentRef.current) % count;
      while (d > count / 2) d -= count;
      while (d < -count / 2) d += count;

      if (Math.abs(d) < 0.65) {
        router.push(`/products/${product.slug}`);
      } else {
        lastInputTimeRef.current = Date.now();
        cameraSlotTargetRef.current += d;
      }
    },
    [carouselProducts.length, router]
  );

  if (!mounted) {
    return (
      <main className="explore-main" aria-label="Loading explore showcase">
        <section className="explore-carousel-section world-shell reference-showcase is-in-carousel is-loading" aria-label="3D Product Explore Carousel">
          <div className="scale-carousel-viewport" style={{ perspective: `${CAROUSEL_PERSPECTIVE}px`, perspectiveOrigin: "50% 50%" }}>
            <div className="scale-carousel-bg" aria-hidden="true">
              <div className="bg-blob-a" />
              <div className="bg-blob-b" />
            </div>
          </div>
        </section>
        <div className="explore-extra-sections">
          <HomeFeaturesSection />
          <ExploreTopSellingSection products={products} />
          <ExploreMediaMasonrySection showcaseItems={showcaseItems} />
          <ExploreReviewsSection />
        </div>
      </main>
    );
  }

  return (
    <main className="explore-main">
      {/* ------------------------------------------------------------- */}
      {/* 1. 3D Scale Carousel Section (Explore)                        */}
      {/* ------------------------------------------------------------- */}
      <section
        className={`explore-carousel-section world-shell reference-showcase is-in-carousel ${isReady ? "is-ready" : "is-loading"}`}
        aria-label="3D Product Explore Carousel"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Ambient Glow Background */}
        <div className="scale-carousel-viewport" style={{ perspective: `${CAROUSEL_PERSPECTIVE}px`, perspectiveOrigin: "50% 50%" }}>
          <div className="scale-carousel-bg" ref={bgRef} aria-hidden="true">
            <div className="bg-blob-a" />
            <div className="bg-blob-b" />
          </div>

          {/* Cards Container */}
          <div className="scale-carousel-plates-container">
            {carouselProducts.map((product, i) => (
              <div
                key={`explore-card-${product.id}-${i}`}
                ref={(el) => {
                  plateNodesRef.current[i] = el;
                }}
                className="scale-carousel-card-slot"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: cardWidth,
                  height: cardHeight,
                  marginLeft: -cardWidth / 2,
                  marginTop: -cardHeight / 2 - 14,
                  overflow: "visible",
                  backfaceVisibility: "hidden",
                  visibility: "hidden",
                  opacity: 0,
                  willChange: "transform, opacity, filter"
                }}
              >
                {/* Top Product Title (Outside / Above Card) */}
                <div className="carousel-focus-top carousel-card-hud">
                  <span className="carousel-focus-title">{product.title}</span>
                </div>

                {/* The Clean Media Artwork Card */}
                <div
                  className="scale-carousel-card"
                  style={
                    {
                      "--product-accent": product.accent || "#8b5cf6",
                      width: "100%",
                      height: "100%"
                    } as CSSProperties
                  }
                  onClick={() => handleCardClick(product, i)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${product.title}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCardClick(product, i);
                    }
                  }}
                >
                  <div className="scale-carousel-media">
                    <div className="scale-carousel-art-wrap">
                      <ProductArtwork product={product} />
                    </div>
                  </div>
                </div>

                {/* Bottom Category Badge (Outside / Below Card) */}
                <div className="carousel-focus-bottom carousel-card-hud">
                  <span className="carousel-focus-category">{tCategory(product.category)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Left / Right Arrow Nav (always visible, primary nav for all screen sizes) */}
        <button
          type="button"
          className="carousel-arrow-btn carousel-arrow-prev"
          onClick={handlePrev}
          aria-label="Previous product"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          className="carousel-arrow-btn carousel-arrow-next"
          onClick={handleNext}
          aria-label="Next product"
        >
          <ChevronRight size={22} strokeWidth={2.5} />
        </button>

        {/* Instructions HUD (desktop only) */}
        <div className="world-instructions" aria-hidden="true">
          {t("click_to_view_detail")}
          <br />
          {t("reload_to_reset")}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. Extra Sections: Features, Top Selling, Customer Reviews   */}
      {/* ------------------------------------------------------------- */}
      <div className="explore-extra-sections">
        <HomeFeaturesSection />
        <ExploreTopSellingSection products={products} />
        <ExploreMediaMasonrySection showcaseItems={showcaseItems} />
        <ExploreReviewsSection />
      </div>
    </main>
  );
}
