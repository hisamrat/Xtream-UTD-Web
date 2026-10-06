import type { CSSProperties } from "react";

/**
 * Pure geometry for the home product world: slot tables per breakpoint, stage scaling,
 * per-card CSS variables and fly-in directions. No React state or DOM access.
 */

export type ViewportSize = {
  width: number;
  height: number;
};

export type PointerState = {
  active: boolean;
  x: number;
  y: number;
  startX: number;
  startY: number;
  distance: number;
  startRotateX: number;
  startRotateY: number;
};

export type ShowcaseCardKind = "mini" | "medium" | "feature" | "hero";

export type WorldViewState = {
  rotateX: number;
  rotateY: number;
  zoom: number;
  parallaxX: number;
  parallaxY: number;
  dragging: boolean;
};

export type ReferenceShowcaseSlot = {
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

export type ShowcaseBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export const dragThreshold = 7;

export const desktopReferenceSlots: ReferenceShowcaseSlot[] = [
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

export const mobileReferenceSlots: ReferenceShowcaseSlot[] = [
  // 1. Center Hero (Index 0)
  slot(0, 0, 176, 212, 80, "hero", { floatY: -7 }),

  // 2-3. Center Top & Center Bottom (Indices 1, 2)
  slot(0, -255, 148, 160, 52, "feature", { floatY: -6 }),
  slot(0, 255, 148, 160, 48, "feature", { floatY: -6 }),

  // 4-5. Left Mid & Right Mid (Indices 3, 4)
  slot(-190, 40, 138, 148, 47, "medium", { floatY: -6 }),
  slot(190, 40, 138, 148, 47, "medium", { floatY: -6 }),

  // 6-7. Left Top & Right Top (Indices 5, 6)
  slot(-190, -180, 138, 148, 46, "medium", { floatY: -5 }),
  slot(190, -180, 138, 148, 46, "medium", { floatY: -5 }),

  // 8-9. Left Bottom & Right Bottom (Indices 7, 8) - ALWAYS IN CORE 9 GRID!
  slot(-190, 230, 136, 146, 44, "medium", { opacity: 0.95, floatY: -5 }),
  slot(190, 230, 136, 146, 44, "medium", { opacity: 0.95, floatY: -5 }),

  // 10-11. Upper Diagonals (Indices 9, 10) - Fills upper gaps
  slot(-96, -130, 56, 56, 42, "mini", { opacity: 0.95, floatY: -5 }),
  slot(96, -130, 56, 56, 42, "mini", { opacity: 0.95, floatY: -5 }),

  // 12-13. Lower Diagonals (Indices 11, 12) - Fills lower gaps
  slot(-96, 130, 56, 56, 42, "mini", { opacity: 0.95, floatY: -5 }),
  slot(96, 130, 56, 56, 42, "mini", { opacity: 0.95, floatY: -5 }),

  // 14-15. Mid-Upper Flank Minis (Indices 13, 14)
  slot(-190, -70, 54, 54, 38, "mini", { opacity: 0.92, floatY: -5 }),
  slot(190, -70, 54, 54, 38, "mini", { opacity: 0.92, floatY: -5 }),

  // 16-17. Mid-Lower Flank Minis (Indices 15, 16)
  slot(-190, 135, 54, 54, 38, "mini", { opacity: 0.92, floatY: -5 }),
  slot(190, 135, 54, 54, 38, "mini", { opacity: 0.92, floatY: -5 }),

  // 18-19. Top Crown Minis (Indices 17, 18)
  slot(-96, -265, 52, 52, 34, "mini", { opacity: 0.9, floatY: -5 }),
  slot(96, -265, 52, 52, 34, "mini", { opacity: 0.9, floatY: -5 }),

  // 20-21. Outer Margin Floats (Indices 19, 20)
  slot(-280, -40, 52, 52, 20, "mini", { opacity: 0.86 }),
  slot(280, -40, 52, 52, 20, "mini", { opacity: 0.86 })
];

export function getDynamicMobileSlotCount(viewportSize: ViewportSize): number {
  const h = viewportSize.height;
  const w = viewportSize.width;
  if (h < 560 || w < 340) return 11;
  if (h < 700 || w < 375) return 13;
  if (h < 800) return 15;
  if (h < 880) return 17;
  return 19;
}

export function getShowcaseSlots(viewportSize: ViewportSize): ReferenceShowcaseSlot[] {
  if (viewportSize.width < 700) {
    const slotCount = getDynamicMobileSlotCount(viewportSize);
    return mobileReferenceSlots.slice(0, slotCount);
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

export function getShowcaseStageScale(viewportSize: ViewportSize, slots: ReferenceShowcaseSlot[]): number {
  const reference =
    viewportSize.width < 700
      ? slots.length > 0
        ? slots
        : mobileReferenceSlots
      : slots.length > 0
      ? slots
      : desktopReferenceSlots;
  const bounds = getShowcaseBounds(reference);
  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;
  const horizontalReserve = viewportSize.width < 700 ? 20 : viewportSize.width >= 1500 ? 120 : 140;
  const verticalReserve = viewportSize.width < 700 ? 160 : 250;
  const widthFit = Math.max(0.2, (viewportSize.width - horizontalReserve) / boundsWidth);
  const heightFit = Math.max(0.2, (viewportSize.height - verticalReserve) / boundsHeight);
  const maxScale =
    viewportSize.width < 700 ? 1 : viewportSize.width < 1024 ? 0.78 : viewportSize.width < 1180 ? 0.88 : 0.96;
  const minScale = viewportSize.width < 700 ? 0.58 : 0.45;

  return clamp(Math.min(widthFit, heightFit, maxScale), minScale, maxScale);
}

export function getShowcaseStageStyle(
  scale: number,
  viewportSize: ViewportSize,
  worldView: WorldViewState
): CSSProperties & Record<`--${string}`, string> {
  const verticalOffset =
    viewportSize.width < 700
      ? "0px"
      : viewportSize.width >= 1500 && viewportSize.height < 960
      ? "-22px"
      : "-16px";

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

export function getReferenceCardStyle(
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

export function getLegacySizeClass(kind: ShowcaseCardKind): string {
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

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getFlyInOrigin(slot: ReferenceShowcaseSlot, index: number): "top" | "bottom" | "left" | "right" {
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
