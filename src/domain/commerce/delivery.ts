import { commerceConfig, type DeliveryZone, type DeliveryZoneId } from "@/config/commerce";

export const deliveryZones: readonly DeliveryZone[] = commerceConfig.deliveryZones;

export const DEFAULT_DELIVERY_ZONE: DeliveryZoneId = "dhaka";

export function getDeliveryZone(id: DeliveryZoneId): DeliveryZone {
  const zone = deliveryZones.find((item) => item.id === id);
  if (!zone) {
    throw new Error(`Unknown delivery zone: ${id}`);
  }
  return zone;
}

export function isDeliveryZoneId(value: unknown): value is DeliveryZoneId {
  return deliveryZones.some((zone) => zone.id === value);
}

export function getDeliveryFee(id: DeliveryZoneId): number {
  return getDeliveryZone(id).fee;
}
