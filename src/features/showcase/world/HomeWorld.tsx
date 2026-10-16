"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { formatPrice } from "@/domain/commerce/money";
import { hasValidOldPrice } from "@/domain/product/pricing";
import type { ProductSummary } from "@/domain/product/product-summary";
import { ProductImage } from "@/features/product/components/ProductImage";
import { useI18n } from "@/i18n/LanguageProvider";
import { useDocumentHidden, useHydrated, useViewportSize } from "@/shared/hooks/useBrowserState";
import { usePrefersReducedMotion } from "@/shared/hooks/useMediaQuery";
import { useAnyModalOpen } from "@/shared/hooks/useModalLayer";
import { readStored } from "@/shared/lib/stored-value";
import { IMAGE_WIDTHS } from "@/shared/media/google-drive";
import { emitShowcase, useShowcaseEvent } from "../lib/showcase-events";
import { ScrollHint } from "../ScrollHint";
import {
  clamp,
  dragThreshold,
  getFlyInOrigin,
  getLegacySizeClass,
  getReferenceCardStyle,
  getShowcaseSlots,
  getShowcaseStageScale,
  getShowcaseStageStyle,
  type PointerState,
  type ReferenceShowcaseSlot,
  type WorldViewState
} from "./world-layout";

type HomeWorldProps = {
  products: ProductSummary[];
};

const RESTING_VIEW: WorldViewState = { rotateX: 0, rotateY: 0, zoom: 1, parallaxX: 0, parallaxY: 0, dragging: false };

/**
 * Stage CSS variables managed by React. The rotation variables (`--world-rotate-x/y`) are left out on
 * purpose: they change on every pointer move and are written straight to the stage element (see
 * `applyRotation`) so dragging never re-renders the component tree.
 */
function stageLayoutStyle(viewport: { width: number; height: number }, scale: number): CSSProperties {
  const {
    "--world-rotate-x": _rotateX,
    "--world-rotate-y": _rotateY,
    ...layout
  } = getShowcaseStageStyle(scale, viewport, RESTING_VIEW);
  return layout;
}
const IDLE_POINTER: PointerState = { active: false, x: 0, y: 0, startX: 0, startY: 0, distance: 0, startRotateX: 0, startRotateY: 0 };

const SHUFFLE_STORAGE_KEY = "xtream-utd:home-swap-offset";
const UI_REVEAL_MS = 1500;
const SET_REVEAL_MS = 1350;
const PREVIEW_ENTER_DELAY_MS = 140;
const PREVIEW_AUTO_HIDE_MS = 2200;
const PREVIEW_COOLDOWN_MS = 450;
const INDICATOR_SWAP_MS = 3000;
const DESKTOP_PAGE_CAPACITY = 50;
const SERVER_VIEWPORT = { width: 1440, height: 1120 };

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * Rotates the product order on every visit to the home page (persisted per tab session, so
 * consecutive visits always start from a different product).
 * Initialized once on mount without triggering re-renders during active animation.
 */
function useHomeShuffleOffset(productCount: number): number {
  const [offset] = useState(() => {
    if (typeof window === "undefined" || productCount <= 0) return 0;
    const raw = readStored("session", SHUFFLE_STORAGE_KEY);
    const previous = Number.parseInt(raw ?? "", 10);
    const total = Math.max(1, productCount);
    return Number.isNaN(previous) ? 0 : previous % total;
  });

  useEffect(() => {
    if (typeof window === "undefined" || productCount <= 1) return;
    const total = Math.max(1, productCount);
    const step = 1 + Math.floor(Math.random() * (total - 1));
    const next = (offset + step) % total;
    try {
      window.sessionStorage.setItem(SHUFFLE_STORAGE_KEY, String(next));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [offset, productCount]);

  return offset;
}

export function HomeWorld({ products }: HomeWorldProps) {
  const router = useRouter();
  const { t, formatNumber, tCategory } = useI18n();
  const reducedMotion = usePrefersReducedMotion();
  const anyModalOpen = useAnyModalOpen();
  const mounted = useHydrated();
  const viewportSize = useViewportSize(SERVER_VIEWPORT);
  const documentHidden = useDocumentHidden();
  const [showUI, setShowUI] = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [productSetIndex, setProductSetIndex] = useState(0);
  const [indicatorPhase, setIndicatorPhase] = useState<"pages" | "scroll">("pages");
  const [isNavigatingToExplore, setIsNavigatingToExplore] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  /** Current world rotation in degrees; the source of truth for the stage's rotation variables. */
  const rotationRef = useRef(0);
  const rotationFrameRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const pointerRef = useRef<PointerState>(IDLE_POINTER);
  const isNavigatingRef = useRef(false);
  const hoverEnterTimerRef = useRef<number | null>(null);
  const hoverHideTimerRef = useRef<number | null>(null);
  const closeCooldownUntilRef = useRef(0);

  /** Writes the rotation to the stage at most once per animation frame (no React render). */
  const applyRotation = useCallback((rotateY: number) => {
    rotationRef.current = rotateY;
    if (rotationFrameRef.current !== null) return;
    rotationFrameRef.current = window.requestAnimationFrame(() => {
      rotationFrameRef.current = null;
      const stage = stageRef.current;
      if (!stage) return;
      stage.style.setProperty("--world-rotate-y", `${rotationRef.current}deg`);
      stage.style.setProperty("--world-rotate-x", "0deg");
    });
  }, []);

  useEffect(
    () => () => {
      if (rotationFrameRef.current !== null) window.cancelAnimationFrame(rotationFrameRef.current);
    },
    []
  );

  const setDragging = useCallback((dragging: boolean) => {
    if (draggingRef.current === dragging) return;
    draggingRef.current = dragging;
    setIsDragging(dragging);
  }, []);

  const swapOffset = useHomeShuffleOffset(products.length);
  const orderedProducts = useMemo(() => {
    if (products.length <= 1 || swapOffset === 0) return products;
    const shift = swapOffset % products.length;
    return [...products.slice(shift), ...products.slice(0, shift)];
  }, [products, swapOffset]);

  const showcaseSlots = useMemo(() => getShowcaseSlots(viewportSize), [viewportSize]);
  const pageCapacity = viewportSize.width < 700 ? showcaseSlots.length : DESKTOP_PAGE_CAPACITY;
  const productSetCount = Math.max(1, Math.ceil(orderedProducts.length / pageCapacity));
  const safeProductSetIndex = Math.min(productSetIndex, productSetCount - 1);
  const firstVisibleProductIndex = safeProductSetIndex * pageCapacity;

  // Each page shows unique products only.
  const worldProducts = useMemo(
    () =>
      orderedProducts
        .slice(firstVisibleProductIndex, firstVisibleProductIndex + pageCapacity)
        .slice(0, showcaseSlots.length),
    [firstVisibleProductIndex, orderedProducts, pageCapacity, showcaseSlots.length]
  );

  const activeSlots = showcaseSlots.slice(0, worldProducts.length);
  const stageScale = getShowcaseStageScale(viewportSize, showcaseSlots);
  const stageStyle = useMemo(() => stageLayoutStyle(viewportSize, stageScale), [viewportSize, stageScale]);
  const worldPaused = documentHidden || anyModalOpen;
  const visibleHoveredSlug = hoveredSlug && worldProducts.some((product) => product.slug === hoveredSlug) ? hoveredSlug : null;

  const revealUI = useCallback(() => {
    setShowUI(true);
    emitShowcase("world-ui-ready");
  }, []);

  useEffect(() => {
    router.prefetch("/explore");
  }, [router]);

  // Intro fly-in, then reveal the HUD and shell chrome.
  useEffect(() => {
    if (!mounted) return;
    window.scrollTo(0, 0);
    const timer = window.setTimeout(revealUI, reducedMotion ? 0 : UI_REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, [mounted, reducedMotion, revealUI]);

  // Alternate the bottom indicator between "pages" and "scroll to explore".
  useEffect(() => {
    if (!mounted || reducedMotion) return;
    const interval = window.setInterval(() => {
      setIndicatorPhase((phase) => (phase === "pages" ? "scroll" : "pages"));
    }, INDICATOR_SWAP_MS);
    return () => window.clearInterval(interval);
  }, [mounted, reducedMotion]);

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

  useEffect(
    () => () => {
      cancelHoverEnter();
      cancelHoverHide();
    },
    [cancelHoverEnter, cancelHoverHide]
  );

  const closePreview = useCallback(() => {
    cancelHoverEnter();
    cancelHoverHide();
    closeCooldownUntilRef.current = Date.now() + PREVIEW_COOLDOWN_MS;
    setHoveredSlug(null);
  }, [cancelHoverEnter, cancelHoverHide]);

  const showPreviewNow = useCallback(
    (slug: string) => {
      cancelHoverEnter();
      cancelHoverHide();
      if (Date.now() < closeCooldownUntilRef.current) return;
      setHoveredSlug(slug);
      hoverHideTimerRef.current = window.setTimeout(closePreview, PREVIEW_AUTO_HIDE_MS);
    },
    [cancelHoverEnter, cancelHoverHide, closePreview]
  );

  const handleCardPreviewEnter = useCallback(
    (slug: string) => {
      if (draggingRef.current) return;
      cancelHoverEnter();
      if (Date.now() < closeCooldownUntilRef.current) return;
      hoverEnterTimerRef.current = window.setTimeout(() => {
        hoverEnterTimerRef.current = null;
        showPreviewNow(slug);
      }, PREVIEW_ENTER_DELAY_MS);
    },
    [cancelHoverEnter, showPreviewNow]
  );

  const navigationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current !== null) {
        window.clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const navigateToExplore = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setIsNavigatingToExplore(true);
    cancelHoverEnter();
    cancelHoverHide();
    setHoveredSlug(null);

    const performNavigation = () => {
      router.push("/explore");
    };

    if (reducedMotion) {
      performNavigation();
      return;
    }

    if (navigationTimeoutRef.current !== null) {
      window.clearTimeout(navigationTimeoutRef.current);
    }

    // Allow the reverse product fly-out animation (480ms) to play smoothly
    navigationTimeoutRef.current = window.setTimeout(() => {
      performNavigation();
    }, 480);
  }, [cancelHoverEnter, cancelHoverHide, reducedMotion, router]);

  const resetView = useCallback(() => {
    cancelHoverHide();
    cancelHoverEnter();
    setHoveredSlug(null);
    setDragging(false);
    applyRotation(0);
    pointerRef.current = IDLE_POINTER;
  }, [applyRotation, cancelHoverEnter, cancelHoverHide, setDragging]);

  const showNextProductSet = useCallback(() => {
    resetView();
    if (productSetCount <= 1) return;
    setProductSetIndex((index) => (index + 1) % productSetCount);
    setShowUI(false);
    window.setTimeout(revealUI, reducedMotion ? 0 : SET_REVEAL_MS);
  }, [productSetCount, reducedMotion, resetView, revealUI]);

  useShowcaseEvent("world-home", resetView);
  useShowcaseEvent("world-reload", showNextProductSet);

  // Keyboard: Escape closes the preview; ArrowDown / PageDown continue to the explore page.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (anyModalOpen || isEditableTarget(event.target)) return;
      if (event.key === "Escape") {
        closePreview();
      } else if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        navigateToExplore();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [anyModalOpen, closePreview, navigateToExplore]);

  const beginPointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!showUI) return;
      pointerRef.current = {
        active: true,
        x: event.clientX,
        y: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
        distance: 0,
        startRotateX: 0,
        startRotateY: rotationRef.current
      };
    },
    [showUI]
  );

  const movePointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const pointer = pointerRef.current;
      if (!showUI || !pointer.active) return;

      pointer.distance += Math.abs(event.clientX - pointer.x) + Math.abs(event.clientY - pointer.y);
      pointer.x = event.clientX;
      pointer.y = event.clientY;

      // Crossing the drag threshold happens once per gesture: only then touch React state.
      if (pointer.distance > dragThreshold && !draggingRef.current) {
        cancelHoverEnter();
        cancelHoverHide();
        setHoveredSlug(null);
        setDragging(true);
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.setPointerCapture(event.pointerId);
        }
      }

      // Horizontal sweep ±65°, vertical tilt disabled (rotateX = 0)
      applyRotation(clamp(pointer.startRotateY + (event.clientX - pointer.startX) * 0.32, -65, 65));
    },
    [showUI, applyRotation, cancelHoverEnter, cancelHoverHide, setDragging]
  );

  const endPointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const pointer = pointerRef.current;
      const dragUpward = pointer.startY - event.clientY;
      pointer.active = false;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      // On mobile/small screen or touch, always spring back to default upright orientation
      if (viewportSize.width < 700 || event.pointerType === "touch") {
        applyRotation(0);
      }
      setDragging(false);

      // A touch swipe up continues to the explore page smoothly
      if (event.pointerType === "touch" && dragUpward > 36) {
        navigateToExplore();
      }
    },
    [applyRotation, navigateToExplore, setDragging, viewportSize.width]
  );

  // Wheel over the world smoothly transitions to explore on downward scroll
  const handleWheel = useCallback(
    (event: ReactWheelEvent<HTMLElement>) => {
      const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (event.deltaY > 8 || Math.abs(delta) >= 14) {
        navigateToExplore();
      }
    },
    [navigateToExplore]
  );

  const leaveWorld = useCallback(() => {
    if (pointerRef.current.active || rotationRef.current === 0) return;
    applyRotation(0);
  }, [applyRotation]);

  /** A click opens the preview; a drag (movement beyond the threshold) does not. */
  const openProduct = useCallback(
    (slug: string) => {
      if (pointerRef.current.distance > dragThreshold) return;
      showPreviewNow(slug);
    },
    [showPreviewNow]
  );

  const productLinks = (
    <div className="sr-only">
      {worldProducts.map((product) => (
        <a key={product.slug} href={`/products/${product.slug}`}>
          {product.title}
        </a>
      ))}
    </div>
  );

  if (!mounted) {
    return (
      <section className="world-shell reference-showcase" aria-label={t("showcase.world.loadingAria")}>
        {productLinks}
      </section>
    );
  }

  const hoveredProduct = visibleHoveredSlug ? (worldProducts.find((product) => product.slug === visibleHoveredSlug) ?? null) : null;

  return (
    <section
      className={[
        "world-shell",
        "reference-showcase",
        "is-in-showcase",
        isNavigatingToExplore ? "is-navigating-to-explore" : "",
        visibleHoveredSlug ? "is-hovering" : "",
        worldPaused ? "is-paused" : "",
        isDragging ? "is-dragging" : "",
        showUI ? "ui-ready" : "ui-hidden"
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--showcase-opacity": "1" } as CSSProperties}
      aria-label={t("showcase.world.aria")}
      tabIndex={0}
      onWheel={handleWheel}
      onPointerDown={beginPointer}
      onPointerMove={movePointer}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerLeave={leaveWorld}
      // Product photos would otherwise start a native image drag, which cancels the pointer gesture.
      onDragStart={(event) => event.preventDefault()}
    >
      <div ref={stageRef} className="world-stage showcase-stage" style={{ ...stageStyle, opacity: 1, pointerEvents: "auto" }}>
        {activeSlots.map((cardSlot, index) => {
          const product = worldProducts[index];
          if (!product) return null;
          const isHovered = visibleHoveredSlug === product.slug;

          return (
            <WorldCard
              key={`showcase-card-${safeProductSetIndex}-${index}`}
              product={product}
              slot={cardSlot}
              isFlyingIn={!showUI}
              isDimmed={Boolean(visibleHoveredSlug && !isHovered)}
              isHovered={isHovered}
              flyInIndex={index}
              categoryLabel={tCategory(product.category)}
              openLabel={t("showcase.world.openProductAria", { title: product.title })}
              onPreviewEnter={handleCardPreviewEnter}
              onPreviewLeave={cancelHoverEnter}
              onOpen={openProduct}
            />
          );
        })}
      </div>

      <div className="world-instructions" aria-hidden="true">
        {t("showcase.world.dragToRotate")}
        <br />
        {t("showcase.world.hoverForDetails")}
        <br />
        {t("showcase.scrollToExplore")}
        <br />
        {t("showcase.world.reloadForMore")}
      </div>

      {hoveredProduct ? (
        <div className="world-center-preview">
          <Link
            href={`/products/${hoveredProduct.slug}`}
            className="world-center-preview-card"
            style={{ "--preview-accent": hoveredProduct.accent || "#3385FF" } as CSSProperties}
            aria-label={t("showcase.world.viewDetailsAria", { title: hoveredProduct.title })}
          >
            <div className="center-preview-top-hud">
              <h3 className="center-preview-title">
                <span className="center-preview-title-badge">{hoveredProduct.title}</span>
              </h3>
              <span className="center-preview-category">{tCategory(hoveredProduct.category)}</span>
            </div>

            <div className="center-preview-media">
              <ProductImage product={hoveredProduct} targetWidth={IMAGE_WIDTHS.hero} priority />
            </div>

            <div className="center-preview-bottom-hud">
              <div className="preview-price-pill">
                <span className="price-value">{formatPrice(hoveredProduct.price)}</span>
                {hasValidOldPrice(hoveredProduct) ? (
                  <span className="original-price">{formatPrice(hoveredProduct.old_price)}</span>
                ) : null}
              </div>

              <div className="preview-details-link" aria-hidden="true">
                <span className="preview-details-text">{t("action.viewDetails")}</span>
                <span className="preview-details-icon-btn">
                  <ArrowUpRight size={13} />
                </span>
              </div>
            </div>
          </Link>
        </div>
      ) : null}

      <div className="world-set-controls">
        <button
          type="button"
          className="world-set-count world-alternating-indicator"
          onClick={navigateToExplore}
          aria-label={
            indicatorPhase === "pages"
              ? t("showcase.world.indicatorAria", {
                  page: safeProductSetIndex + 1,
                  pages: productSetCount,
                  products: products.length
                })
              : t("showcase.world.scrollAria")
          }
          title={t("showcase.scrollToExplore")}
        >
          {/* Both layers stay mounted and only switch class: mounting/unmounting nodes here forced a
              full-page style recalculation (the stylesheet relies on body:has(...) selectors). */}
          <span
            className={`indicator-slide-content is-pages ${indicatorPhase === "pages" ? "is-active" : "is-inactive"}`}
            aria-hidden={indicatorPhase !== "pages"}
          >
            {formatNumber(String(safeProductSetIndex + 1).padStart(2, "0"))} /{" "}
            {formatNumber(String(productSetCount).padStart(2, "0"))} {t("label.pages")} •{" "}
            {formatNumber(products.length)} {t("label.products")}
          </span>
          <span
            className={`indicator-slide-content is-scroll ${indicatorPhase === "scroll" ? "is-active" : "is-inactive"}`}
            aria-hidden={indicatorPhase !== "scroll"}
          >
            <ScrollHint label={t("showcase.scrollToExplore")} />
          </span>
        </button>
      </div>

      {productLinks}
    </section>
  );
}

type WorldCardProps = {
  product: ProductSummary;
  slot: ReferenceShowcaseSlot;
  flyInIndex: number;
  isFlyingIn: boolean;
  isDimmed: boolean;
  isHovered: boolean;
  categoryLabel: string;
  openLabel: string;
  onPreviewEnter: (slug: string) => void;
  onPreviewLeave: () => void;
  onOpen: (slug: string) => void;
};

/**
 * Memoized so hover changes only re-render the cards whose state changed. Pointer down/move/up
 * bubble to the world section, which handles dragging for every card in one place.
 */
const WorldCard = memo(function WorldCard({
  product,
  slot: cardSlot,
  flyInIndex,
  isFlyingIn,
  isDimmed,
  isHovered,
  categoryLabel,
  openLabel,
  onPreviewEnter,
  onPreviewLeave,
  onOpen
}: WorldCardProps) {
  const style = {
    ...getReferenceCardStyle(cardSlot, product.accent, flyInIndex),
    "--fly-in-delay": `${flyInIndex * 12}ms`,
    "--fly-out-delay": `${(flyInIndex % 5) * 16}ms`
  } as CSSProperties & Record<`--${string}`, string>;

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
      data-fly-in-origin={getFlyInOrigin(cardSlot, flyInIndex)}
      style={style}
      type="button"
      onPointerEnter={() => onPreviewEnter(product.slug)}
      onPointerLeave={onPreviewLeave}
      onFocus={() => onPreviewEnter(product.slug)}
      onBlur={onPreviewLeave}
      onClick={() => onOpen(product.slug)}
      aria-label={openLabel}
    >
      <div className="product-media world-product-media">
        <ProductImage
          product={product}
          compact={cardSlot.kind === "mini"}
          targetWidth={cardSlot.kind === "hero" ? IMAGE_WIDTHS.hero : undefined}
          priority={cardSlot.kind === "hero"}
        />
      </div>
      {cardSlot.kind !== "mini" ? (
        <span className="world-card-copy" aria-hidden="true">
          <span className="world-card-info-group">
            <span className="world-card-title">{product.title}</span>
            <span className="world-card-category">{categoryLabel}</span>
          </span>
        </span>
      ) : null}
      <span className="sr-only">{product.title}</span>
    </button>
  );
});
