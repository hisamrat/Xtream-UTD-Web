import { z } from "zod";

export const orderItemRecordSchema = z.object({
  productId: z.string().trim().default(""),
  productTitle: z.string().trim().min(1),
  productSlug: z.string().trim().default(""),
  variant: z.string().trim().default("Standard"),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().nonnegative().default(0),
  lineTotal: z.number().nonnegative().default(0)
});

export type OrderItemRecord = z.infer<typeof orderItemRecordSchema>;

export const orderCustomerRecordSchema = z.object({
  firstName: z.string().trim().default(""),
  lastName: z.string().trim().default(""),
  fullName: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  deliveryZone: z.enum(["dhaka", "outside"]).default("dhaka"),
  deliveryZoneLabel: z.string().trim().default("Inside Dhaka"),
  address: z.string().trim().min(1),
  thana: z.string().trim().default(""),
  district: z.string().trim().default(""),
  note: z.string().trim().default("")
});

export type OrderCustomerRecord = z.infer<typeof orderCustomerRecordSchema>;

export const orderFinancialsRecordSchema = z.object({
  subtotal: z.number().nonnegative().default(0),
  deliveryFee: z.number().nonnegative().default(0),
  grandTotal: z.number().nonnegative().default(0)
});

export type OrderFinancialsRecord = z.infer<typeof orderFinancialsRecordSchema>;

export const orderRecordSchema = z.object({
  orderId: z.string().trim().optional(),
  createdAt: z.string().trim().optional(),
  customer: orderCustomerRecordSchema,
  items: z.array(orderItemRecordSchema).min(1),
  financials: orderFinancialsRecordSchema,
  orderMessage: z.string().trim().optional()
});

export type OrderRecord = z.infer<typeof orderRecordSchema>;

/** Formats a timestamp in Bangladesh Standard Time (UTC+6). */
export function formatDhakaDate(date: Date = new Date()): string {
  // Use Intl to format safely in Asia/Dhaka timezone
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

/** Generates a human-friendly unique Order Serial ID (e.g. ORD-20261006-8491). */
export function generateOrderId(date: Date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${y}${m}${d}-${randomSuffix}`;
}

/**
 * Maps an order record into rows formatted for the Google Sheet "WebSite Selling Information".
 * Header mapping:
 * Col A: Sr No
 * Col B: Date 🗓️
 * Col C: Product No 📍
 * Col D: Product Name 📌
 * Col E: Customer Name
 * Col F: Phone Number
 * Col G: Variant
 * Col H: Quantity
 * Col I: Unit Price
 * Col J: Subtotal
 * Col K: Delivery Zone
 * Col L: Delivery Fee
 * Col M: Grand Total
 * Col N: Address
 * Col O: Thana
 * Col P: District
 * Col Q: Note
 * Col R: Order Status
 */
export function formatOrderRowsForSheet(order: OrderRecord): string[][] {
  const orderId = order.orderId?.trim() || generateOrderId();
  const orderDate = order.createdAt?.trim() || formatDhakaDate();

  // Group by product so multiple variants for the same product are aggregated into one row
  const productMap = new Map<string, {
    productId: string;
    productTitle: string;
    variants: string[];
    totalQuantity: number;
    unitPrice: number;
    lineTotal: number;
  }>();

  for (const item of order.items) {
    const key = item.productId || item.productSlug || item.productTitle;
    const variantName = item.variant?.trim() || "Standard";
    const variantLabel = `${variantName}:${item.quantity}`;
    const existing = productMap.get(key);
    if (!existing) {
      productMap.set(key, {
        productId: item.productId || "-",
        productTitle: item.productTitle,
        variants: [variantLabel],
        totalQuantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal || item.unitPrice * item.quantity
      });
    } else {
      existing.variants.push(variantLabel);
      existing.totalQuantity += item.quantity;
      existing.lineTotal += item.lineTotal || item.unitPrice * item.quantity;
    }
  }

  const deliveryZoneLabel =
    order.customer.deliveryZoneLabel ||
    (order.customer.deliveryZone === "outside" ? "Outside Dhaka" : "Inside Dhaka");

  const rows: string[][] = [];
  for (const prod of productMap.values()) {
    rows.push([
      orderId,
      orderDate,
      prod.productId,
      prod.productTitle,
      order.customer.fullName,
      order.customer.phone,
      `[Variants: ${prod.variants.join(", ")}]`,
      String(prod.totalQuantity),
      String(prod.unitPrice),
      String(prod.lineTotal),
      deliveryZoneLabel,
      String(order.financials.deliveryFee),
      String(order.financials.grandTotal),
      order.customer.address,
      order.customer.thana || "-",
      order.customer.district || "-",
      order.customer.note || "-",
      "Pending"
    ]);
  }

  return rows;
}
