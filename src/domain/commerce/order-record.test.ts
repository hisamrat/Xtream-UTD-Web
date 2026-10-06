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

  it("formats dates in Dhaka timezone (GMT+6)", () => {
    // 2026-10-06 12:00:00 UTC is 18:00:00 in Dhaka
    const date = new Date("2026-10-06T12:00:00Z");
    const formatted = formatDhakaDate(date);
    expect(formatted).toBe("06/10/2026 18:00:00");
  });

  it("validates and formats order rows matching Google Sheet columns A to R", () => {
    const rawOrder = {
      orderId: "ORD-20261006-1234",
      createdAt: "06/10/2026 21:30:00",
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
      "06/10/2026 21:30:00", // Col B: Date
      "1", // Col C: Product No
      "Refillable Perfume Bottle 8ml", // Col D: Product Name
      "Rahim Uddin", // Col E: Customer Name
      "01712345678", // Col F: Phone Number
      "Black", // Col G: Variant
      "2", // Col H: Quantity
      "180", // Col I: Unit Price
      "360", // Col J: Subtotal
      "Outside Dhaka", // Col K: Delivery Zone
      "130", // Col L: Delivery Fee
      "1040", // Col M: Grand Total
      "House 1, Road 2", // Col N: Address
      "Mirpur", // Col O: Thana
      "Dhaka", // Col P: District
      "Call on arrival", // Col Q: Note
      "Pending" // Col R: Order Status
    ]);

    // Row 2
    expect(rows[1][2]).toBe("2");
    expect(rows[1][3]).toBe("Cloud Mirror Tulip Light");
    expect(rows[1][4]).toBe("Rahim Uddin");
    expect(rows[1][5]).toBe("01712345678");
    expect(rows[1][12]).toBe("1040");
  });
});
