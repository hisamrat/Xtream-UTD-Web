import { describe, expect, it } from "vitest";
import { calculateDiscountPercentage, calculateSavings, hasValidOldPrice } from "@/domain/product/pricing";
import { validateCustomerFields } from "./customer-validation";
import { getDeliveryFee, isDeliveryZoneId } from "./delivery";
import { formatPrice } from "./money";
import { buildInquiryMessage, buildMessengerUrl, buildOrderMessage, getOrderSubtotal } from "./order-message";
import { isValidBdMobile, normalizeBdPhone } from "./phone";

describe("money and pricing", () => {
  it("formats Bangladeshi taka", () => {
    expect(formatPrice(1290)).toBe("৳1,290");
    expect(formatPrice(0)).toBe("৳0");
  });

  it("calculates discounts only for a higher old price", () => {
    expect(hasValidOldPrice({ price: 199, old_price: 250 })).toBe(true);
    expect(calculateDiscountPercentage({ price: 199, old_price: 250 })).toBe(20);
    expect(calculateSavings({ price: 199, old_price: 250 })).toBe(51);
    expect(calculateDiscountPercentage({ price: 300, old_price: 250 })).toBe(0);
  });
});

describe("delivery", () => {
  it("reads fees from the commerce config", () => {
    expect(getDeliveryFee("dhaka")).toBe(70);
    expect(getDeliveryFee("outside")).toBe(130);
    expect(isDeliveryZoneId("dhaka")).toBe(true);
    expect(isDeliveryZoneId("chattogram")).toBe(false);
  });
});

describe("phone validation", () => {
  it("accepts Bangladeshi mobile numbers with optional spacing and country code", () => {
    expect(isValidBdMobile("01712345678")).toBe(true);
    expect(isValidBdMobile("017 1234-5678")).toBe(true);
    expect(isValidBdMobile("+8801712345678")).toBe(true);
    expect(normalizeBdPhone("+880 1712 345678")).toBe("01712345678");
  });

  it("rejects other numbers", () => {
    expect(isValidBdMobile("01212345678")).toBe(false);
    expect(isValidBdMobile("1712345678")).toBe(false);
    expect(isValidBdMobile("12345")).toBe(false);
  });

  it("reports required and phone errors per field", () => {
    expect(validateCustomerFields({ name: " ", phone: "123", note: "" }, ["name", "phone"] as const)).toEqual({
      name: "required",
      phone: "invalidPhone"
    });
    expect(validateCustomerFields({ name: "Rahim", phone: "01712345678" }, ["name", "phone"] as const)).toEqual({});
  });
});

describe("order messages", () => {
  const lines = [
    { title: "Desk Lamp", variant: "Black", quantity: 2, unitPrice: 900 },
    { title: "Cloud Light", variant: "Standard", quantity: 1, unitPrice: 550 }
  ];
  const customer = { name: "Rahim Uddin", phone: "01712345678", address: "House 1, Road 2", thana: "Mirpur", district: "Dhaka" };

  it("totals the lines", () => {
    expect(getOrderSubtotal(lines)).toBe(2350);
  });

  it("includes customer, products and totals with the delivery fee", () => {
    const message = buildOrderMessage({ lines, customer, deliveryZone: "outside" });
    expect(message).toContain("Name: Rahim Uddin");
    expect(message).toContain("Delivery Location: Outside Dhaka");
    expect(message).toContain("Police Station (Thana): Mirpur");
    expect(message).toContain("1. Product Name: Desk Lamp");
    expect(message).toContain("Price: ৳1,800");
    expect(message).toContain("Delivery Fee: ৳130");
    expect(message).toContain("Grand Total: ৳2,480");
    expect(message).not.toContain("Additional Note");
  });

  it("leaves the delivery fee to the seller when no zone is chosen", () => {
    const message = buildOrderMessage({ lines: lines.slice(0, 1), customer: { ...customer, note: "Gift wrap" } });
    expect(message).toContain("Delivery Fee: To be confirmed by seller");
    expect(message).toContain("Additional Note: Gift wrap");
    expect(message).not.toContain("Grand Total");
  });

  it("builds support inquiries and Messenger links", () => {
    const inquiry = buildInquiryMessage({ topic: "Product Advice", name: "Rahim", phone: "01712345678", message: "Is it USB-C?" });
    expect(inquiry).toContain("Inquiry: Product Advice");
    expect(buildMessengerUrl("https://m.me/shop", "Hi & bye")).toBe("https://m.me/shop?text=Hi%20%26%20bye");
  });
});
