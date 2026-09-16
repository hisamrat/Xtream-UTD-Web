"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { Product } from "@/lib/product-schema";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  compact?: boolean;
  className?: string;
  onProductClick?: () => void;
};

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ProductGrid({
  products,
  compact = false,
  className = "product-grid",
  onProductClick
}: ProductGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevRectsRef = useRef<Map<string, DOMRect>>(new Map());
  const isFirstMountRef = useRef(true);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const container = containerRef.current;
    if (!container) return;

    // LAST: Measure positions after DOM update
    const cardElements = container.querySelectorAll<HTMLElement>("[data-flip-id]");
    const currentRects = new Map<string, DOMRect>();

    cardElements.forEach((el) => {
      const id = el.getAttribute("data-flip-id");
      if (id) {
        currentRects.set(id, el.getBoundingClientRect());
      }
    });

    // Skip FLIP on initial page load (let standard CSS entrance take effect)
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      prevRectsRef.current = currentRects;
      return;
    }

    if (prefersReducedMotion) {
      prevRectsRef.current = currentRects;
      return;
    }

    const prevRects = prevRectsRef.current;
    const animatingElements: Array<{ el: HTMLElement; isNew: boolean }> = [];

    // INVERT: Calculate delta and invert via translate3d
    cardElements.forEach((el) => {
      const id = el.getAttribute("data-flip-id");
      if (!id) return;

      const first = prevRects.get(id);
      const last = currentRects.get(id);

      if (first && last) {
        const dx = first.left - last.left;
        const dy = first.top - last.top;

        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
          el.style.transition = "none";
          el.style.willChange = "transform";
          animatingElements.push({ el, isNew: false });
        }
      } else if (last) {
        // Newly mounted card entering the grid
        el.style.transform = "translate3d(0, 16px, 0) scale(0.96)";
        el.style.opacity = "0";
        el.style.transition = "none";
        el.style.willChange = "transform, opacity";
        animatingElements.push({ el, isNew: true });
      }
    });

    // Store current rects for future FLIP calculations
    prevRectsRef.current = currentRects;

    if (animatingElements.length === 0) return;

    // Force browser reflow to commit the inverted positions
    void container.offsetHeight;

    // PLAY: Animate to final position with composite-only properties and subtle stagger
    const rafId = requestAnimationFrame(() => {
      animatingElements.forEach(({ el }, index) => {
        // Subtle stagger: 25ms (0.025s) between items, capped at 250ms
        const staggerDelay = Math.min(index * 25, 250);

        el.style.transition = `transform 380ms cubic-bezier(0.16, 1, 0.3, 1) ${staggerDelay}ms, opacity 280ms ease ${staggerDelay}ms`;
        el.style.transform = "translate3d(0, 0, 0) scale(1)";
        el.style.opacity = "1";

        const handleTransitionEnd = (e: TransitionEvent) => {
          if (e.target !== el) return;
          el.style.transition = "";
          el.style.transform = "";
          el.style.opacity = "";
          el.style.willChange = "";
          el.removeEventListener("transitionend", handleTransitionEnd);
        };

        el.addEventListener("transitionend", handleTransitionEnd);
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [products]);

  return (
    <div ref={containerRef} className={className} aria-live="polite">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          compact={compact}
          onClick={onProductClick}
        />
      ))}
    </div>
  );
}
