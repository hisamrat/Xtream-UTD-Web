/**
 * Editable commerce facts. Every price, fee and delivery promise shown on the site
 * is derived from this file — change a value here and all copy updates with it.
 */
export const commerceConfig = {
  currency: "BDT",
  cashOnDelivery: true,
  districtsCovered: 64,
  nationwideDeliveryDays: { min: 2, max: 3 },
  courierPartners: ["Pathao", "Steadfast", "eCourier"],
  deliveryZones: [
    { id: "dhaka", fee: 70, etaHours: { min: 24, max: 48 } },
    { id: "outside", fee: 130, etaHours: { min: 48, max: 72 } }
  ]
} as const;

export type DeliveryZoneId = (typeof commerceConfig.deliveryZones)[number]["id"];
export type DeliveryZone = (typeof commerceConfig.deliveryZones)[number];
