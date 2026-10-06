/** Shortest-column masonry placement for the explore media gallery. */

export type MasonryInput = { aspectRatio: number };

export type MasonryPosition = { x: number; y: number; width: number; height: number; column: number };

export const MASONRY_GAP = 16;
const DEFAULT_RATIO = 0.8;

export function getColumnCount(containerWidth: number): number {
  if (containerWidth < 640) return 2;
  if (containerWidth < 1024) return 3;
  return 4;
}

export function layoutMasonry<T extends MasonryInput>(
  items: readonly T[],
  containerWidth: number,
  gap = MASONRY_GAP
): { items: Array<T & MasonryPosition>; totalHeight: number } {
  if (containerWidth <= 0 || items.length === 0) {
    return { items: [], totalHeight: 0 };
  }

  const columns = getColumnCount(containerWidth);
  const columnWidth = Math.max(120, (containerWidth - gap * (columns - 1)) / columns);
  const columnHeights: number[] = Array.from({ length: columns }, () => 0);

  const positioned = items.map((item) => {
    let column = 0;
    for (let candidate = 1; candidate < columns; candidate += 1) {
      if ((columnHeights[candidate] ?? 0) < (columnHeights[column] ?? 0) - 0.5) column = candidate;
    }

    const ratio = item.aspectRatio > 0 ? item.aspectRatio : DEFAULT_RATIO;
    const height = Math.round(columnWidth / ratio);
    const y = columnHeights[column] ?? 0;
    columnHeights[column] = y + height + gap;

    return { ...item, x: column * (columnWidth + gap), y, width: columnWidth, height, column };
  });

  return { items: positioned, totalHeight: Math.max(0, Math.max(...columnHeights) - gap) };
}
