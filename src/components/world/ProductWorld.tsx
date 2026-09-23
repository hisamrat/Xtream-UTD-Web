"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { ProductArtwork } from "@/components/products/ProductArtwork";
import { useLanguage } from "@/components/site/LanguageProvider";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/product-schema";

type ProductWorldProps = {
  products: Product[];
};

type ViewportSize = {
  width: number;
  height: number;
};

type PointerState = {
  active: boolean;
  x: number;
  y: number;
  startX: number;
  startY: number;
  distance: number;
  startRotateX: number;
  startRotateY: number;
};

type ShowcaseCardKind = "mini" | "medium" | "feature" | "hero";

type WorldViewState = {
  rotateX: number;
  rotateY: number;
  zoom: number;
  parallaxX: number;
  parallaxY: number;
  dragging: boolean;
};

type ReferenceShowcaseSlot = {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  kind: ShowcaseCardKind;
  opacity?: number;
  rotate?: number;
  scale?: number;
  floatX?: number;
  floatY?: number;
  floatRotate?: number;
  delay?: number;
  duration?: number;
};

type ShowcaseBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

const dragThreshold = 7;

const desktopReferenceSlots: ReferenceShowcaseSlot[] = [
  // Center Column (Hero, Top, Bottom)
  slot(0, 0, 224, 264, 100, "hero", { floatY: -8 }),
  slot(0, -270, 172, 186, 62, "feature", { floatY: -7 }),
  slot(0, 270, 172, 186, 54, "feature", { floatY: -7 }),

  // Left Side (Tier 1, Tier 2, Tier 3 - Matching Placement)
  slot(-245, -185, 172, 186, 58, "feature", { floatY: -7 }),
  slot(-245, 90, 172, 186, 59, "feature", { floatY: -7 }),
  slot(-245, 320, 160, 174, 35, "medium", { opacity: 0.94, floatY: -5 }),
  slot(-475, -175, 160, 174, 35, "medium", { opacity: 0.94, floatY: -5 }),
  slot(-475, 68, 172, 186, 50, "feature", { floatY: -6 }),
  slot(-475, 300, 160, 174, 33, "medium", { opacity: 0.94, floatY: -5 }),
  slot(-685, -28, 154, 168, 34, "medium", { opacity: 0.94, floatY: -5 }),

  // Right Side (Tier 1, Tier 2, Tier 3 - Matching Placement)
  slot(245, -185, 172, 186, 58, "feature", { floatY: -7 }),
  slot(245, 90, 172, 186, 59, "feature", { floatY: -7 }),
  slot(245, 320, 160, 174, 35, "medium", { opacity: 0.94, floatY: -5 }),
  slot(475, -175, 160, 174, 35, "medium", { opacity: 0.94, floatY: -5 }),
  slot(475, 68, 172, 186, 50, "feature", { floatY: -6 }),
  slot(475, 300, 160, 174, 33, "medium", { opacity: 0.94, floatY: -5 }),
  slot(685, -28, 154, 168, 34, "medium", { opacity: 0.94, floatY: -5 }),

  // Surrounding Mini Floating Badges (62x62) in clear interstitial channels
  slot(-125, -165, 62, 62, 28, "mini", { opacity: 0.94 }),
  slot(125, -165, 62, 62, 28, "mini", { opacity: 0.94 }),
  slot(-125, 165, 62, 62, 28, "mini", { opacity: 0.94 }),
  slot(125, 165, 62, 62, 28, "mini", { opacity: 0.94 }),
  slot(-245, -48, 62, 62, 26, "mini", { opacity: 0.92 }),
  slot(245, -48, 62, 62, 26, "mini", { opacity: 0.92 }),
  slot(-360, -65, 62, 62, 26, "mini", { opacity: 0.92 }),
  slot(360, -65, 62, 62, 26, "mini", { opacity: 0.92 }),
  slot(-360, 210, 62, 62, 24, "mini", { opacity: 0.9 }),
  slot(360, 210, 62, 62, 24, "mini", { opacity: 0.9 }),
  slot(-360, -315, 62, 62, 24, "mini", { opacity: 0.9 }),
  slot(360, -315, 62, 62, 24, "mini", { opacity: 0.9 }),
  slot(-585, -180, 62, 62, 22, "mini", { opacity: 0.88 }),
  slot(585, -180, 62, 62, 22, "mini", { opacity: 0.88 }),
  slot(-585, 200, 62, 62, 22, "mini", { opacity: 0.88 }),
  slot(585, 200, 62, 62, 22, "mini", { opacity: 0.88 }),
  slot(-685, -155, 62, 62, 20, "mini", { opacity: 0.86 }),
  slot(685, -155, 62, 62, 20, "mini", { opacity: 0.86 }),
  slot(-685, 105, 62, 62, 20, "mini", { opacity: 0.86 }),
  slot(685, 105, 62, 62, 20, "mini", { opacity: 0.86 }),
  slot(-795, -28, 62, 62, 18, "mini", { opacity: 0.84 }),
  slot(795, -28, 62, 62, 18, "mini", { opacity: 0.84 })
];

const mobileReferenceSlots: ReferenceShowcaseSlot[] = [
  // Center Column (3 cards)
  slot(0, 0, 192, 236, 80, "hero", { floatY: -7 }),
  slot(0, -280, 158, 172, 52, "feature", { floatY: -6 }),
  slot(0, 280, 158, 172, 48, "feature", { floatY: -6 }),

  // Left Column (X = -195, 3 cards)
  slot(-195, -195, 148, 160, 46, "medium", { floatY: -5 }),
  slot(-195, 90, 148, 160, 47, "medium", { floatY: -6 }),
  slot(-195, 320, 142, 154, 38, "medium", { opacity: 0.94, floatY: -5 }),

  // Right Column (X = 195, 3 cards)
  slot(195, -195, 148, 160, 46, "medium", { floatY: -5 }),
  slot(195, 90, 148, 160, 47, "medium", { floatY: -6 }),
  slot(195, 320, 142, 154, 38, "medium", { opacity: 0.94, floatY: -5 }),

  // Mini Badges (56x56)
  slot(-195, -55, 56, 56, 22, "mini", { opacity: 0.92 }),
  slot(195, -55, 56, 56, 22, "mini", { opacity: 0.92 }),
  slot(-195, 205, 56, 56, 20, "mini", { opacity: 0.9 }),
  slot(195, 205, 56, 56, 20, "mini", { opacity: 0.9 }),
  slot(-300, -195, 56, 56, 18, "mini", { opacity: 0.88 }),
  slot(-300, 90, 56, 56, 18, "mini", { opacity: 0.88 }),
  slot(300, 90, 56, 56, 18, "mini", { opacity: 0.88 })
];

export function ProductWorld({ products }: ProductWorldProps) {
  const router = useRouter();
  const { t, formatNumber, tCategory } = useLanguage();
  const prioritizedProducts = useMemo(() => prioritizeWorldProducts(products), [products]);
  const [mounted, setMounted] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const [viewportSize, setViewportSize] = useState<ViewportSize>({ width: 1440, height: 1120 });
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [worldPaused, setWorldPaused] = useState(false);
  const [worldView, setWorldView] = useState<WorldViewState>({
    rotateX: 0,
    rotateY: 0,
    zoom: 1,
    parallaxX: 0,
    parallaxY: 0,
    dragging: false
  });
  const [productSetIndex, setProductSetIndex] = useState(0);

  const isNavigatingRef = useRef(false);
  const [isNavigatingToExplore, setIsNavigatingToExplore] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const pointerRef = useRef<PointerState>({
    active: false,
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    distance: 0,
    startRotateX: 0,
    startRotateY: 0
  });

  const hoverEnterTimerRef = useRef<number | null>(null);
  const hoverHideTimerRef = useRef<number | null>(null);
  const closeCooldownUntilRef = useRef<number>(0);
  const orderedProducts = prioritizedProducts;
  const showcaseSlots = useMemo(() => getShowcaseSlots(viewportSize), [viewportSize]);
  const productLimit = showcaseSlots.length;
  const productSetCount = Math.max(1, Math.ceil(orderedProducts.length / productLimit));
  const safeProductSetIndex = Math.min(productSetIndex, productSetCount - 1);
  const firstVisibleProductIndex = safeProductSetIndex * productLimit;
  const worldProducts = useMemo(
    () => orderedProducts.slice(firstVisibleProductIndex, firstVisibleProductIndex + productLimit),
    [firstVisibleProductIndex, orderedProducts, productLimit]
  );
  const activeSlots = showcaseSlots.slice(0, worldProducts.length);
  const stageScale = getShowcaseStageScale(viewportSize, activeSlots);
  const stageStyle = getShowcaseStageStyle(stageScale, viewportSize, worldView);

  // Track user interaction time
  const lastUserInteractionTimeRef = useRef<number>(Date.now());

  // Prefetch /explore as soon as Home page mounts for instant, zero-delay scroll transition
  useEffect(() => {
    router.prefetch("/explore");
  }, [router]);

  const cancelHoverEnter = useCallback(() => {
    if (hoverEnterTimerRef.current !== null) {
      window.clearTimeout(hoverEnterTimerRef.current);
      hoverEnterTimerRef.current = null;
    }
  }, []);

  const cancelHoverHide = useCallback(() => {
    if (hoverHideTimerRef.current !== null) {
      window.clearTimeout(hoverHideTimerRef.current);
      hoverHideTimerRef.current = null;
    }
  }, []);

  const closePreview = useCallback(() => {
    cancelHoverEnter();
    cancelHoverHide();
    closeCooldownUntilRef.current = Date.now() + 450;
    setHoveredSlug(null);
  }, [cancelHoverEnter, cancelHoverHide]);

  const navigateToExplore = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setIsNavigatingToExplore(true);
    cancelHoverEnter();
    cancelHoverHide();
    setHoveredSlug(null);
    router.push("/explore");
  }, [cancelHoverEnter, cancelHoverHide, router]);

  const showProductPreviewImmediate = useCallback(
    (slug: string) => {
      cancelHoverEnter();
      cancelHoverHide();

      if (Date.now() < closeCooldownUntilRef.current) {
        return;
      }

      setHoveredSlug(slug);
      hoverHideTimerRef.current = window.setTimeout(() => {
        closePreview();
      }, 2000);
    },
    [cancelHoverEnter, cancelHoverHide, closePreview]
  );

  const showProductPreviewWithDelay = useCallback(
    (slug: string, delayMs = 140) => {
      cancelHoverEnter();

      if (Date.now() < closeCooldownUntilRef.current) {
        return;
      }

      hoverEnterTimerRef.current = window.setTimeout(() => {
        showProductPreviewImmediate(slug);
        hoverEnterTimerRef.current = null;
      }, delayMs);
    },
    [cancelHoverEnter, showProductPreviewImmediate]
  );

  const handleCardPreviewEnter = useCallback(
    (slug: string) => {
      if (worldView.dragging) {
        return;
      }
      showProductPreviewWithDelay(slug, 140);
    },
    [showProductPreviewWithDelay, worldView.dragging]
  );

  const handleCardPreviewLeave = useCallback(() => {
    cancelHoverEnter();
  }, [cancelHoverEnter]);

  const returnToShowcaseHome = useCallback(() => {
    cancelHoverHide();
    cancelHoverEnter();
    setHoveredSlug(null);
    setWorldView({
      rotateX: 0,
      rotateY: 0,
      zoom: 1,
      parallaxX: 0,
      parallaxY: 0,
      dragging: false
    });
    pointerRef.current = {
      active: false,
      x: 0,
      y: 0,
      startX: 0,
      startY: 0,
      distance: 0,
      startRotateX: 0,
      startRotateY: 0
    };
  }, [cancelHoverEnter, cancelHoverHide]);

  const reloadNextProductSet = useCallback(() => {
    cancelHoverHide();
    cancelHoverEnter();
    setHoveredSlug(null);
    setWorldView({
      rotateX: 0,
      rotateY: 0,
      zoom: 1,
      parallaxX: 0,
      parallaxY: 0,
      dragging: false
    });
    pointerRef.current = {
      active: false,
      x: 0,
      y: 0,
      startX: 0,
      startY: 0,
      distance: 0,
      startRotateX: 0,
      startRotateY: 0
    };
    setProductSetIndex((prev) => (prev + 1) % productSetCount);
  }, [cancelHoverEnter, cancelHoverHide, productSetCount]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview();
      } else if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        navigateToExplore();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closePreview, navigateToExplore]);

  useEffect(() => {
    setMounted(true);

    const updateViewport = () => {
      const nextViewport = { width: window.innerWidth, height: window.innerHeight };
      setViewportSize(nextViewport);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      cancelHoverEnter();
      cancelHoverHide();
    };
  }, [cancelHoverEnter, cancelHoverHide]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const updateWorldPaused = () => {
      setWorldPaused(document.hidden || document.body.classList.contains("modal-open"));
    };
    const bodyObserver = new MutationObserver(updateWorldPaused);

    updateWorldPaused();
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("visibilitychange", updateWorldPaused);
    window.addEventListener("focus", updateWorldPaused);
    window.addEventListener("blur", updateWorldPaused);

    return () => {
      bodyObserver.disconnect();
      document.removeEventListener("visibilitychange", updateWorldPaused);
      window.removeEventListener("focus", updateWorldPaused);
      window.removeEventListener("blur", updateWorldPaused);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    setProductSetIndex(0);
  }, [mounted]);

  useEffect(() => {
    setProductSetIndex((index) => Math.min(index, productSetCount - 1));
  }, [productSetCount]);

  useEffect(() => {
    if (!hoveredSlug) {
      return;
    }

    if (!worldProducts.some((product) => product.slug === hoveredSlug)) {
      setHoveredSlug(null);
    }
  }, [hoveredSlug, worldProducts]);

  const beginPointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!showUI) {
        return;
      }
      lastUserInteractionTimeRef.current = Date.now();
      pointerRef.current = {
        active: true,
        x: event.clientX,
        y: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
        distance: 0,
        startRotateX: worldView.rotateX,
        startRotateY: worldView.rotateY
      };
    },
    [showUI, worldView.rotateX, worldView.rotateY]
  );

  const movePointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!showUI) {
        return;
      }
      lastUserInteractionTimeRef.current = Date.now();
      const pointer = pointerRef.current;

      if (!pointer.active) {
        return;
      }

      pointer.distance += Math.abs(event.clientX - pointer.x) + Math.abs(event.clientY - pointer.y);
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      const dragX = event.clientX - pointer.startX;
      const dragY = event.clientY - pointer.startY;
      const isDragging = pointer.distance > dragThreshold;

      if (isDragging) {
        cancelHoverHide();
        setHoveredSlug(null);
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.setPointerCapture(event.pointerId);
        }
      }

      // 180-degree total horizontal sweep: [-65deg, +65deg] with smooth luxury resistance
      // Vertical tilt: [-35deg, +35deg]
      const nextRotateY = clamp(pointer.startRotateY + dragX * 0.32, -65, 65);
      const nextRotateX = clamp(pointer.startRotateX - dragY * 0.24, -35, 35);

      setWorldView((current) => ({
        ...current,
        rotateX: nextRotateX,
        rotateY: nextRotateY,
        dragging: isDragging
      }));
    },
    [showUI, cancelHoverHide]
  );

  const endPointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      lastUserInteractionTimeRef.current = Date.now();
      const pointer = pointerRef.current;
      const dragUpward = pointer.startY - event.clientY;

      pointer.active = false;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setWorldView((current) => ({ ...current, dragging: false }));

      // On touch swipe-up, smoothly transition to /explore
      if (event.pointerType === "touch" && dragUpward > 65) {
        navigateToExplore();
      }
    },
    [navigateToExplore]
  );

  // Wheel scroll on Home page navigates to /explore
  const handleWorldWheel = useCallback(
    (event: ReactWheelEvent<HTMLElement>) => {
      const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(delta) < 8) return;
      navigateToExplore();
    },
    [navigateToExplore]
  );

  useEffect(() => {
    if (!mounted) return;
    const handleNativeWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) > 8) {
        navigateToExplore();
      }
    };
    window.addEventListener("wheel", handleNativeWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleNativeWheel);
  }, [mounted, navigateToExplore]);

  const leaveWorld = useCallback(() => {
    if (pointerRef.current.active) {
      return;
    }

    setWorldView((current) => ({ ...current, parallaxX: 0, parallaxY: 0 }));
  }, []);

  const handleSectionPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      movePointer(event);
    },
    [movePointer]
  );

  const handleSectionPointerLeave = useCallback(() => {
    leaveWorld();
  }, [leaveWorld]);

  const beginWorldPointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      beginPointer(event);
    },
    [beginPointer]
  );

  const openProduct = useCallback(
    (product: Product) => {
      if (pointerRef.current.distance > dragThreshold) {
        return;
      }
      router.push(`/products/${product.slug}`);
    },
    [router]
  );

  useEffect(() => {
    const handleRemoteHome = () => {
      returnToShowcaseHome();
    };
    const handleRemoteReload = () => {
      reloadNextProductSet();
    };
    window.addEventListener("xtream-utd:world-home", handleRemoteHome);
    window.addEventListener("xtream-utd:world-reload", handleRemoteReload);
    return () => {
      window.removeEventListener("xtream-utd:world-home", handleRemoteHome);
      window.removeEventListener("xtream-utd:world-reload", handleRemoteReload);
    };
  }, [returnToShowcaseHome, reloadNextProductSet]);

  // After mount, trigger UI chrome fade-in smoothly in the last moment of the fly-in
  useEffect(() => {
    if (!mounted) {
      return;
    }

    const uiRevealTimeMs = 1500;

    const timer = window.setTimeout(() => {
      setShowUI(true);
      window.dispatchEvent(new CustomEvent("xtream-utd:world-ui-ready"));
    }, uiRevealTimeMs);

    return () => window.clearTimeout(timer);
  }, [mounted]);

  if (!mounted) {
    return <section className="world-shell reference-showcase" aria-label="Loading product showcase" />;
  }

  const hoveredProduct = hoveredSlug ? worldProducts.find((product) => product.slug === hoveredSlug) ?? null : null;

  return (
    <section
      ref={sectionRef}
      className={[
        "world-shell",
        "reference-showcase",
        "is-in-showcase",
        isNavigatingToExplore ? "is-navigating-to-explore" : "",
        hoveredSlug ? "is-hovering" : "",
        worldPaused ? "is-paused" : "",
        worldView.dragging ? "is-dragging" : "",
        showUI ? "ui-ready" : "ui-pending"
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--showcase-opacity": "1"
        } as CSSProperties
      }
      aria-label="Interactive 3D Product World"
      tabIndex={0}
      onWheel={handleWorldWheel}
      onPointerDown={beginWorldPointer}
      onPointerMove={handleSectionPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerLeave={handleSectionPointerLeave}
    >
      {/* ------------------------------------------------------------- */}
      {/* Layer 1: Resting Showcase 3D Grid                             */}
      {/* ------------------------------------------------------------- */}
      <div
        className="world-stage showcase-stage"
        style={{
          ...stageStyle,
          opacity: 1,
          pointerEvents: "auto"
        }}
      >
        {activeSlots.map((cardSlot, index) => {
          const product = worldProducts[index];
          if (!product) {
            return null;
          }

          const isHovered = hoveredSlug === product.slug;
          const isDimmed = Boolean(hoveredSlug && !isHovered);

          return (
            <ReferenceWorldProduct
              key={`showcase-card-${product.id}-${index}`}
              product={product}
              slot={cardSlot}
              isFlyingIn={!showUI}
              isDimmed={isDimmed}
              isHovered={isHovered}
              flyInIndex={index}
              onPreviewEnter={handleCardPreviewEnter}
              onPreviewLeave={handleCardPreviewLeave}
              onPointerDown={beginPointer}
              onPointerMove={movePointer}
              onPointerEnd={endPointer}
              onOpen={openProduct}
            />
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Instructions HUD                                              */}
      {/* ------------------------------------------------------------- */}
      <div className="world-instructions" aria-hidden="true">
        {t("drag_to_rotate")}
        <br />
        {t("hover_for_details")}
        <br />
        {t("scroll_to_explore")}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Card Hover Center Preview Bar                                  */}
      {/* ------------------------------------------------------------- */}
      {hoveredProduct ? (
        <div className="world-center-preview">
          <Link
            href={`/products/${hoveredProduct.slug}`}
            className="world-center-preview-card"
            aria-label={`View details for ${hoveredProduct.title}`}
          >
            <div
              className="center-preview-media"
              style={{ "--preview-accent": hoveredProduct.accent || "#3385FF" } as CSSProperties}
            >
              <ProductArtwork product={hoveredProduct} />
            </div>

            <div className="center-preview-bar">
              <div className="center-preview-price">
                <span className="price-value">{formatPrice(hoveredProduct.price)}</span>
              </div>

              <div className="center-preview-info">
                <h3 className="center-preview-title">{hoveredProduct.title}</h3>
                <span className="center-preview-category">{tCategory(hoveredProduct.category)}</span>
              </div>

              <div className="center-preview-action">
                <span>{t("view_details")}</span>
                <ArrowUpRight size={14} className="action-arrow" aria-hidden="true" />
              </div>
            </div>
          </Link>
        </div>
      ) : null}

      {/* ------------------------------------------------------------- */}
      {/* Product Sets Counter                                           */}
      {/* ------------------------------------------------------------- */}
      {productSetCount > 1 ? (
        <div className="world-set-controls" aria-label="Home page product sets">
          <span className="world-set-count">
            {formatNumber(String(safeProductSetIndex + 1).padStart(2, "0"))} /{" "}
            {formatNumber(String(productSetCount).padStart(2, "0"))} {t("pages")} •{" "}
            {formatNumber(products.length)} {t("products")}
          </span>
        </div>
      ) : null}

      <div className="sr-only">
        {worldProducts.map((product) => (
          <a key={product.slug} href={`/products/${product.slug}`}>
            {product.title}
          </a>
        ))}
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// Reference Showcase Card Component (from 18edb0a)
// -------------------------------------------------------------
type ReferenceWorldProductProps = {
  product: Product;
  slot: ReferenceShowcaseSlot;
  isFlyingIn: boolean;
  isDimmed: boolean;
  isHovered: boolean;
  flyInIndex: number;
  onPreviewEnter: (slug: string) => void;
  onPreviewLeave: () => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerEnd: (event: ReactPointerEvent<HTMLElement>) => void;
  onOpen: (product: Product) => void;
};

function ReferenceWorldProduct({
  product,
  slot: cardSlot,
  isFlyingIn,
  isDimmed,
  isHovered,
  flyInIndex,
  onPreviewEnter,
  onPreviewLeave,
  onPointerDown,
  onPointerMove,
  onPointerEnd,
  onOpen
}: ReferenceWorldProductProps) {
  const { tCategory } = useLanguage();
  const flyOrigin = getFlyInOrigin(cardSlot, flyInIndex);
  const flyStyle = {
    ...getReferenceCardStyle(cardSlot, product.accent, flyInIndex),
    "--fly-in-delay": `${flyInIndex * 24}ms`
  } as React.CSSProperties & Record<`--${string}`, string>;

  return (
    <button
      className={[
        "world-card",
        "reference-world-card",
        `kind-${cardSlot.kind}`,
        getLegacySizeClass(cardSlot.kind),
        isFlyingIn ? "is-flying-in" : "",
        isDimmed ? "dimmed" : "",
        isHovered ? "hovered" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      data-fly-in-origin={flyOrigin}
      style={flyStyle}
      type="button"
      onPointerEnter={() => onPreviewEnter(product.slug)}
      onPointerLeave={onPreviewLeave}
      onFocus={() => onPreviewEnter(product.slug)}
      onBlur={onPreviewLeave}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onClick={() => onOpen(product)}
      aria-label={`Open product details for ${product.title}`}
    >
      <div className="product-media world-product-media">
        <ProductArtwork product={product} compact={cardSlot.kind === "mini"} />
      </div>
      {cardSlot.kind !== "mini" ? (
        <span className="world-card-copy" aria-hidden="true">
          <span className="world-card-info-group">
            <span className="world-card-title">{product.title}</span>
            <span className="world-card-category">{tCategory(product.category)}</span>
          </span>
        </span>
      ) : null}
      <span className="sr-only">{product.title}</span>
    </button>
  );
}

// -------------------------------------------------------------
// Canonical Placement & Helper Functions (from 18edb0a)
// -------------------------------------------------------------
const canonicalHomeSlugs = [
  // Center Column:
  "atomos-ninja-v", // Slot 0: Center Hero (Zoom Ninje V)
  "manfrotto-tripod-mt055", // Slot 1: Center Top (Manfrotto Tripod)
  "dji-rs-3-pro", // Slot 2: Center Bottom (DJI RS 3 Pro)

  // Left Side:
  "sennheiser-hd-660s", // Slot 3: Left Tier 1 Top (Sennheiser HD 660S)
  "sigma-24-70mm-f2-8", // Slot 4: Left Tier 1 Mid (Sigma 24-70mm)
  "rode-wireless-go-ii", // Slot 5: Left Tier 1 Bottom (RØDE Wireless GO II)
  "desk-cable-clips", // Slot 6: Left Tier 2 Top (Stand Dot)
  "anker-power-strip", // Slot 7: Left Tier 2 Mid (Rec Dot)
  "shure-sm7b", // Slot 8: Left Tier 2 Bottom (Audio Link)
  "elgato-stream-deck-mk2", // Slot 9: Left Tier 3 Mid (Cinema Slate)

  // Right Side:
  "aputure-1200-ji", // Slot 10: Right Tier 1 Top (Aputure 1200 3I)
  "sony-a7-iv", // Slot 11: Right Tier 1 Mid (Sony A7 IV)
  "canon-eos-r5", // Slot 12: Right Tier 1 Bottom (Canon EOS R5)
  "aputure-120d-ii", // Slot 13: Right Tier 2 Top (Aputure 120D II)
  "blackmagic-pocket-cinema-6k", // Slot 14: Right Tier 2 Mid (Blackmagic)
  "godox-sl60w", // Slot 15: Right Tier 2 Bottom (Godox SL90W)
  "manfrotto-monitor-mount", // Slot 16: Right Tier 3 Mid (Manftoge Trigurd)

  // Surrounding Floating Badges (Slots 17+):
  "mini-badge-dot-1",
  "mini-badge-dot-2",
  "mini-badge-dot-blue",
  "mini-badge-dot-red",
  "mini-badge-stand",
  "mini-badge-rec",
  "mini-badge-audio",
  "mini-badge-slate",
  "mini-badge-mic-green",
  "mini-badge-lamp-orange",
  "mini-badge-headset",
  "mini-badge-cam-cyan",
  "mini-badge-desk-orange",
  "mini-badge-video-cyan",
  "mini-badge-mic-pink",
  "mini-badge-cinema-purple",
  "mini-badge-monitor-cyan",
  "mini-badge-lamp-yellow",
  "mini-badge-tripod-blue",
  "mini-badge-tripod-purple",
  "mini-badge-bulb-green",
  "mini-badge-msg-green"
];

function prioritizeWorldProducts(products: Product[]): Product[] {
  const productMap = new Map(products.map((product) => [product.slug, product]));
  const result: Product[] = [];
  const seen = new Set<string>();

  for (const slug of canonicalHomeSlugs) {
    const product = productMap.get(slug);
    if (product && !seen.has(slug)) {
      result.push(product);
      seen.add(slug);
    }
  }

  for (const product of products) {
    if (!seen.has(product.slug)) {
      result.push(product);
      seen.add(product.slug);
    }
  }

  return result;
}

function getShowcaseSlots(viewportSize: ViewportSize): ReferenceShowcaseSlot[] {
  if (viewportSize.width < 700) {
    return mobileReferenceSlots;
  }

  if (viewportSize.width < 1024) {
    return desktopReferenceSlots.slice(0, 25);
  }

  if (viewportSize.width < 1280) {
    return desktopReferenceSlots.slice(0, 31);
  }

  if (viewportSize.width >= 1500) {
    return transformShowcaseSlots(desktopReferenceSlots, 1.05, 1);
  }

  return desktopReferenceSlots;
}

function getShowcaseStageScale(viewportSize: ViewportSize, slots: ReferenceShowcaseSlot[]): number {
  const bounds = getShowcaseBounds(slots.length > 0 ? slots : desktopReferenceSlots);
  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;
  const horizontalReserve = viewportSize.width < 700 ? 24 : viewportSize.width >= 1500 ? 120 : 140;
  const verticalReserve = viewportSize.width < 700 ? 170 : 210;
  const widthFit = Math.max(0.2, (viewportSize.width - horizontalReserve) / boundsWidth);
  const heightFit = Math.max(0.2, (viewportSize.height - verticalReserve) / boundsHeight);
  const maxScale =
    viewportSize.width < 700 ? 1 : viewportSize.width < 1024 ? 0.78 : viewportSize.width < 1180 ? 0.88 : 1.0;
  const minScale = viewportSize.width < 700 ? 0.58 : 0.5;

  return clamp(Math.min(widthFit, heightFit, maxScale), minScale, maxScale);
}

function getShowcaseStageStyle(
  scale: number,
  viewportSize: ViewportSize,
  worldView: WorldViewState
): CSSProperties & Record<`--${string}`, string> {
  const verticalOffset =
    viewportSize.width < 700
      ? "4px"
      : viewportSize.width >= 1500 && viewportSize.height < 960
      ? "-18px"
      : "-14px";

  const effectiveScale = scale * worldView.zoom;

  return {
    "--world-stage-scale": String(effectiveScale),
    "--world-stage-offset-y": verticalOffset,
    "--world-rotate-x": `${worldView.rotateX}deg`,
    "--world-rotate-y": `${worldView.rotateY}deg`,
    "--world-parallax-x": "0px",
    "--world-parallax-y": "0px"
  };
}

function transformShowcaseSlots(
  slots: ReferenceShowcaseSlot[],
  xMultiplier: number,
  yMultiplier: number
): ReferenceShowcaseSlot[] {
  return slots.map((cardSlot) => ({
    ...cardSlot,
    x: Math.round(cardSlot.x * xMultiplier),
    y: Math.round(cardSlot.y * yMultiplier)
  }));
}

function getShowcaseBounds(slots: ReferenceShowcaseSlot[]): ShowcaseBounds {
  return slots.reduce<ShowcaseBounds>(
    (bounds, currentSlot) => {
      const slotScale = currentSlot.scale ?? 1;
      const halfWidth = (currentSlot.width * slotScale) / 2;
      const halfHeight = (currentSlot.height * slotScale) / 2;

      return {
        minX: Math.min(bounds.minX, currentSlot.x - halfWidth),
        maxX: Math.max(bounds.maxX, currentSlot.x + halfWidth),
        minY: Math.min(bounds.minY, currentSlot.y - halfHeight),
        maxY: Math.max(bounds.maxY, currentSlot.y + halfHeight)
      };
    },
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  );
}

function getReferenceCardStyle(
  cardSlot: ReferenceShowcaseSlot,
  accent: string,
  index = 0
): CSSProperties & Record<`--${string}`, string> {
  const slotScale = cardSlot.scale ?? 1;
  const hoverScale = slotScale + (cardSlot.kind === "hero" ? 0.22 : cardSlot.kind === "mini" ? 0.35 : 0.28);
  const duration =
    cardSlot.duration ??
    Number((6.8 + ((Math.abs(cardSlot.x * 3 + cardSlot.y * 7) + index * 11) % 35) * 0.08).toFixed(2));
  const floatX = cardSlot.floatX ?? 0;
  const floatY = cardSlot.floatY ?? (cardSlot.kind === "mini" ? -5 : -7);
  const floatRotate = cardSlot.floatRotate ?? (cardSlot.kind === "mini" ? 0.35 : 0.22);
  const cardDepth =
    cardSlot.kind === "hero" ? 72 : cardSlot.kind === "feature" ? 32 : cardSlot.kind === "medium" ? 10 : -26;

  return {
    zIndex: cardSlot.zIndex,
    opacity: cardSlot.opacity ?? 1,
    "--world-card-x": `${cardSlot.x}px`,
    "--world-card-y": `${cardSlot.y}px`,
    "--world-card-width": `${cardSlot.width}px`,
    "--world-card-height": `${cardSlot.height}px`,
    "--world-card-padding": "0px",
    "--world-card-media-ratio": cardSlot.kind === "mini" ? "1" : cardSlot.kind === "hero" ? "1.15" : "1.2",
    "--world-card-art-width": cardSlot.kind === "mini" ? "96%" : "100%",
    "--world-card-art-scale": cardSlot.kind === "mini" ? "1.08" : "1.04",
    "--world-card-accent": accent,
    "--world-card-rotation": `${cardSlot.rotate ?? 0}deg`,
    "--world-card-depth": `${cardDepth}px`,
    "--world-card-hover-depth": `${cardDepth + 90}px`,
    "--world-card-scale": String(slotScale),
    "--world-card-hover-scale": String(hoverScale),
    "--world-card-float-x": `${floatX}px`,
    "--world-card-float-y": `${floatY}px`,
    "--world-card-float-rotate": `${floatRotate}deg`,
    "--world-card-float-duration": `${duration}s`,
    "--world-card-float-delay": "0s"
  };
}

function getLegacySizeClass(kind: ShowcaseCardKind): string {
  if (kind === "mini") {
    return "size-small";
  }

  if (kind === "hero") {
    return "size-hero";
  }

  return kind === "feature" ? "size-large" : "size-medium";
}

function slot(
  x: number,
  y: number,
  width: number,
  height: number,
  zIndex: number,
  kind: ShowcaseCardKind,
  options: Omit<ReferenceShowcaseSlot, "x" | "y" | "width" | "height" | "zIndex" | "kind"> = {}
): ReferenceShowcaseSlot {
  return { x, y, width, height, zIndex, kind, ...options };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getFlyInOrigin(slot: ReferenceShowcaseSlot, index: number): "top" | "bottom" | "left" | "right" {
  // Center column cards: alternate top and bottom
  if (Math.abs(slot.x) < 50) {
    if (slot.y < -50) return "top";
    if (slot.y > 50) return "bottom";
    return index % 2 === 0 ? "top" : "bottom";
  }

  // Strong top or bottom cards
  if (Math.abs(slot.y) >= 220 && Math.abs(slot.x) <= 350) {
    return slot.y < 0 ? "top" : "bottom";
  }

  // Balanced 4-directional quadrant distribution
  const isHoriz = (Math.abs(slot.x) + index * 3) % 2 === 0;

  if (slot.x >= 0) {
    if (slot.y <= 0) {
      return isHoriz ? "right" : "top";
    } else {
      return isHoriz ? "right" : "bottom";
    }
  } else {
    if (slot.y <= 0) {
      return isHoriz ? "left" : "top";
    } else {
      return isHoriz ? "left" : "bottom";
    }
  }
}
