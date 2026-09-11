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
  slot(0, 0, 200, 235, 100, "hero", { floatY: -8, delay: -0.7 }),
  slot(0, -250, 156, 165, 62, "feature", { floatY: -7, delay: -2.8 }),
  slot(0, 250, 156, 165, 54, "feature", { floatY: -7, delay: -4.1 }),

  // Left Side (Tier 1, Tier 2, Tier 3 - Matching Original Placement)
  slot(-225, -170, 156, 165, 58, "feature", { floatY: -7, delay: -1.9 }),
  slot(-225, 80, 156, 165, 59, "feature", { floatY: -7, delay: -3.0 }),
  slot(-225, 295, 146, 155, 35, "medium", { opacity: 0.94, floatY: -5, delay: -1.6 }),
  slot(-440, -160, 146, 155, 35, "medium", { opacity: 0.94, floatY: -5, delay: -2.3 }),
  slot(-440, 60, 156, 165, 50, "feature", { floatX: -3, floatY: -6, delay: -3.3 }),
  slot(-440, 275, 146, 155, 33, "medium", { opacity: 0.94, floatY: -5, delay: -2.7 }),
  slot(-630, -25, 142, 150, 34, "medium", { opacity: 0.94, floatY: -1.5 }),

  // Right Side (Tier 1, Tier 2, Tier 3 - Matching Original Placement)
  slot(225, -170, 156, 165, 58, "feature", { floatY: -7, delay: -1.7 }),
  slot(225, 80, 156, 165, 59, "feature", { floatY: -7, delay: -3.2 }),
  slot(225, 295, 146, 155, 35, "medium", { opacity: 0.94, floatY: -1.4 }),
  slot(440, -160, 146, 155, 35, "medium", { opacity: 0.94, floatY: -2.4 }),
  slot(440, 60, 156, 165, 50, "feature", { floatX: 3, floatY: -6, delay: -3.4 }),
  slot(440, 275, 146, 155, 33, "medium", { opacity: 0.94, floatY: -2.9 }),
  slot(630, -25, 142, 150, 34, "medium", { opacity: 0.94, floatY: -1.8 }),

  // Surrounding Mini Floating Badges (56x56) in clear interstitial channels
  slot(-116, -155, 56, 56, 28, "mini", { opacity: 0.94, delay: -2 }),
  slot(116, -155, 56, 56, 28, "mini", { opacity: 0.94, delay: -2.4 }),
  slot(-116, 155, 56, 56, 28, "mini", { opacity: 0.94, delay: -1.9 }),
  slot(116, 155, 56, 56, 28, "mini", { opacity: 0.94, delay: -3.5 }),
  slot(-225, -45, 56, 56, 26, "mini", { opacity: 0.92, delay: -2.3 }),
  slot(225, -45, 56, 56, 26, "mini", { opacity: 0.92, delay: -3.1 }),
  slot(-335, -60, 56, 56, 26, "mini", { opacity: 0.92, delay: -1.3 }),
  slot(335, -60, 56, 56, 26, "mini", { opacity: 0.92, delay: -2.8 }),
  slot(-335, 195, 56, 56, 24, "mini", { opacity: 0.9, delay: -4 }),
  slot(335, 195, 56, 56, 24, "mini", { opacity: 0.9, delay: -2.2 }),
  slot(-335, -295, 56, 56, 24, "mini", { opacity: 0.9, delay: -3.2 }),
  slot(335, -295, 56, 56, 24, "mini", { opacity: 0.9, delay: -1.7 }),
  slot(-545, -165, 56, 56, 22, "mini", { opacity: 0.88, delay: -2.7 }),
  slot(545, -165, 56, 56, 22, "mini", { opacity: 0.88, delay: -3.4 }),
  slot(-545, 185, 56, 56, 22, "mini", { opacity: 0.88, delay: -1.5 }),
  slot(545, 185, 56, 56, 22, "mini", { opacity: 0.88, delay: -2.9 }),
  slot(-630, -145, 56, 56, 20, "mini", { opacity: 0.86, delay: -3.2 }),
  slot(630, -145, 56, 56, 20, "mini", { opacity: 0.86, delay: -2.7 }),
  slot(-630, 95, 56, 56, 20, "mini", { opacity: 0.86, delay: -2.1 }),
  slot(630, 95, 56, 56, 20, "mini", { opacity: 0.86, delay: -3.6 }),
  slot(-735, -25, 56, 56, 18, "mini", { opacity: 0.84, delay: -1.5 }),
  slot(735, -25, 56, 56, 18, "mini", { opacity: 0.84, delay: -2.5 })
];

const mobileReferenceSlots: ReferenceShowcaseSlot[] = [
  // Center Column (3 cards)
  slot(0, 0, 175, 215, 80, "hero", { floatY: -7, delay: -0.7 }),
  slot(0, -255, 146, 155, 52, "feature", { floatY: -6, delay: -2.8 }),
  slot(0, 255, 146, 155, 48, "feature", { floatY: -6, delay: -4.1 }),

  // Left Column (X = -180, 3 cards)
  slot(-180, -180, 136, 145, 46, "medium", { floatY: -5, delay: -2.0 }),
  slot(-180, 80, 136, 145, 47, "medium", { floatY: -6, delay: -3.0 }),
  slot(-180, 295, 130, 140, 38, "medium", { opacity: 0.94, floatY: -5, delay: -1.6 }),

  // Right Column (X = 180, 3 cards)
  slot(180, -180, 136, 145, 46, "medium", { floatY: -5, delay: -1.7 }),
  slot(180, 80, 136, 145, 47, "medium", { floatY: -6, delay: -3.2 }),
  slot(180, 295, 130, 140, 38, "medium", { opacity: 0.94, floatY: -5, delay: -1.4 }),

  // Mini Badges (52x52)
  slot(-180, -50, 52, 52, 22, "mini", { opacity: 0.92, delay: -2.2 }),
  slot(180, -50, 52, 52, 22, "mini", { opacity: 0.92, delay: -1.8 }),
  slot(-180, 190, 52, 52, 20, "mini", { opacity: 0.9, delay: -2.5 }),
  slot(180, 190, 52, 52, 20, "mini", { opacity: 0.9, delay: -3.1 }),
  slot(-280, -180, 52, 52, 18, "mini", { opacity: 0.88, delay: -2.6 }),
  slot(280, -180, 52, 52, 18, "mini", { opacity: 0.88, delay: -1.7 }),
  slot(-280, 80, 52, 52, 18, "mini", { opacity: 0.88, delay: -3.4 }),
  slot(280, 80, 52, 52, 18, "mini", { opacity: 0.88, delay: -2.7 }),
  slot(0, -370, 52, 52, 16, "mini", { opacity: 0.86, delay: -1.5 }),
  slot(0, 370, 52, 52, 16, "mini", { opacity: 0.86, delay: -1.5 })
];

export function ProductWorld({ products }: ProductWorldProps) {
  const router = useRouter();
  const { t, formatNumber, tCategory } = useLanguage();
  const prioritizedProducts = useMemo(() => prioritizeWorldProducts(products), [products]);
  const [mounted, setMounted] = useState(false);
  const [worldReady, setWorldReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(18);
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

useEffect(() => {
  if (!hoveredSlug) {
    return;
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closePreview();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [closePreview, hoveredSlug]);

useEffect(() => {
  setMounted(true);

  const updateViewport = () => {
    const nextViewport = { width: window.innerWidth, height: window.innerHeight };
    setViewportSize(nextViewport);
  };
  updateViewport();
  window.addEventListener("resize", updateViewport);

  const progressTimer = window.setInterval(() => {
    setLoadingProgress((progress) => Math.min(96, progress + 13));
  }, 90);
  const readyTimer = window.setTimeout(() => {
    setLoadingProgress(100);
    setWorldReady(true);
  }, 680);

  return () => {
    window.removeEventListener("resize", updateViewport);
    window.clearInterval(progressTimer);
    window.clearTimeout(readyTimer);
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

const beginPointer = useCallback((event: ReactPointerEvent<HTMLElement>) => {
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
event.currentTarget.setPointerCapture(event.pointerId);
}, [worldView.rotateX, worldView.rotateY]);

  const movePointer = useCallback((event: ReactPointerEvent<HTMLElement>) => {
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
    }

    setWorldView((current) => ({
      ...current,
      rotateX: clamp(pointer.startRotateX - dragY * 0.035, -8, 8),
      rotateY: clamp(pointer.startRotateY + dragX * 0.04, -14, 14),
      dragging: isDragging
    }));
  }, [cancelHoverHide]);

  const endPointer = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    pointerRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setWorldView((current) => ({ ...current, dragging: false }));
  }, []);

  const handleWorldWheel = useCallback((event: ReactWheelEvent<HTMLElement>) => {
    setWorldView((current) => {
      const delta = event.deltaY < 0 ? 0.06 : -0.06;
      const nextZoom = clamp(current.zoom + delta, 0.75, 1.45);
      return { ...current, zoom: nextZoom };
    });
  }, []);

  const leaveWorld = useCallback(() => {
    if (pointerRef.current.active) {
      return;
    }

    setWorldView((current) => ({ ...current, parallaxX: 0, parallaxY: 0, rotateX: 0, rotateY: 0 }));
  }, []);

const beginWorldPointer = useCallback(
(event: ReactPointerEvent<HTMLElement>) => {
if (event.target !== event.currentTarget) {
return;
}

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

  const reloadNextProductSet = useCallback(() => {
    cancelHoverHide();
    setHoveredSlug(null);
    setProductSetIndex((index) => (index + 1) % productSetCount);
  }, [cancelHoverHide, productSetCount]);

  useEffect(() => {
    const handleRemoteReload = () => {
      reloadNextProductSet();
    };
    window.addEventListener("xtream-utd:world-reload", handleRemoteReload);
    return () => window.removeEventListener("xtream-utd:world-reload", handleRemoteReload);
  }, [reloadNextProductSet]);

if (!mounted || !worldReady) {
return <ProductWorldLoading progress={loadingProgress} products={prioritizedProducts.slice(0, 4)} />;
}

const hoveredProduct = hoveredSlug ? worldProducts.find((product) => product.slug === hoveredSlug) ?? null : null;

return (
<section
className={[
"world-shell",
"reference-showcase",
hoveredSlug ? "is-hovering" : "",
worldPaused ? "is-paused" : "",
worldView.dragging ? "is-dragging" : ""
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
<div className="world-stage" style={stageStyle}>
{worldProducts.map((product, index) => {
const slotForProduct = activeSlots[index] ?? activeSlots[activeSlots.length - 1] ?? desktopReferenceSlots[0];

return (
<ReferenceWorldProduct
key={product.id}
product={product}
slot={slotForProduct}
isDimmed={Boolean(hoveredSlug && hoveredSlug !== product.slug)}
isHovered={hoveredSlug === product.slug}
onPreviewEnter={handleCardPreviewEnter}
onPreviewLeave={handleCardPreviewLeave}
onPointerDown={beginPointer}
onPointerEnd={endPointer}
onOpen={openProduct}
/>
);
})}
</div>

      <div className="world-instructions" aria-hidden="true">
        {t("drag_to_rotate")}
        <br />
        {t("hover_for_details")}
        <br />
        {t("scroll_to_zoom")}
      </div>

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

      {productSetCount > 1 ? (
        <div className="world-set-controls" aria-label="Home page product sets">
          <span className="world-set-count">
            {formatNumber(String(safeProductSetIndex + 1).padStart(2, "0"))} / {formatNumber(String(productSetCount).padStart(2, "0"))} {t("pages")} • {formatNumber(products.length)} {t("products")}
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

type ReferenceWorldProductProps = {
  product: Product;
  slot: ReferenceShowcaseSlot;
  isDimmed: boolean;
  isHovered: boolean;
  onPreviewEnter: (slug: string) => void;
  onPreviewLeave: () => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerEnd: (event: ReactPointerEvent<HTMLElement>) => void;
  onOpen: (product: Product) => void;
};

function ReferenceWorldProduct({
  product,
  slot: cardSlot,
  isDimmed,
  isHovered,
  onPreviewEnter,
  onPreviewLeave,
  onPointerDown,
  onPointerEnd,
  onOpen
}: ReferenceWorldProductProps) {
  const { tCategory } = useLanguage();

  return (
    <button
      className={[
        "world-card",
        "reference-world-card",
        `kind-${cardSlot.kind}`,
        getLegacySizeClass(cardSlot.kind),
        isDimmed ? "dimmed" : "",
        isHovered ? "hovered" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      style={getReferenceCardStyle(cardSlot, product.accent)}
      type="button"
      onPointerEnter={() => onPreviewEnter(product.slug)}
      onPointerLeave={onPreviewLeave}
      onFocus={() => onPreviewEnter(product.slug)}
      onBlur={onPreviewLeave}
      onPointerDown={onPointerDown}
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

function ProductWorldLoading({ progress, products }: { progress: number; products: Product[] }) {
return (
<section className="world-loading" aria-label="Preparing product showcase">
<div className="world-loading-panel">
<p className="section-kicker">Preparing product showcase</p>
<h1 className="page-title">{progress}%</h1>
<div className="loading-product-strip" aria-hidden="true">
{products.map((product, index) => (
<div className={`loading-product-card ${index < Math.ceil(progress / 25) ? "is-loaded" : ""}`} key={product.id}>
<ProductArtwork product={product} compact />
</div>
))}
</div>
<div className="loading-bar" aria-hidden="true">
<span style={{ width: `${progress}%` }} />
</div>
<p className="page-lede">Loading product previews and interactions</p>
</div>
</section>
);
}

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

  return {
    "--world-stage-scale": String(scale * worldView.zoom),
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
  accent: string
): CSSProperties & Record<`--${string}`, string> {
  const slotScale = cardSlot.scale ?? 1;
  const hoverScale = slotScale + (cardSlot.kind === "hero" ? 0.22 : cardSlot.kind === "mini" ? 0.35 : 0.28);
  const duration = cardSlot.duration ?? 7.5 + Math.abs(cardSlot.x % 5) * 0.35;
  const floatX = cardSlot.floatX ?? (cardSlot.kind === "mini" ? 3 : 5);
  const floatY = cardSlot.floatY ?? (cardSlot.kind === "mini" ? -5 : -8);
  const floatRotate = cardSlot.floatRotate ?? (cardSlot.kind === "mini" ? 0.45 : 0.28);
  const cardDepth = cardSlot.kind === "hero" ? 72 : cardSlot.kind === "feature" ? 32 : cardSlot.kind === "medium" ? 10 : -26;

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
    "--world-card-float-delay": `${cardSlot.delay ?? 0}s`
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
