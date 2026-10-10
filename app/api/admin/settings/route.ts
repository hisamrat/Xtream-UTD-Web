import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { siteConfig } from "@/config/site";
import { commerceConfig } from "@/config/commerce";

const SETTINGS_FILE_PATH = path.join(process.cwd(), "data", "store_settings.json");

import { type StoreSettings } from "@/domain/settings/settings-schema";
export type { StoreSettings };

const DEFAULT_SETTINGS: StoreSettings = {
  siteName: siteConfig.name,
  siteDescription: siteConfig.description,
  siteContactEmail: siteConfig.order.email,
  sitePhone: siteConfig.order.phone,
  siteHours: siteConfig.business.hours.en,
  whatsappUrl: siteConfig.order.whatsappUrl,
  messengerUrl: siteConfig.order.messengerUrl,

  locationName: siteConfig.business.location.en,
  deliveryDhaka: `৳${commerceConfig.deliveryZones[0].fee} (${commerceConfig.deliveryZones[0].etaHours.min}–${commerceConfig.deliveryZones[0].etaHours.max} Hours)`,
  deliveryOutside: `৳${commerceConfig.deliveryZones[1].fee} (${commerceConfig.deliveryZones[1].etaHours.min}–${commerceConfig.deliveryZones[1].etaHours.max} Hours)`,
  deliveryNote: "Cash on delivery available nationwide. Orders confirmed after phone/message confirmation.",
  courierPartners: [...commerceConfig.courierPartners],

  fbPageUrl: siteConfig.business.facebookPageUrl,
  fbUrl: siteConfig.socials.facebook,
  igUrl: siteConfig.socials.instagram,
  ytUrl: siteConfig.socials.youtube
};

export async function readSettings(): Promise<StoreSettings> {
  try {
    const content = await fs.readFile(SETTINGS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(content);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = await readSettings();
    const updated: StoreSettings = {
      ...current,
      ...body
    };

    await fs.mkdir(path.dirname(SETTINGS_FILE_PATH), { recursive: true });
    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");

    try {
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/contact");
      revalidatePath("/terms");
    } catch {
      // Non-fatal if outside request context
    }

    return NextResponse.json({
      success: true,
      message: "Store settings saved successfully.",
      settings: updated
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
