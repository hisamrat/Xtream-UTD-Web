import type { LocalizedText } from "@/shared/i18n/languages";

/**
 * Editable business details. Delivery fees and timelines live in `config/commerce.ts`.
 * Replace `url` with the production domain before launch (used for canonical/OG URLs).
 */
export const siteConfig = {
  name: "Xtream UTD",
  description: "Trending gadgets and accessories for your desk, home and everyday life.",
  url: "https://example.com",
  order: {
    messengerUrl: "https://m.me/xtreamutd",
    whatsappUrl: "https://wa.me/8801622001879",
    phone: "01622001879",
    email: "xtreamutd@gmail.com"
  },
  socials: {
    facebook: "https://www.facebook.com/xtreamutd",
    instagram: "https://www.instagram.com/xtream_utd",
    youtube: "https://www.youtube.com/channel/UCE17s5QKd7QbuRE2dezkxxQ"
  },
  business: {
    facebookPageUrl: "https://www.facebook.com/xtreamutd",
    facebookPageLabel: "facebook.com/xtreamutd",
    location: {
      en: "Mirpur-10, Dhaka, Bangladesh",
      bn: "মিরপুর-১০, ঢাকা, বাংলাদেশ"
    } satisfies LocalizedText,
    locationShort: {
      en: "Mirpur-10, Dhaka",
      bn: "মিরপুর-১০, ঢাকা"
    } satisfies LocalizedText,
    hours: {
      en: "Everyday: 9:00 AM – 10:00 PM (BST)",
      bn: "প্রতিদিন: সকাল ৯:০০ – রাত ১০:০০ (BST)"
    } satisfies LocalizedText,
    hoursShort: {
      en: "Everyday: 9:00 AM – 10:00 PM",
      bn: "প্রতিদিন: সকাল ৯:০০ – রাত ১০:০০"
    } satisfies LocalizedText
  }
} as const;

/** True when `siteConfig.url` still holds the placeholder domain. */
export const hasProductionUrl = !siteConfig.url.includes("example.com");
