import type { DeliveryZoneId } from "@/config/commerce";
import { formatPrice } from "./money";
import { getDeliveryFee } from "./delivery";

export type OrderLine = {
  title: string;
  variant: string;
  quantity: number;
  unitPrice: number;
};

export type OrderCustomer = {
  name: string;
  phone: string;
  address: string;
  thana?: string;
  district?: string;
  note?: string;
};

export type OrderMessageInput = {
  lines: readonly OrderLine[];
  customer: OrderCustomer;
  /** When omitted, the delivery fee is left for the seller to confirm. */
  deliveryZone?: DeliveryZoneId;
};

const zoneLabels: Record<DeliveryZoneId, string> = {
  dhaka: "Inside Dhaka",
  outside: "Outside Dhaka"
};

export function getOrderSubtotal(lines: readonly OrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}

/**
 * Builds the plain-text order summary the customer sends to the seller on Messenger.
 * The message is always in English so the seller receives a consistent format.
 */
export function buildOrderMessage({ lines, customer, deliveryZone }: OrderMessageInput): string {
  const subtotal = getOrderSubtotal(lines);
  const deliveryFee = deliveryZone ? getDeliveryFee(deliveryZone) : undefined;

  const customerLines = [
    `Name: ${customer.name.trim()}`,
    `Phone: ${customer.phone.trim()}`,
    ...(deliveryZone ? [`Delivery Location: ${zoneLabels[deliveryZone]}`] : []),
    `Address: ${customer.address.trim()}`,
    ...(customer.thana?.trim() ? [`Police Station (Thana): ${customer.thana.trim()}`] : []),
    ...(customer.district?.trim() ? [`District: ${customer.district.trim()}`] : []),
    ...(customer.note?.trim() ? [`Additional Note: ${customer.note.trim()}`] : [])
  ];

  const productLines = lines.map((line, index) =>
    [
      `${index + 1}. Product Name: ${line.title}`,
      `   Variant: ${line.variant}`,
      `   Quantity: ${line.quantity}`,
      `   Price: ${formatPrice(line.unitPrice * line.quantity)}`
    ].join("\n")
  );

  const paymentLines =
    deliveryFee === undefined
      ? [`Subtotal: ${formatPrice(subtotal)}`, "Delivery Fee: To be confirmed by seller"]
      : [
          `Subtotal: ${formatPrice(subtotal)}`,
          `Delivery Fee: ${formatPrice(deliveryFee)}`,
          `Grand Total: ${formatPrice(subtotal + deliveryFee)}`
        ];

  return [
    "HELLO XTREAM UTD!",
    "",
    "CUSTOMER DETAILS:",
    "",
    ...customerLines,
    "",
    "ORDERED PRODUCTS:",
    "",
    productLines.join("\n\n"),
    "",
    "PAYMENT SUMMARY:",
    "",
    ...paymentLines,
    "",
    "PLEASE CONFIRM MY ORDER!"
  ].join("\n");
}

export type SupportInquiry = {
  topic: string;
  name: string;
  phone: string;
  message: string;
};

/** Plain-text support inquiry (contact page) for Messenger. */
export function buildInquiryMessage({ topic, name, phone, message }: SupportInquiry): string {
  return [
    "HELLO XTREAM UTD!",
    "",
    `Inquiry: ${topic}`,
    `Name: ${name.trim()}`,
    `Phone: ${phone.trim()}`,
    "",
    "MESSAGE:",
    message.trim()
  ].join("\n");
}

/** Messenger deep link that pre-fills the order message. */
export function buildMessengerUrl(messengerUrl: string, message: string): string {
  return `${messengerUrl}?text=${encodeURIComponent(message)}`;
}
