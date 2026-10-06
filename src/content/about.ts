import type { LocalizedText } from "@/shared/i18n/languages";

/** Editable copy for the About page. `{placeholders}` are filled from config. */

export const aboutHero = {
  breadcrumb: { en: "About Us", bn: "আমাদের সম্পর্কে" },
  title: { en: "Useful Products & Gear,", bn: "প্রয়োজনীয় প্রোডাক্ট ও গ্যাজেট," },
  titleAccent: { en: "Chosen for Everyday Life.", bn: "দৈনন্দিন জীবন ও ক্রিয়েটরদের জন্য।" },
  lede: {
    en: "Xtream UTD curates trending gadgets and accessories for desks, homes, travel, and creator routines. Our promise is simple: practical items, transparent BDT pricing, and responsive support across Bangladesh.",
    bn: "Xtream UTD নিয়ে এসেছে ট্রেন্ডিং গ্যাজেট ও ক্রিয়েটর ইকুইপমেন্ট—ডেস্ক সেটআপ, বাসা, ভ্রমণ ও ক্রিয়েটরদের প্রাত্যহিক কাজের সুবিধার্থে। সেরা কোয়ালিটি, সাশ্রয়ী মূল্য এবং দেশব্যাপী নির্ভরযোগ্য কাস্টমার সাপোর্টই আমাদের মূল অঙ্গীকার।"
  }
} satisfies Record<string, LocalizedText>;

export type ValueCardIcon = "sparkles" | "shield" | "truck" | "clock" | "package" | "map" | "rotate";
export type ValueCardBadge = "messenger" | "whatsapp" | "location" | "hours" | "email";

/** Bento cards shared in shape by the About and Terms pages. */
export type ValueCard = {
  id: string;
  icon: ValueCardIcon;
  badge: ValueCardBadge;
  tag: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  metaIcon: ValueCardIcon;
  meta: LocalizedText;
};

export const aboutValues: ValueCard[] = [
  {
    id: "quality",
    icon: "sparkles",
    badge: "messenger",
    tag: { en: "Quality Standards", bn: "পণ্যের গুণগত মান" },
    title: { en: "Curated for Function & Finish", bn: "কার্যকারিতা ও প্রিমিয়াম ফিনিশ" },
    description: {
      en: "Practical items carefully selected for function, finish, durability, and maximum everyday creator value.",
      bn: "ব্যবহারযোগ্যতা, প্রিমিয়াম ফিনিশ এবং দীর্ঘস্থায়িত্ব নিশ্চিত করে প্রতিটি গ্যাজেট ও টুলস যত্নসহকারে বাছাই করা হয়েছে।"
    },
    metaIcon: "package",
    meta: { en: "Verified Quality", bn: "কোয়ালিটি গ্যারান্টি" }
  },
  {
    id: "pricing",
    icon: "shield",
    badge: "whatsapp",
    tag: { en: "Fair Pricing", bn: "স্বচ্ছ মূল্য" },
    title: { en: "Affordable & Honest BDT Pricing", bn: "সাশ্রয়ী ও স্বচ্ছ বাংলাদেশি মূল্য" },
    description: {
      en: "Clear Bangladeshi Taka pricing with visible promotional discounts, transparent courier rates, and zero hidden costs.",
      bn: "স্পষ্ট বাংলাদেশি টাকায় প্রদর্শিত মূল্য, কোনো লুকানো ফি নেই এবং আকর্ষণীয় স্পেশাল ডিসকাউন্ট অফার।"
    },
    metaIcon: "shield",
    meta: { en: "No Hidden Fees", bn: "১০০% স্বচ্ছ মূল্য" }
  },
  {
    id: "delivery",
    icon: "truck",
    badge: "location",
    tag: { en: "Nationwide Delivery", bn: "ডেলিভারি সুবিধা" },
    title: { en: "Inside Dhaka ৳{dhakaFee} | Outside ৳{outsideFee}", bn: "ঢাকার ভেতরে ৳{dhakaFee} | বাইরে ৳{outsideFee}" },
    description: {
      en: "Inside Dhaka: ৳{dhakaFee} ({dhakaEtaMin}–{dhakaEtaMax}h). Outside Dhaka: ৳{outsideFee} ({outsideEtaMin}–{outsideEtaMax}h) with Cash on Delivery nationwide in {min}–{max} days.",
      bn: "ঢাকা ও সারাদেশের {districts} জেলায় {min}–{max} দিনে হোম ডেলিভারি এবং পার্সেল হাতে পেয়ে ক্যাশ অন ডেলিভারিতে মূল্য পরিশোধের সুবিধা।"
    },
    metaIcon: "truck",
    meta: { en: "{districts} Districts Covered", bn: "{districts} জেলায় হোম ডেলিভারি" }
  },
  {
    id: "care",
    icon: "clock",
    badge: "hours",
    tag: { en: "Customer Care", bn: "কাস্টমার কেয়ার" },
    title: { en: "{hours}", bn: "{hours}" },
    description: {
      en: "Customer service available 7 days a week via direct hotline ({phone}), Messenger, WhatsApp, and official channels.",
      bn: "হটলাইন ({phone}), মেসেঞ্জার এবং অফিসিয়াল চ্যানেলে সপ্তাহের ৭ দিন সার্বক্ষণিক কাস্টমার সাপোর্ট সার্ভিস।"
    },
    metaIcon: "map",
    meta: { en: "{locationShort}", bn: "{locationShort}" }
  }
];

export const aboutCollections = {
  tag: { en: "Our Collections", bn: "আমাদের কালেকশন" },
  title: { en: "Explore Curated Gear Categories", bn: "পণ্য কালেকশন অন্বেষণ করুন" },
  lede: {
    en: "Find the exact creator tools, lighting, audio gear, and desk accessories for your setup:",
    bn: "আপনার কাজের পরিবেশ বা দৈনন্দিন ব্যবহারের জন্য পছন্দের ক্যাটাগরি বেছে নিন:"
  }
} satisfies Record<string, LocalizedText>;
