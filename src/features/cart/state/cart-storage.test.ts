import { describe, expect, it } from "vitest";
import { addLine, parseStoredCart, setLineQuantity } from "./cart-storage";

describe("stored cart", () => {
  it("migrates carts saved with whole product objects", () => {
    const legacy = JSON.stringify([{ product: { slug: "desk-lamp", title: "Desk Lamp", price: 900 }, variant: "Black", quantity: 2 }]);
    expect(parseStoredCart(legacy)).toEqual([{ slug: "desk-lamp", variant: "Black", quantity: 2 }]);
  });

  it("treats corrupt or invalid data as an empty cart", () => {
    expect(parseStoredCart(null)).toEqual([]);
    expect(parseStoredCart("{not json")).toEqual([]);
    expect(parseStoredCart(JSON.stringify([{ slug: "x", variant: "y", quantity: -1 }]))).toEqual([]);
  });

  it("merges quantities for the same product and variant", () => {
    const lines = addLine(addLine([], "desk-lamp", "Black", 1), "desk-lamp", "Black", 2);
    expect(lines).toEqual([{ slug: "desk-lamp", variant: "Black", quantity: 3 }]);
    expect(addLine(lines, "desk-lamp", "White", 1)).toHaveLength(2);
  });

  it("updates or removes lines by quantity", () => {
    const lines = [{ slug: "desk-lamp", variant: "Black", quantity: 3 }];
    expect(setLineQuantity(lines, "desk-lamp", "Black", 5)[0]?.quantity).toBe(5);
    expect(setLineQuantity(lines, "desk-lamp", "Black", 0)).toEqual([]);
  });
});
