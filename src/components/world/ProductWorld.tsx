"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { ProductArtwork } from "@/components/products/ProductArtwork";
import { useLanguage, type TranslationKey } from "@/components/site/LanguageProvider";
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
  slot(300, -195, 56, 56, 18, "mini", { opacity: 0.88 }),
  slot(-300, 90, 56, 56, 18, "mini", { opacity: 0.88 }),
  slot(300, 90, 56, 56, 18, "mini", { opacity: 0.88 }),
  slot(0, -400, 56, 56, 16, "mini", { opacity: 0.86 }),
  slot(0, 400, 56, 56, 16, "mini", { opacity: 0.86 })
];

export function ProductWorld({ products }: ProductWorldProps) {
  const router = useRouter();
  const { t, formatNumber, tCategory, language } = useLanguage();
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

  // -------------------------------------------------------------
  // On-Scroll Depth Gallery Corridor State & Lerp Engine
  // -------------------------------------------------------------
  const [cameraSlot, setCameraSlot] = useState(0);
  const cameraSlotTargetRef = useRef(0);
  const touchStartYRef = useRef(0);

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
  const stageStyle = getShowcaseStageStyle(stageScale, viewportSize, worldView, cameraSlot);

  // RAF loop for smooth cameraSlot interpolation with inertia damping
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const target = cameraSlotTargetRef.current;
      setCameraSlot((current) => {
        const diff = target - current;
        if (Math.abs(diff) < 0.0005) {
          return target;
        }
        const factor = 1 - Math.pow(0.001, dt);
        return current + diff * factor;
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

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
      if (worldView.dragging || cameraSlotTargetRef.current > 0.05) {
        return;
      }
      showProductPreviewWithDelay(slug, 140);
    },
    [showProductPreviewWithDelay, worldView.dragging]
  );

  const handleCardPreviewLeave = useCallback(() => {
    cancelHoverEnter();
  }, [cancelHoverEnter]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview();
      } else if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        cameraSlotTargetRef.current += 1.0;
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        cameraSlotTargetRef.current = Math.max(0, cameraSlotTargetRef.current - 1.0);
      } else if (event.key === "Home") {
        event.preventDefault();
        cameraSlotTargetRef.current = 0;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closePreview]);

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
      touchStartYRef.current = event.clientY;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [worldView.rotateX, worldView.rotateY]
  );

  const movePointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const pointer = pointerRef.current;

      if (!pointer.active) {
        return;
      }

      const deltaY = pointer.y - event.clientY;
      pointer.distance += Math.abs(event.clientX - pointer.x) + Math.abs(event.clientY - pointer.y);
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      const dragX = event.clientX - pointer.startX;
      const dragY = event.clientY - pointer.startY;
      const isDragging = pointer.distance > dragThreshold;

      if (isDragging) {
        cancelHoverHide();
        setHoveredSlug(null);
      }

      // If user is already in corridor mode or performs a strong vertical drag, drive cameraSlot
      if (cameraSlotTargetRef.current > 0.05) {
        cameraSlotTargetRef.current = Math.max(0, cameraSlotTargetRef.current + deltaY * 0.0035);
        return;
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
    [cancelHoverHide]
  );

  const endPointer = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    pointerRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setWorldView((current) => ({ ...current, dragging: false }));
  }, []);

  // Wheel scroll drives On-Scroll Depth Gallery Corridor
  const handleWorldWheel = useCallback(
    (event: ReactWheelEvent<HTMLElement>) => {
      cancelHoverEnter();
      cancelHoverHide();
      setHoveredSlug(null);

      const delta = event.deltaY * 0.0022;
      cameraSlotTargetRef.current = Math.max(0, cameraSlotTargetRef.current + delta);
    },
    [cancelHoverEnter, cancelHoverHide]
  );

  const leaveWorld = useCallback(() => {
    if (pointerRef.current.active) {
      return;
    }

    setWorldView((current) => ({ ...current, parallaxX: 0, parallaxY: 0 }));
  }, []);

  const beginWorldPointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      beginPointer(event);
    },
    [beginPointer]
  );

  const openProduct = useCallback(
    (product: Product) => {
      if (cameraSlotTargetRef.current < 0.05 && pointerRef.current.distance > dragThreshold) {
        return;
      }
      router.push(`/products/${product.slug}`);
    },
    [router]
  );

  const reloadNextProductSet = useCallback(() => {
    cancelHoverHide();
    setHoveredSlug(null);
    cameraSlotTargetRef.current = 0;
    setCameraSlot(0);
    setProductSetIndex((index) => (index + 1) % productSetCount);
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
  }, [cancelHoverHide, productSetCount]);

  useEffect(() => {
    const handleRemoteReload = () => {
      reloadNextProductSet();
    };
    window.addEventListener("xtream-utd:world-reload", handleRemoteReload);
    return () => window.removeEventListener("xtream-utd:world-reload", handleRemoteReload);
  }, [reloadNextProductSet]);

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

  // -------------------------------------------------------------
  // Transition Blending between 3D Showcase World and Depth Corridor
  // -------------------------------------------------------------
  const isInShowcase = cameraSlot < 0.03 && cameraSlotTargetRef.current < 0.03;
  const showcaseOpacity = Math.max(0, 1 - cameraSlot / 0.45);
  const corridorOpacity = Math.min(1, Math.max(0, (cameraSlot - 0.03) / 0.35));

  // -------------------------------------------------------------
  // Strict 2-Plate Active Render Window for Depth Corridor
  // -------------------------------------------------------------
  const total = orderedProducts.length;
  const baseIndex = Math.floor(cameraSlot);
  const fraction = cameraSlot - baseIndex;
  const focalIndex = ((baseIndex % total) + total) % total;
  const approachingIndex = (((baseIndex + 1) % total) + total) % total;

  const focalProduct = orderedProducts[focalIndex];
  const approachingProduct = orderedProducts[approachingIndex];

  // Staggered dual-plate layout calculations
  const focalStyle: CSSProperties = {
    transform: `translate3d(${-fraction * 34}%, 0, ${-fraction * 180}px) scale(${1 - fraction * 0.16})`,
    opacity: 1 - fraction * 0.85,
    zIndex: 10,
    pointerEvents: fraction < 0.5 ? "auto" : "none"
  };

  const approachingStyle: CSSProperties = {
    transform: `translate3d(${(1 - fraction) * 34}%, 0, ${(fraction - 1) * 220}px) scale(${0.82 + fraction * 0.18})`,
    opacity: 0.25 + fraction * 0.75,
    zIndex: 20,
    pointerEvents: fraction >= 0.5 ? "auto" : "none"
  };

  const hoveredProduct = hoveredSlug ? worldProducts.find((product) => product.slug === hoveredSlug) ?? null : null;

  return (
    <section
      className={[
        "world-shell",
        "reference-showcase",
        isInShowcase ? "is-in-showcase" : "is-in-corridor",
        hoveredSlug ? "is-hovering" : "",
        worldPaused ? "is-paused" : "",
        worldView.dragging ? "is-dragging" : "",
        showUI ? "ui-ready" : "ui-hidden"
      ]
        .filter(Boolean)
        .join(" ")}
      ref={sectionRef}
      aria-label="Interactive product showcase"
      onPointerDown={beginWorldPointer}
      onPointerMove={movePointer}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerLeave={leaveWorld}
      onWheel={handleWorldWheel}
    >
      {/* ------------------------------------------------------------- */}
      {/* Layer 1: Resting 3D Showcase World (from 18edb0a)            */}
      {/* ------------------------------------------------------------- */}
      {showcaseOpacity > 0 ? (
        <div
          className="world-stage"
          style={{
            ...stageStyle,
            opacity: showcaseOpacity,
            pointerEvents: isInShowcase ? "auto" : "none"
          }}
        >
          {worldProducts.map((product, index) => {
            const slotForProduct =
              activeSlots[index] ?? activeSlots[activeSlots.length - 1] ?? desktopReferenceSlots[0];

            return (
              <ReferenceWorldProduct
                key={product.id}
                product={product}
                slot={slotForProduct}
                flyInIndex={index}
                isFlyingIn={!showUI}
                isDimmed={Boolean(hoveredSlug && hoveredSlug !== product.slug)}
                isHovered={hoveredSlug === product.slug}
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
      ) : null}

      {/* ------------------------------------------------------------- */}
      {/* Layer 2: On-Scroll Staggered Dual-Plate Depth Corridor        */}
      {/* ------------------------------------------------------------- */}
      {corridorOpacity > 0 && (
        <div
          className="depth-gallery-viewport"
          style={{
            opacity: corridorOpacity,
            pointerEvents: corridorOpacity > 0.1 ? "auto" : "none"
          }}
        >
          <div className="depth-gallery-bg" aria-hidden="true">
            <div className="bg-blob-a" />
            <div className="bg-blob-b" />
          </div>

          <div className="depth-gallery-plates-container">
            {focalProduct && (
              <DepthPlate
                product={focalProduct}
                slotKind="focal"
                style={focalStyle}
                language={language}
                t={t}
                tCategory={tCategory}
                onSelect={openProduct}
              />
            )}
            {approachingProduct && (
              <DepthPlate
                product={approachingProduct}
                slotKind="approaching"
                style={approachingStyle}
                language={language}
                t={t}
                tCategory={tCategory}
                onSelect={openProduct}
              />
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Instructions HUD                                              */}
      {/* ------------------------------------------------------------- */}
      <div className="world-instructions" aria-hidden="true">
        {isInShowcase ? (
          <>
            {t("drag_to_rotate")}
            <br />
            {t("hover_for_details")}
            <br />
            {t("scroll_to_explore")}
          </>
        ) : (
          <>
            {language === "bn" ? "স্ক্রোল করে নেভিগেট করুন" : "SCROLL TO NAVIGATE"}
            <br />
            {language === "bn" ? "বিস্তারিত দেখতে ক্লিক করুন" : "CLICK TO VIEW DETAILS"}
            <br />
            {language === "bn" ? "রিলোডে ক্লিক করে রিসেট করুন" : "RELOAD TO RESET"}
          </>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Card Hover Center Preview Bar (In Showcase Mode)               */}
      {/* ------------------------------------------------------------- */}
      {isInShowcase && hoveredProduct ? (
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
      {/* Product Sets / Corridor Progress Counter                     */}
      {/* ------------------------------------------------------------- */}
      <div className="world-set-controls" aria-label="Home page product sets">
        <span className="world-set-count">
          {isInShowcase ? (
            productSetCount > 1 ? (
              <>
                {formatNumber(String(safeProductSetIndex + 1).padStart(2, "0"))} /{" "}
                {formatNumber(String(productSetCount).padStart(2, "0"))} {t("pages")} •{" "}
                {formatNumber(products.length)} {t("products")}
              </>
            ) : (
              <>{formatNumber(products.length)} {t("products")}</>
            )
          ) : (
            <>
              {formatNumber(String(focalIndex + 1).padStart(2, "0"))} /{" "}
              {formatNumber(String(total).padStart(2, "0"))} {t("products")}
            </>
          )}
        </span>
      </div>

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
  flyInIndex: number;
  isFlyingIn: boolean;
  isDimmed: boolean;
  isHovered: boolean;
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
  flyInIndex,
  isFlyingIn,
  isDimmed,
  isHovered,
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
// Staggered Dual-Plate Depth Corridor Plate Component
// -------------------------------------------------------------
type DepthPlateProps = {
  product: Product;
  slotKind: "focal" | "approaching";
  style: CSSProperties;
  language: "en" | "bn";
  t: (key: TranslationKey) => string;
  tCategory: (cat: string) => string;
  onSelect: (product: Product) => void;
};

function DepthPlate({
  product,
  slotKind,
  style,
  language,
  t,
  tCategory,
  onSelect
}: DepthPlateProps) {
  const formattedPrice = formatPrice(product.price);
  const formattedOldPrice = product.old_price ? formatPrice(product.old_price) : null;
  const hasDiscount = Boolean(product.old_price && product.old_price > product.price);

  const stockLabel =
    product.stock === "In stock"
      ? language === "bn"
        ? "স্টকে আছে"
        : "In stock"
      : product.stock === "Low stock"
      ? language === "bn"
        ? "সীমিত স্টক"
        : "Low stock"
      : language === "bn"
      ? "স্টক শেষ"
      : "Out of stock";

  const stockDotClass =
    product.stock === "In stock"
      ? ""
      : product.stock === "Low stock"
      ? "stock-low"
      : "stock-out";

  const plateStyle: CSSProperties = {
    ...style,
    "--plate-accent": product.accent || "#3385ff"
  } as CSSProperties;

  return (
    <button
      type="button"
      className={`depth-plate depth-plate-${slotKind}`}
      data-plate-slot={slotKind}
      style={plateStyle}
      aria-label={`${product.title} - ${formattedPrice}`}
      onPointerDown={(e) => {
        if (style.pointerEvents !== "none") {
          e.stopPropagation();
        }
      }}
      onClick={(e) => {
        if (style.pointerEvents === "none") {
          e.preventDefault();
          return;
        }
        onSelect(product);
      }}
    >
      {/* Top Bar: Category Badge & Stock Indicator */}
      <div className="depth-plate-top">
        <span className="depth-plate-badge">{tCategory(product.category)}</span>
        <div className="depth-plate-stock">
          <span className={`depth-plate-stock-dot ${stockDotClass}`} />
          <span>{stockLabel}</span>
        </div>
      </div>

      {/* Media Artwork */}
      <div className="depth-plate-media">
        <div className="depth-plate-art-wrap">
          <ProductArtwork product={product} compact={false} />
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="depth-plate-bottom">
        <h2 className="depth-plate-title">{product.title}</h2>

        <div className="depth-plate-footer">
          <div className="depth-plate-price-box">
            <span className="depth-plate-price">{formattedPrice}</span>
            {hasDiscount && formattedOldPrice ? (
              <span className="depth-plate-old-price">{formattedOldPrice}</span>
            ) : null}
          </div>

          <div className="depth-plate-cta" aria-hidden="true">
            <span>{t("view_details")}</span>
            <ArrowUpRight size={13} />
          </div>
        </div>
      </div>
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
  worldView: WorldViewState,
  cameraSlot = 0
): CSSProperties & Record<`--${string}`, string> {
  const verticalOffset =
    viewportSize.width < 700
      ? "4px"
      : viewportSize.width >= 1500 && viewportSize.height < 960
      ? "-18px"
      : "-14px";

  const effectiveScale = scale * worldView.zoom * (1 + cameraSlot * 0.08);

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
