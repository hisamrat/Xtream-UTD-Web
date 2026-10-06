import { describe, expect, it } from "vitest";
import {
  formatDhakaDate,
  formatOrderRowsForSheet,
  generateOrderId,
  orderRecordSchema
} from "./order-record";

describe("order-record", () => {
  it("generates structured order IDs with expected format", () => {
    const id = generateOrderId(new Date("2026-10-06T12:00:00Z"));
    expect(id).toMatch(/^ORD-20261006-\d{4}$/);
  });

  it("formats dates in Dhaka timezone (GMT+6) as DD/MM/YYYY", () => {
    // 2026-10-06 12:00:00 UTC is 06/10/2026 in Dhaka
    const date = new Date("2026-10-06T12:00:00Z");
    const formatted = formatDhakaDate(date);
    expect(formatted).toBe("06/10/2026");
  });

  it("validates and formats order rows matching Google Sheet columns A to R", () => {
    const rawOrder = {
      orderId: "ORD-20261006-1234",
      createdAt: "06/10/2026",
      customer: {
        firstName: "Rahim",
        lastName: "Uddin",
        fullName: "Rahim Uddin",
        phone: "01712345678",
        deliveryZone: "outside" as const,
        deliveryZoneLabel: "Outside Dhaka",
        address: "House 1, Road 2",
        thana: "Mirpur",
        district: "Dhaka",
        note: "Call on arrival"
      },
      items: [
        {
          productId: "1",
          productTitle: "Refillable Perfume Bottle 8ml",
          productSlug: "refillable-perfume-bottle-8ml",
          variant: "Black",
          quantity: 2,
          unitPrice: 180,
          lineTotal: 360
        },
        {
          productId: "2",
          productTitle: "Cloud Mirror Tulip Light",
          productSlug: "cloud-mirror-tulip-light",
          variant: "Pink",
          quantity: 1,
          unitPrice: 550,
          lineTotal: 550
        }
      ],
      financials: {
        subtotal: 910,
        deliveryFee: 130,
        grandTotal: 1040
      }
    };

    const parsed = orderRecordSchema.parse(rawOrder);
    const rows = formatOrderRowsForSheet(parsed);

    expect(rows).toHaveLength(2);

    // Row 1
    expect(rows[0]).toEqual([
      "ORD-20261006-1234", // Col A: Sr No
      "06/10/2026", // Col B: Date 📅
      "1", // Col C: Product No 📍
      "Refillable Perfume Bottle 8ml", // Col D: Product Name 📌
      "Rahim Uddin", // Col E: Customer Name
      "01712345678", // Col F: Phone Number
      "House 1, Road 2", // Col G: Address
      "Mirpur", // Col H: Thana
      "Dhaka", // Col I: District
      "Outside Dhaka", // Col J: Delivery Zone
      "[Variants: Black:2]", // Col K: Product Variants 🔖
      "2", // Col L: Quantity
      "180", // Col M: Product Price
      "130", // Col N: Delivery Charge 
      "1040", // Col O: Total Amount 📌with delivery Charge 
      "", // Col P: Delivery Platform
      "", // Col Q: Paid Delivery Charge To Courier
      "", // Col R: Amount Received after calculate COD amount with platform charge %
      "", // Col S: Final Received Amount 📌 ( After Paid Delivery Fee )
      "Pending", // Col T: Delivery Status
      "Call on arrival" // Col U: Note
    ]);

    // Row 2
    expect(rows[1][2]).toBe("2");
    expect(rows[1][3]).toBe("Cloud Mirror Tulip Light");
    expect(rows[1][4]).toBe("Rahim Uddin");
    expect(rows[1][5]).toBe("01712345678");
    expect(rows[1][6]).toBe("House 1, Road 2");
    expect(rows[1][10]).toBe("[Variants: Pink:1]");
    expect(rows[1][14]).toBe("1040");
  });

  it("aggregates multiple variants of the same product into a single row with [Variants: name:qty, name:qty]", () => {
    const rawOrder = {
      customer: {
        firstName: "Test",
        lastName: "User",
        fullName: "Test User",
        phone: "01711111111",
        deliveryZone: "dhaka" as const,
        deliveryZoneLabel: "Inside Dhaka",
        address: "Banani",
        thana: "Banani",
        district: "Dhaka"
      },
      items: [
        {
          productId: "candle-1",
          productTitle: "Led Candle Swing Mood",
          productSlug: "led-candle",
          variant: "7.5cm 3pcs",
          quantity: 1,
          unitPrice: 1250,
          lineTotal: 1250
        },
        {
          productId: "candle-1",
          productTitle: "Led Candle Swing Mood",
          productSlug: "led-candle",
          variant: "10cm 3pcs",
          quantity: 2,
          unitPrice: 1250,
          lineTotal: 2500
        }
      ],
      financials: {
        subtotal: 3750,
        deliveryFee: 70,
        grandTotal: 3820
      }
    };

    const parsed = orderRecordSchema.parse(rawOrder);
    const rows = formatOrderRowsForSheet(parsed);

    expect(rows).toHaveLength(1);
    expect(rows[0][3]).toBe("Led Candle Swing Mood");
    expect(rows[0][6]).toBe("Banani"); // Address
    expect(rows[0][9]).toBe("Inside Dhaka"); // Delivery Zone
    expect(rows[0][10]).toBe("[Variants: 7.5cm 3pcs:1, 10cm 3pcs:2]"); // Product Variants 🔖
    expect(rows[0][11]).toBe("3"); // Quantity
    expect(rows[0][12]).toBe("1250"); // Product Price
    expect(rows[0][13]).toBe("70"); // Delivery Charge 
    expect(rows[0][14]).toBe("3820"); // Total Amount 📌with delivery Charge 
    expect(rows[0][19]).toBe("Pending"); // Delivery Status
    expect(rows[0][20]).toBe("-"); // Note
  });
});

