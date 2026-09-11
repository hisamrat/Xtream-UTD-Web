import type { Product } from "./product-schema";
import { formatPrice } from "./format";

export type OrderInquiry = {
  product: Product;
  variant: string;
  quantity: number;
  customerName: string;
  phone: string;
  address: string;
  note: string;
};

export function createOrderMessage(inquiry: OrderInquiry): string {
  return [
    `Product inquiry for ${inquiry.product.title}`,
    `Price: ${formatPrice(inquiry.product.price)}`,
    `Variant: ${inquiry.variant}`,
    `Quantity: ${inquiry.quantity}`,
    `Name: ${inquiry.customerName}`,
    `Phone: ${inquiry.phone}`,
    `Address: ${inquiry.address}`,
    inquiry.note ? `Note: ${inquiry.note}` : "Note: None"
  ].join("\n");
}

export function isEditablePlaceholder(value: string): boolean {
  return value.startsWith("EDITABLE_");
}
