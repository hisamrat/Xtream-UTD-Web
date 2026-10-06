import { Clock, MessageCircle, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { commerceConfig } from "@/config/commerce";
import { siteConfig } from "@/config/site";
import { getDeliveryFee } from "@/domain/commerce/delivery";
import type { TranslationKey } from "@/i18n/dictionary";
import type { MessageParams } from "@/shared/i18n/format";
import type { LocalizedText } from "@/shared/i18n/languages";

export type TrustPointId = "authentic" | "dispatch" | "cod" | "support" | "supportChat" | "quality" | "pricing" | "nationwide";

export type TrustPoint = {
  id: TrustPointId;
  Icon: typeof Truck;
  label: TranslationKey;
  /** Either a translated description or a localized config value (e.g. business hours). */
  description: { key: TranslationKey; params?: MessageParams } | { text: LocalizedText };
};

/** Placeholders available to delivery copy: fees are numbers so Bengali text gets Bengali digits. */
export const deliveryParams: MessageParams = {
  districts: commerceConfig.districtsCovered,
  dhakaFee: getDeliveryFee("dhaka"),
  outsideFee: getDeliveryFee("outside"),
  dhakaEtaMin: commerceConfig.deliveryZones[0].etaHours.min,
  dhakaEtaMax: commerceConfig.deliveryZones[0].etaHours.max,
  outsideEtaMin: commerceConfig.deliveryZones[1].etaHours.min,
  outsideEtaMax: commerceConfig.deliveryZones[1].etaHours.max,
  couriers: commerceConfig.courierPartners.join(" / "),
  min: commerceConfig.nationwideDeliveryDays.min,
  max: commerceConfig.nationwideDeliveryDays.max
};

const trustPoints: Record<TrustPointId, TrustPoint> = {
  authentic: { id: "authentic", Icon: Sparkles, label: "brand.perk.authentic.label", description: { key: "brand.perk.authentic.desc" } },
  dispatch: {
    id: "dispatch",
    Icon: Truck,
    label: "brand.perk.dispatch.label",
    description: { key: "brand.perk.dispatch.desc", params: deliveryParams }
  },
  cod: { id: "cod", Icon: ShieldCheck, label: "brand.perk.cod.label", description: { key: "brand.perk.cod.desc", params: deliveryParams } },
  support: { id: "support", Icon: Clock, label: "brand.perk.support.label", description: { text: siteConfig.business.hoursShort } },
  supportChat: {
    id: "supportChat",
    Icon: MessageCircle,
    label: "brand.perk.support.label",
    description: { text: siteConfig.business.hoursShort }
  },
  quality: { id: "quality", Icon: Sparkles, label: "brand.perk.quality.label", description: { key: "brand.perk.quality.desc" } },
  pricing: { id: "pricing", Icon: ShieldCheck, label: "brand.perk.pricing.label", description: { key: "brand.perk.pricing.desc" } },
  nationwide: {
    id: "nationwide",
    Icon: Truck,
    label: "brand.perk.nationwide.label",
    description: { key: "brand.perk.nationwide.desc", params: deliveryParams }
  }
};

export function getTrustPoints(ids: readonly TrustPointId[]): TrustPoint[] {
  return ids.map((id) => trustPoints[id]);
}

