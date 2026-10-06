/** Pure geometry for the explore page's 3D product carousel. */

export type CarouselViewport = { width: number; height: number };

export const CAROUSEL_PERSPECTIVE = 1400;
export const VISIBLE_RANGE = 7.5;
export const CAROUSEL_EASE = 0.14;
export const SNAP_EASE = 0.12;
export const MIN_CAROUSEL_ITEMS = 18;

export function getCardHeight({ width, height }: CarouselViewport): number {
  const maxAvailable = Math.max(240, height - 160);
  if (width < 700) return Math.min(maxAvailable, Math.min(380, Math.max(260, Math.round(height * 0.46))));
  if (width < 1024) return Math.min(maxAvailable, Math.min(480, Math.max(340, Math.round(height * 0.55))));
  if (width < 1440) return Math.min(maxAvailable, Math.min(550, Math.max(390, Math.round(height * 0.61))));
  return Math.min(maxAvailable, Math.min(620, Math.max(440, Math.round(height * 0.65))));
}

export function getCardWidth(cardHeight: number, viewportWidth: number): number {
  const target = Math.round(cardHeight * 0.76);
  if (viewportWidth < 700) return Math.min(280, Math.max(190, target));
  if (viewportWidth < 1024) return Math.min(365, Math.max(260, target));
  if (viewportWidth < 1440) return Math.min(418, Math.max(295, target));
  return Math.min(470, Math.max(330, target));
}

export function getCardGap(viewportWidth: number): number {
  if (viewportWidth < 700) return 10;
  if (viewportWidth < 1024) return 12;
  return 14;
}

/** Repeats the list until it has enough items for a continuous loop. */
export function repeatToMinimum<T>(items: readonly T[], minimum = MIN_CAROUSEL_ITEMS): T[] {
  if (items.length === 0) return [];
  let list = [...items];
  while (list.length < minimum) {
    list = [...list, ...items];
  }
  return list;
}

/** Signed distance of card `index` from the camera position, wrapped to the nearest side. */
export function wrappedOffset(index: number, position: number, count: number): number {
  let offset = (index - position) % count;
  while (offset > count / 2) offset -= count;
  while (offset < -count / 2) offset += count;
  return offset;
}

export type CardPlacement =
  | { visible: false }
  | {
      visible: true;
      transform: string;
      opacity: number;
      filter: string;
      zIndex: number;
      hudOpacity: number;
      interactive: boolean;
    };

/** Position, scale, rotation, blur and fade of a card `offset` slots away from the centre. */
export function getCardPlacement(offset: number, cardWidth: number, cardGap: number): CardPlacement {
  const distance = Math.abs(offset);
  if (distance > VISIBLE_RANGE) {
    return { visible: false };
  }

  let scale: number;
  let integratedWidth: number;
  if (distance <= 1) {
    scale = 0.48 + 0.52 * Math.pow(Math.cos((distance * Math.PI) / 2), 2);
    integratedWidth = cardWidth * (0.74 * distance + (0.26 / Math.PI) * Math.sin(Math.PI * distance));
  } else {
    const excess = distance - 1;
    scale = 0.48 * Math.pow(0.66, excess);
    integratedWidth = cardWidth * (0.74 + 1.1553 * (1 - Math.pow(0.66, excess)));
  }

  const sign = offset >= 0 ? 1 : -1;
  const x = sign * (integratedWidth + distance * cardGap);
  const z = -distance * 18;
  const rotateY = -sign * Math.min(14, distance * 3.4);
  const opacity = distance <= 5.5 ? Math.pow(Math.cos((distance * Math.PI) / 11), 2) : 0;
  const blur = distance <= 0.4 ? 0 : Math.min(6, (distance - 0.4) * 1.4);

  return {
    visible: true,
    transform: `translate3d(${x.toFixed(2)}px, 0px, ${z.toFixed(2)}px) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
    opacity,
    filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "none",
    zIndex: Math.round(100 - distance * 8),
    hudOpacity: Math.max(0, Math.min(1, 1 - distance * 1.8)),
    interactive: opacity > 0.2
  };
}
