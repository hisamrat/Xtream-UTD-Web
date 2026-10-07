"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { formatPrice } from "@/domain/commerce/money";
import { hasValidOldPrice } from "@/domain/product/pricing";
import type { ProductSummary } from "@/domain/product/product-summary";
import { ProductImage } from "@/features/product/components/ProductImage";
import { useI18n } from "@/i18n/LanguageProvider";
import { useDocumentHidden, useHydrated, useViewportSize } from "@/shared/hooks/useBrowserState";
import { usePrefersReducedMotion } from "@/shared/hooks/useMediaQuery";
import { useAnyModalOpen } from "@/shared/hooks/useModalLayer";
import { readStored, useStoredString, writeStored } from "@/shared/lib/stored-value";
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
 */
function useHomeShuffleOffset(productCount: number): number {
  const [stored] = useStoredString("session", SHUFFLE_STORAGE_KEY);

  useLayoutEffect(() => {
    const total = Math.max(1, productCount);
    const previous = Number.parseInt(readStored("session", SHUFFLE_STORAGE_KEY) ?? "", 10);
    const step = 1 + Math.floor(Math.random() * Math.max(1, productCount - 1));
    const next = Number.isNaN(previous) ? Math.floor(Math.random() * total) : (previous + step) % total;
    writeStored("session", SHUFFLE_STORAGE_KEY, String(next));
  }, [productCount]);

  const offset = Number.parseInt(stored ?? "", 10);
  return Number.isNaN(offset) ? 0 : offset;
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
  const [worldView, setWorldView] = useState<WorldViewState>(RESTING_VIEW);
  const [productSetIndex, setProductSetIndex] = useState(0);
  const [indicatorPhase, setIndicatorPhase] = useState<"pages" | "scroll">("pages");
  const [isNavigatingToExplore, setIsNavigatingToExplore] = useState(false);

  const worldViewRef = useRef(worldView);
  const pointerRef = useRef<PointerState>(IDLE_POINTER);
  const isNavigatingRef = useRef(false);
  const hoverEnterTimerRef = useRef<number | null>(null);
  const hoverHideTimerRef = useRef<number | null>(null);
  const closeCooldownUntilRef = useRef(0);

  useEffect(() => {
    worldViewRef.current = worldView;
  }, [worldView]);

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
  const stageStyle = getShowcaseStageStyle(getShowcaseStageScale(viewportSize, showcaseSlots), viewportSize, worldView);
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
      if (worldViewRef.current.dragging) return;
      cancelHoverEnter();
      if (Date.now() < closeCooldownUntilRef.current) return;
      hoverEnterTimerRef.current = window.setTimeout(() => {
        hoverEnterTimerRef.current = null;
        showPreviewNow(slug);
      }, PREVIEW_ENTER_DELAY_MS);
    },
    [cancelHoverEnter, showPreviewNow]
  );

  const navigateToExplore = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setIsNavigatingToExplore(true);
    cancelHoverEnter();
    cancelHoverHide();
    setHoveredSlug(null);
    router.push("/explore");
  }, [cancelHoverEnter, cancelHoverHide, router]);

  const resetView = useCallback(() => {
    cancelHoverHide();
    cancelHoverEnter();
    setHoveredSlug(null);
    setWorldView(RESTING_VIEW);
    pointerRef.current = IDLE_POINTER;
  }, [cancelHoverEnter, cancelHoverHide]);

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
        startRotateX: worldViewRef.current.rotateX,
        startRotateY: worldViewRef.current.rotateY
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
      const isDragging = pointer.distance > dragThreshold;

      if (isDragging) {
        cancelHoverHide();
        setHoveredSlug(null);
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.setPointerCapture(event.pointerId);
        }
      }

      // Horizontal sweep ±65°, vertical tilt ±35°.
      const rotateY = clamp(pointer.startRotateY + (event.clientX - pointer.startX) * 0.32, -65, 65);
      const rotateX = clamp(pointer.startRotateX - (event.clientY - pointer.startY) * 0.24, -35, 35);
      setWorldView((current) => ({ ...current, rotateX, rotateY, dragging: isDragging }));
    },
    [showUI, cancelHoverHide]
  );

  const endPointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const pointer = pointerRef.current;
      const dragUpward = pointer.startY - event.clientY;
      pointer.active = false;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      // On mobile/small screen or touch, always spring back to default upright orientation so cards never stay tilted
      if (viewportSize.width < 700 || event.pointerType === "touch") {
        setWorldView((current) => ({
          ...RESTING_VIEW,
          zoom: current.zoom
        }));
      } else {
        setWorldView((current) => (current.dragging ? { ...current, dragging: false } : current));
      }

      // A touch swipe up continues to the explore page.
      if (event.pointerType === "touch" && dragUpward > 65) {
        navigateToExplore();
      }
    },
    [navigateToExplore, viewportSize.width]
  );

  // Wheel over the world continues to the explore page.
  const handleWheel = useCallback(
    (event: ReactWheelEvent<HTMLElement>) => {
      const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(delta) >= 8) navigateToExplore();
    },
    [navigateToExplore]
  );

  const leaveWorld = useCallback(() => {
    if (pointerRef.current.active) return;
    setWorldView((current) =>
      current.rotateX === 0 && current.rotateY === 0 && current.parallaxX === 0 && current.parallaxY === 0
        ? current
        : { ...current, rotateX: 0, rotateY: 0, parallaxX: 0, parallaxY: 0 }
    );
  }, []);

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
        worldView.dragging ? "is-dragging" : "",
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
      <div className="world-stage showcase-stage" style={{ ...stageStyle, opacity: 1, pointerEvents: "auto" }}>
        {activeSlots.map((cardSlot, index) => {
          const product = worldProducts[index];
          if (!product) return null;
          const isHovered = visibleHoveredSlug === product.slug;

          return (
            <WorldCard
              key={`showcase-card-${safeProductSetIndex}-${product.id}-${index}`}
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
              onPointerDown={beginPointer}
              onPointerMove={movePointer}
              onPointerEnd={endPointer}
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
              <ProductImage product={hoveredProduct} priority />
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
          {indicatorPhase === "pages" ? (
            <span key="indicator-pages" className="indicator-slide-content is-pages is-active">
              {formatNumber(String(safeProductSetIndex + 1).padStart(2, "0"))} /{" "}
              {formatNumber(String(productSetCount).padStart(2, "0"))} {t("label.pages")} •{" "}
              {formatNumber(products.length)} {t("label.products")}
            </span>
          ) : (
            <span key="indicator-scroll" className="indicator-slide-content is-scroll is-active">
              <ScrollHint label={t("showcase.scrollToExplore")} />
            </span>
          )}
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
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerEnd: (event: ReactPointerEvent<HTMLElement>) => void;
  onOpen: (slug: string) => void;
};

/** Memoized so dragging the world (which re-renders the stage) does not re-render every card. */
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
  onPointerDown,
  onPointerMove,
  onPointerEnd,
  onOpen
}: WorldCardProps) {
  const style = {
    ...getReferenceCardStyle(cardSlot, product.accent, flyInIndex),
    "--fly-in-delay": `${flyInIndex * 24}ms`
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
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onClick={() => onOpen(product.slug)}
      aria-label={openLabel}
    >
      <div className="product-media world-product-media">
        <ProductImage product={product} compact={cardSlot.kind === "mini"} priority={cardSlot.kind === "hero"} />
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
