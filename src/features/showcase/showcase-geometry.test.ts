import { describe, expect, it } from "vitest";
import { getCardPlacement, getCardWidth, repeatToMinimum, wrappedOffset } from "./explore/carousel-math";
import { getColumnCount, layoutMasonry } from "./explore/masonry-layout";
import { pickTopSelling } from "./explore/TopSelling";
import { getFlyInOrigin, getShowcaseSlots, getShowcaseStageScale } from "./world/world-layout";
import { makeSummary } from "@/test/fixtures";

describe("home world layout", () => {
  it("shows fewer slots on smaller screens", () => {
    const phone = getShowcaseSlots({ width: 390, height: 844 }).length;
    const tablet = getShowcaseSlots({ width: 820, height: 1180 }).length;
    const desktop = getShowcaseSlots({ width: 1440, height: 900 }).length;
    expect(phone).toBeLessThan(tablet);
    expect(tablet).toBeLessThan(desktop);
    expect(getShowcaseSlots({ width: 390, height: 844 })[0]?.kind).toBe("hero");
  });

  it("keeps the stage scale within its bounds", () => {
    for (const viewport of [
      { width: 320, height: 500 },
      { width: 1024, height: 768 },
      { width: 2560, height: 1440 }
    ]) {
      const scale = getShowcaseStageScale(viewport, getShowcaseSlots(viewport));
      expect(scale).toBeGreaterThanOrEqual(0.45);
      expect(scale).toBeLessThanOrEqual(1);
    }
  });

  it("flies centre-column cards in vertically", () => {
    const [hero, top, bottom] = getShowcaseSlots({ width: 1440, height: 900 });
    if (!hero || !top || !bottom) throw new Error("slots missing");
    expect(getFlyInOrigin(top, 1)).toBe("top");
    expect(getFlyInOrigin(bottom, 2)).toBe("bottom");
  });
});

describe("explore carousel", () => {
  it("wraps offsets to the nearest side of the loop", () => {
    expect(wrappedOffset(0, 0, 18)).toBe(0);
    expect(wrappedOffset(17, 0, 18)).toBe(-1);
    expect(wrappedOffset(1, 17, 18)).toBe(2);
  });

  it("centres the focused card and hides distant ones", () => {
    const centre = getCardPlacement(0, 400, 14);
    expect(centre.visible && centre.opacity).toBe(1);
    expect(centre.visible && centre.interactive).toBe(true);
    expect(getCardPlacement(8, 400, 14).visible).toBe(false);
  });

  it("repeats short lists and clamps card widths", () => {
    expect(repeatToMinimum([1, 2, 3, 4, 5])).toHaveLength(20);
    expect(repeatToMinimum([])).toEqual([]);
    expect(getCardWidth(1000, 390)).toBe(280);
  });
});

describe("media masonry", () => {
  it("chooses columns by width and places items in the shortest column", () => {
    expect(getColumnCount(500)).toBe(2);
    expect(getColumnCount(1200)).toBe(4);
    const { items, totalHeight } = layoutMasonry([{ aspectRatio: 1 }, { aspectRatio: 0.5 }, { aspectRatio: 1 }], 416, 16);
    expect(items.map((item) => item.column)).toEqual([0, 1, 0]);
    expect(items[2]?.y).toBe(216);
    expect(totalHeight).toBe(416);
  });
});

describe("top selling", () => {
  it("prefers best sellers and tops up with other products", () => {
    const products = [makeSummary({ slug: "a" }), makeSummary({ slug: "b", best_seller: true }), makeSummary({ slug: "c" })];
    expect(pickTopSelling(products, 2).map((product) => product.slug)).toEqual(["b", "a"]);
  });
});
