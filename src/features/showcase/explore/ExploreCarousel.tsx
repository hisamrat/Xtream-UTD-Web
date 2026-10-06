"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { ProductSummary } from "@/domain/product/product-summary";
import { ProductImage } from "@/features/product/components/ProductImage";
import { useI18n } from "@/i18n/LanguageProvider";
import { useDocumentHidden, useHydrated, useViewportSize } from "@/shared/hooks/useBrowserState";
import { usePrefersReducedMotion } from "@/shared/hooks/useMediaQuery";
import { useAnyModalOpen } from "@/shared/hooks/useModalLayer";
import { useShowcaseEvent } from "../lib/showcase-events";
import { dragThreshold } from "../world/world-layout";
import {
  CAROUSEL_EASE,
  CAROUSEL_PERSPECTIVE,
  getCardGap,
  getCardHeight,
  getCardPlacement,
  getCardWidth,
  repeatToMinimum,
  SNAP_EASE,
  wrappedOffset
} from "./carousel-math";

const AUTOPLAY_MS = 3200;
const INPUT_SETTLE_MS = 140;
const SETTLED_EPSILON = 0.0005;
const SERVER_VIEWPORT = { width: 1440, height: 900 };

type DragState = { active: boolean; startX: number; startY: number; lastX: number; distance: number };

function applyPlacement(node: HTMLDivElement | null, offset: number, cardWidth: number, cardGap: number) {
  if (!node) return;
  const placement = getCardPlacement(offset, cardWidth, cardGap);
  if (!placement.visible) {
    node.style.visibility = "hidden";
    node.style.opacity = "0";
    node.style.pointerEvents = "none";
    return;
  }
  node.style.setProperty("--hud-opacity", placement.hudOpacity.toFixed(3));
  node.style.setProperty("--hud-pointer", placement.hudOpacity > 0.75 ? "auto" : "none");
  node.style.visibility = "visible";
  node.style.opacity = placement.opacity.toFixed(3);
  node.style.transform = placement.transform;
  node.style.filter = placement.filter;
  node.style.zIndex = String(placement.zIndex);
  node.style.pointerEvents = placement.interactive ? "auto" : "none";
}

export function ExploreCarousel({ products }: { products: ProductSummary[] }) {
  const router = useRouter();
  const { t, tCategory } = useI18n();
  const reducedMotion = usePrefersReducedMotion();
  const anyModalOpen = useAnyModalOpen();
  const hydrated = useHydrated();
  const viewport = useViewportSize(SERVER_VIEWPORT);
  const documentHidden = useDocumentHidden();
  const [onScreen, setOnScreen] = useState(true);

  const sectionRef = useRef<HTMLElement | null>(null);
  const plateNodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const lastInputTimeRef = useRef(0);
  const lastInteractionRef = useRef(0);
  const dragRef = useRef<DragState>({ active: false, startX: 0, startY: 0, lastX: 0, distance: 0 });

  const carouselProducts = useMemo(() => repeatToMinimum(products), [products]);
  const cardHeight = getCardHeight(viewport);
  const cardWidth = getCardWidth(cardHeight, viewport.width);
  const cardGap = getCardGap(viewport.width);
  const paused = documentHidden || anyModalOpen || !onScreen;
  // Cards are positioned in a layout effect right after hydration, before the first paint.
  const isReady = hydrated && carouselProducts.length > 0;

  useEffect(() => {
    lastInteractionRef.current = Date.now();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry?.isIntersecting ?? true));
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const step = useCallback((delta: number) => {
    lastInteractionRef.current = Date.now();
    lastInputTimeRef.current = Date.now();
    targetRef.current += delta;
  }, []);

  useShowcaseEvent("explore-prev", () => step(-1));
  useShowcaseEvent("explore-next", () => step(1));
  useShowcaseEvent("world-reload", () => step(1));

  // Autoplay: advance one card after a period without interaction.
  useEffect(() => {
    if (paused || reducedMotion) return;
    const interval = window.setInterval(() => {
      if (Date.now() - lastInteractionRef.current >= AUTOPLAY_MS && !dragRef.current.active) {
        targetRef.current += 1;
      }
    }, AUTOPLAY_MS);
    return () => window.clearInterval(interval);
  }, [paused, reducedMotion]);

  // Animation loop: eases the camera toward the target and positions cards via direct style writes.
  useLayoutEffect(() => {
    const count = carouselProducts.length;
    if (count === 0) return;

    const placeAll = (position: number) => {
      for (let index = 0; index < count; index += 1) {
        applyPlacement(plateNodesRef.current[index], wrappedOffset(index, position, count), cardWidth, cardGap);
      }
      const focusIndex = ((Math.round(position) % count) + count) % count;
      const accent = carouselProducts[focusIndex]?.accent;
      if (accent && backgroundRef.current) {
        backgroundRef.current.style.setProperty("--active-tint", accent);
      }
    };

    placeAll(currentRef.current);
    if (paused || count < 2) return;

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (Date.now() - lastInputTimeRef.current > INPUT_SETTLE_MS) {
        const nearest = Math.round(targetRef.current);
        targetRef.current += (nearest - targetRef.current) * (reducedMotion ? 1 : SNAP_EASE);
      }

      const remaining = targetRef.current - currentRef.current;
      if (Math.abs(remaining) < SETTLED_EPSILON) {
        if (currentRef.current !== targetRef.current) {
          currentRef.current = targetRef.current;
          placeAll(currentRef.current);
        }
        return; // Settled: nothing to move this frame.
      }

      currentRef.current += remaining * (reducedMotion ? 1 : CAROUSEL_EASE);
      placeAll(currentRef.current);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [carouselProducts, cardGap, cardWidth, paused, reducedMotion]);

  const onMouseDown = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (event.button !== 0 || window.matchMedia("(pointer: coarse)").matches) return;
    lastInteractionRef.current = Date.now();
    dragRef.current = { active: true, startX: event.clientX, startY: event.clientY, lastX: event.clientX, distance: 0 };
  }, []);

  const onMouseMove = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    lastInteractionRef.current = Date.now();
    lastInputTimeRef.current = Date.now();
    const deltaX = event.clientX - drag.lastX;
    drag.distance += Math.abs(event.clientX - drag.startX) + Math.abs(event.clientY - drag.startY);
    drag.lastX = event.clientX;
    targetRef.current -= deltaX * 0.0035;
  }, []);

  const onMouseUp = useCallback(() => {
    dragRef.current.active = false;
  }, []);

  /** Clicking the centred card opens it; clicking a side card brings it to the centre. Drags are ignored. */
  const handleCardClick = useCallback(
    (product: ProductSummary, index: number) => {
      lastInteractionRef.current = Date.now();
      if (dragRef.current.distance > dragThreshold) return;
      const offset = wrappedOffset(index, currentRef.current, carouselProducts.length);
      if (Math.abs(offset) < 0.65) {
        router.push(`/products/${product.slug}`);
      } else {
        lastInputTimeRef.current = Date.now();
        targetRef.current += offset;
      }
    },
    [carouselProducts.length, router]
  );

  return (
    <section
      ref={sectionRef}
      className={`explore-carousel-section is-in-carousel ${isReady ? "is-ready" : "is-loading"}`}
      aria-label={t("showcase.explore.carouselAria")}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onDragStart={(event) => event.preventDefault()}
    >
      <div className="scale-carousel-viewport" style={{ perspective: `${CAROUSEL_PERSPECTIVE}px`, perspectiveOrigin: "50% 50%" }}>
        <div className="scale-carousel-bg" ref={backgroundRef} aria-hidden="true">
          <div className="bg-blob-a" />
          <div className="bg-blob-b" />
        </div>
        <div className="scale-carousel-plates-container">
          {carouselProducts.map((product, index) => (
            <div
              key={`explore-card-${product.id}-${index}`}
              ref={(element) => {
                plateNodesRef.current[index] = element;
              }}
              className="scale-carousel-card-slot"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: cardWidth,
                height: cardHeight,
                marginLeft: -cardWidth / 2,
                marginTop: -cardHeight / 2,
                overflow: "visible",
                backfaceVisibility: "hidden",
                visibility: "hidden",
                opacity: 0,
                willChange: "transform, opacity, filter"
              }}
            >
              <div className="carousel-focus-top carousel-card-hud">
                <span className="carousel-focus-title">{product.title}</span>
              </div>
              <div
                className="scale-carousel-card"
                style={{ "--product-accent": product.accent || "#8b5cf6", width: "100%", height: "100%" } as CSSProperties}
                onClick={() => handleCardClick(product, index)}
                role="button"
                tabIndex={0}
                aria-label={t("showcase.explore.viewProductAria", { title: product.title })}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleCardClick(product, index);
                  }
                }}
              >
                <div className="scale-carousel-media">
                  <div className="scale-carousel-art-wrap">
                    <ProductImage product={product} />
                  </div>
                </div>
              </div>
              <div className="carousel-focus-bottom carousel-card-hud">
                <span className="carousel-focus-category">{tCategory(product.category)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="world-instructions explore-instructions" aria-hidden="true">
        {t("showcase.explore.clickToView")}
        <br />
        {t("showcase.scrollToExplore")}
      </div>
    </section>
  );
}
