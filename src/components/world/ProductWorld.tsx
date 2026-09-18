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

// -------------------------------------------------------------
// -------------------------------------------------------------
// Framer 3D Scale Carousel Mathematical Model & Physics Constants
// Matched to https://3dscalecarousel.framer.website
const CAROUSEL_PERSPECTIVE = 1400;
const VISIBLE_RANGE = 7.5; // Render 15 cards across the horizon
const CAROUSEL_EASE = 0.14;
const WHEEL_GAIN = 0.0036;

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

  type WorldMode = "showcase" | "carousel";
  const [worldMode, setWorldMode] = useState<WorldMode>("showcase");

  // -------------------------------------------------------------
  // On-Scroll 3D Scale Carousel State & Physics Engine
  // -------------------------------------------------------------
  const [cameraSlot, setCameraSlot] = useState(0);
  const cameraSlotTargetRef = useRef(0);
  const cameraSlotCurrentRef = useRef(0);
  const plateNodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const lastInputTimeRef = useRef(0);

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

  // Carousel products array: loop array to ensure at least 18 cards for continuous 3D fan ribbon
  const carouselProducts = useMemo(() => {
    const baseList = worldProducts.length >= 2 ? worldProducts : products;
    if (baseList.length === 0) return [];
    let list = [...baseList];
    while (list.length < 18) {
      list = [...list, ...baseList];
    }
    return list;
  }, [worldProducts, products]);

  // Responsive dynamic dimensions reserving vertical space for header (70px), floating dock (90px), top title, and bottom bar
  const cardHeight = useMemo(() => {
    const maxAvailableH = Math.max(220, viewportSize.height - 250);

    if (viewportSize.width < 700) {
      return Math.min(maxAvailableH, Math.min(340, Math.max(240, Math.round(viewportSize.height * 0.42))));
    }
    if (viewportSize.width < 1024) {
      return Math.min(maxAvailableH, Math.min(420, Math.max(300, Math.round(viewportSize.height * 0.48))));
    }
    if (viewportSize.width < 1440) {
      return Math.min(maxAvailableH, Math.min(490, Math.max(360, Math.round(viewportSize.height * 0.54))));
    }
    return Math.min(maxAvailableH, Math.min(554, Math.max(400, Math.round(viewportSize.height * 0.58))));
  }, [viewportSize.width, viewportSize.height]);

  const cardWidth = useMemo(() => {
    // 3:4 portrait aspect ratio (0.74 : 1) matching https://3dscalecarousel.framer.website (410px x 554px)
    const targetW = Math.round(cardHeight * 0.74);

    if (viewportSize.width < 700) {
      return Math.min(250, Math.max(180, Math.round(viewportSize.width * 0.60)));
    }
    if (viewportSize.width < 1024) {
      return Math.min(310, Math.max(220, targetW));
    }
    if (viewportSize.width < 1440) {
      return Math.min(365, Math.max(270, targetW));
    }
    return Math.min(410, Math.max(300, targetW));
  }, [cardHeight, viewportSize.width]);

  const cardGapPx = useMemo(() => {
    // Gap between adjacent cards matching Framer reference site (~11px)
    if (viewportSize.width < 700) {
      return 8;
    }
    if (viewportSize.width < 1024) {
      return 10;
    }
    return 11;
  }, [viewportSize.width]);

  // Track user interaction time to pause autoplay during active user engagement
  const lastUserInteractionTimeRef = useRef<number>(Date.now());

  // Autoplay Engine: auto move cards smoothly every 3.2 seconds matching Framer reference site
  useEffect(() => {
    if (!mounted || worldPaused || worldMode !== "carousel") return;

    const interval = window.setInterval(() => {
      const now = Date.now();
      // Only auto-advance if user has been idle for >= 3200ms and not dragging
      if (now - lastUserInteractionTimeRef.current >= 3200 && !pointerRef.current.active) {
        cameraSlotTargetRef.current += 1.0;
      }
    }, 3200);

    return () => window.clearInterval(interval);
  }, [mounted, worldPaused, worldMode]);

  // Frame Loop (Framer 3D Scale Carousel rAF Momentum Engine)
  useEffect(() => {
    let rafId: number;

    const place = (
      node: HTMLDivElement | null,
      d: number
    ) => {
      if (!node) return;
      const absD = Math.abs(d);

      if (absD > VISIBLE_RANGE) {
        node.style.visibility = "hidden";
        node.style.opacity = "0";
        node.style.pointerEvents = "none";
        return;
      }

      // Mathematical replica of Framer 3D Scale Carousel:
      // Center card is 1.0x; step 1 card is 0.38x; step 2 is 0.30x; step 3 is 0.23x...
      let scale: number;
      let integratedW: number;

      if (absD <= 1.0) {
        scale = 0.38 + 0.62 * Math.pow(Math.cos((absD * Math.PI) / 2), 2);
        integratedW = cardWidth * (0.69 * absD + (0.31 / Math.PI) * Math.sin(Math.PI * absD));
      } else {
        const excess = absD - 1.0;
        scale = 0.38 * Math.pow(0.78, excess);
        integratedW = cardWidth * (0.69 + 1.5294 * (1 - Math.pow(0.78, excess)));
      }

      const sign = d >= 0 ? 1 : -1;
      // Fixed centered placement strictly driven by scroll position without mousemove displacement
      const x = sign * (integratedW + absD * cardGapPx);
      const y = 0;
      const z = -absD * 18;
      const rotateY = -sign * Math.min(14, absD * 3.5);
      const opacity = Math.max(0, Math.min(1, 1 - Math.pow(absD / VISIBLE_RANGE, 2.4)));

      // Depth blur on side cards matching reference site
      const blur = absD <= 0.4 ? 0 : Math.min(5.5, (absD - 0.4) * 1.5);
      const zIndex = Math.round(100 - absD * 8);

      // HUD elements (top title, viewfinder brackets, bottom price) only visible on center card
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

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const count = carouselProducts.length;
      if (count < 2) return;

      // Magnetic resting snap to nearest card when idle
      if (Date.now() - lastInputTimeRef.current > 140) {
        const nearest = Math.round(cameraSlotTargetRef.current);
        cameraSlotTargetRef.current += (nearest - cameraSlotTargetRef.current) * 0.12;
      }

      cameraSlotCurrentRef.current += (cameraSlotTargetRef.current - cameraSlotCurrentRef.current) * CAROUSEL_EASE;
      const position = cameraSlotCurrentRef.current;

      setCameraSlot(position);

      const focusIndex = ((Math.round(position) % count) + count) % count;
      const activeProd = carouselProducts[focusIndex];
      if (activeProd && activeProd.accent && bgRef.current) {
        bgRef.current.style.setProperty("--active-tint", activeProd.accent);
      }

      for (let i = 0; i < count; i += 1) {
        let d = ((i - position) % count);
        while (d > count / 2) d -= count;
        while (d < -count / 2) d += count;

        place(plateNodesRef.current[i], d);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [carouselProducts, cardGapPx, cardWidth, cardHeight]);

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
      if (worldView.dragging || Math.abs(cameraSlotTargetRef.current) > 0.05) {
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
    cameraSlotTargetRef.current = 0;
    cameraSlotCurrentRef.current = 0;
    setCameraSlot(0);
    setWorldMode("showcase");
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
    cameraSlotTargetRef.current = 0;
    cameraSlotCurrentRef.current = 0;
    setCameraSlot(0);

    if (worldMode === "carousel") {
      setWorldMode("showcase");
    } else {
      setProductSetIndex((prev) => (prev + 1) % productSetCount);
      setWorldMode("showcase");
    }
  }, [cancelHoverEnter, cancelHoverHide, productSetCount, worldMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview();
        if (worldMode === "carousel") {
          returnToShowcaseHome();
        }
      } else if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === "ArrowRight") {
        event.preventDefault();
        lastUserInteractionTimeRef.current = Date.now();
        if (worldMode === "showcase") {
          setWorldMode("carousel");
          cameraSlotTargetRef.current = 1.0;
          cameraSlotCurrentRef.current = 0;
        } else {
          cameraSlotTargetRef.current += 1.0;
        }
      } else if (event.key === "ArrowUp" || event.key === "PageUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        lastUserInteractionTimeRef.current = Date.now();
        if (worldMode === "showcase") {
          setWorldMode("carousel");
          cameraSlotTargetRef.current = -1.0;
          cameraSlotCurrentRef.current = 0;
        } else {
          cameraSlotTargetRef.current -= 1.0;
        }
      } else if (event.key === "Home") {
        event.preventDefault();
        returnToShowcaseHome();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closePreview, returnToShowcaseHome, worldMode]);

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
      // Note: do not set pointer capture on pointerdown so child button click events can fire cleanly
    },
    [showUI, worldView.rotateX, worldView.rotateY]
  );

  const movePointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!showUI || worldMode !== "showcase") {
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
    [showUI, worldMode, cancelHoverHide]
  );

  const endPointer = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    lastUserInteractionTimeRef.current = Date.now();
    pointerRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setWorldView((current) => ({ ...current, dragging: false }));
  }, []);

  // Wheel scroll drives On-Scroll 3D Scale Carousel
  const handleWorldWheel = useCallback(
    (event: ReactWheelEvent<HTMLElement>) => {
      if (!showUI) {
        return;
      }
      lastUserInteractionTimeRef.current = Date.now();
      cancelHoverEnter();
      cancelHoverHide();
      setHoveredSlug(null);

      const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(delta) < 2) return;

      if (worldMode === "showcase") {
        setWorldMode("carousel");
        cameraSlotTargetRef.current = delta > 0 ? 1.0 : -1.0;
        cameraSlotCurrentRef.current = 0;
      } else {
        cameraSlotTargetRef.current += delta * WHEEL_GAIN;
      }
    },
    [showUI, worldMode, cancelHoverEnter, cancelHoverHide]
  );

  const leaveWorld = useCallback(() => {
    if (pointerRef.current.active) {
      return;
    }

    setWorldView((current) => ({ ...current, parallaxX: 0, parallaxY: 0 }));
  }, []);

  const handleSectionPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (worldMode === "showcase") {
        movePointer(event);
      }
    },
    [movePointer, worldMode]
  );

  const handleSectionPointerLeave = useCallback(() => {
    leaveWorld();
  }, [leaveWorld]);

  const beginWorldPointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (worldMode === "showcase") {
        beginPointer(event);
      }
    },
    [beginPointer, worldMode]
  );

  const openProduct = useCallback(
    (product: Product) => {
      if (worldMode === "showcase" && pointerRef.current.distance > dragThreshold) {
        return;
      }
      router.push(`/products/${product.slug}`);
    },
    [router, worldMode]
  );

  const handleCarouselCardClick = useCallback(
    (product: Product, index: number) => {
      lastUserInteractionTimeRef.current = Date.now();
      if (pointerRef.current.distance > dragThreshold) {
        return;
      }
      const count = carouselProducts.length;
      let d = ((index - cameraSlotCurrentRef.current) % count);
      while (d > count / 2) d -= count;
      while (d < -count / 2) d += count;

      if (Math.abs(d) < 0.65) {
        // Direct click on active center card -> navigate to product detail
        router.push(`/products/${product.slug}`);
      } else {
        // Click on side card in carousel -> smoothly animate it to center!
        cameraSlotTargetRef.current += d;
      }
    },
    [carouselProducts.length, router]
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

  // -------------------------------------------------------------
  // Transition Blending between 3D Showcase World and 3D Scale Carousel
  // -------------------------------------------------------------
  const isInShowcase = worldMode === "showcase";
  const showcaseOpacity = isInShowcase ? 1 : 0;
  const carouselOpacity = isInShowcase ? 0 : 1;

  const hoveredProduct = hoveredSlug ? worldProducts.find((product) => product.slug === hoveredSlug) ?? null : null;

  return (
    <section
      ref={sectionRef}
      className={[
        "world-shell",
        "reference-showcase",
        isInShowcase ? "is-in-showcase" : "is-in-carousel",
        hoveredSlug ? "is-hovering" : "",
        worldPaused ? "is-paused" : "",
        worldView.dragging ? "is-dragging" : "",
        showUI ? "ui-ready" : "ui-pending"
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--showcase-opacity": showcaseOpacity,
          "--carousel-opacity": carouselOpacity
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
      {/* Layer 1: Resting Showcase 3D Grid (from 18edb0a)              */}
      {/* ------------------------------------------------------------- */}
      {showcaseOpacity > 0 ? (
        <div
          className="world-stage showcase-stage"
          style={{
            ...stageStyle,
            opacity: showcaseOpacity,
            pointerEvents: showcaseOpacity > 0.1 ? "auto" : "none"
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
      ) : null}

      {/* ------------------------------------------------------------- */}
      {/* Layer 2: Framer 3D Scale Carousel System                      */}
      {/* ------------------------------------------------------------- */}
      {carouselOpacity > 0 && (
        <div
          className="scale-carousel-viewport"
          style={{
            opacity: carouselOpacity,
            pointerEvents: carouselOpacity > 0.1 ? "auto" : "none",
            perspective: `${CAROUSEL_PERSPECTIVE}px`,
            perspectiveOrigin: "50% 50%"
          }}
        >
          <div className="scale-carousel-bg" ref={bgRef} aria-hidden="true">
            <div className="bg-blob-a" />
            <div className="bg-blob-b" />
          </div>

          <div className="scale-carousel-plates-container">
            {carouselProducts.map((product, i) => (
              <div
                key={`carousel-card-${product.id}-${i}`}
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

                {/* 4 Optical Corner Viewfinder Brackets */}
                <div className="carousel-viewfinder-frame carousel-card-hud" aria-hidden="true">
                  <span className="viewfinder-bracket bracket-tl" />
                  <span className="viewfinder-bracket bracket-tr" />
                  <span className="viewfinder-bracket bracket-bl" />
                  <span className="viewfinder-bracket bracket-br" />
                </div>

                {/* The Clean Media Artwork Card */}
                <ScaleCarouselCard
                  product={product}
                  onSelect={() => handleCarouselCardClick(product, i)}
                />

                {/* Bottom Bar: Price (Outside / Centered Below Card) */}
                <div className="carousel-focus-bottom carousel-card-hud">
                  <div className="carousel-focus-price-wrap">
                    <span className="carousel-focus-price">{formatPrice(product.price)}</span>
                    {product.old_price && product.old_price > product.price ? (
                      <span className="carousel-focus-old-price">{formatPrice(product.old_price)}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
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
            {language === "bn" ? "স্ক্রোল করে দেখুন" : "SCROLL TO ROTATE"}
            <br />
            {language === "bn" ? "বিস্তারিত দেখতে ক্লিক করুন" : "CLICK TO VIEW DETAIL"}
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
      {/* Product Sets Counter (Hidden in 3D Carousel)                   */}
      {/* ------------------------------------------------------------- */}
      {isInShowcase && productSetCount > 1 ? (
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
// Framer 3D Scale Carousel Card Component (Clean Media Artwork Card)
// -------------------------------------------------------------
type ScaleCarouselCardProps = {
  product: Product;
  onSelect: () => void;
};

function ScaleCarouselCard({
  product,
  onSelect
}: ScaleCarouselCardProps) {
  const cardStyle: CSSProperties = {
    "--card-accent": product.accent || "#3385ff"
  } as CSSProperties;

  return (
    <button
      type="button"
      className="scale-carousel-card"
      style={cardStyle}
      aria-label={`View details for ${product.title}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Background / Full-Bleed Media Artwork */}
      <div className="scale-carousel-media">
        <div className="scale-carousel-art-wrap">
          <ProductArtwork product={product} compact={false} />
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
