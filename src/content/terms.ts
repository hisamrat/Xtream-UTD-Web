import type { Language, LocalizedText } from "@/shared/i18n/languages";
import type { RichSegment } from "@/shared/ui/RichText";
import type { ValueCard } from "./about";

/** Editable copy for the Terms & Conditions page. `{placeholders}` are filled from config. */

export const termsHero = {
  breadcrumb: { en: "Terms & Conditions", bn: "শর্তাবলী ও নিয়মাবলী" },
  title: { en: "Transparent Policies,", bn: "স্বচ্ছ পলিসি ও নিয়মাবলী," },
  titleAccent: { en: "Built on Customer Trust.", bn: "নিরাপদ কেনাকাটার বিশ্বস্ত নিশ্চয়তা।" },
  lede: {
    en: "Clear, customer-first policies designed for safe shopping across Bangladesh with Cash on Delivery, reliable courier dispatch, and 100% genuine product verification.",
    bn: "সারাদেশে নিরাপদ ও ঝামেলামুক্ত কেনাকাটার জন্য Xtream UTD-এর গ্রাহকবান্ধব পলিসি—ক্যাশ অন ডেলিভারি, দ্রুত কুরিয়ার সুবিধা এবং শতভাগ আসল পণ্যের নিশ্চয়তাসহ।"
  }
} satisfies Record<string, LocalizedText>;

export const termsAgreements: ValueCard[] = [
  {
    id: "rates",
    icon: "truck",
    badge: "location",
    tag: { en: "Delivery Rates", bn: "ডেলিভারি চার্জ" },
    title: { en: "৳{dhakaFee} Inside Dhaka | ৳{outsideFee} Outside Dhaka", bn: "ঢাকার ভেতরে ৳{dhakaFee} | ঢাকার বাইরে ৳{outsideFee}" },
    description: {
      en: "All prices are in Bangladeshi Taka (৳ / BDT). Dispatched via {couriersList} across all {districts} districts within {dhakaEtaMin} to {outsideEtaMax} hours.",
      bn: "Xtream UTD-তে প্রদর্শিত সকল মূল্য বাংলাদেশি টাকায় (৳ / BDT)। {couriersList}-এর মাধ্যমে {districts} জেলায় {dhakaEtaMin} থেকে {outsideEtaMax} ঘণ্টার মধ্যে ডেলিভারি পৌঁছে দেওয়া হয়।"
    },
    metaIcon: "truck",
    meta: { en: "{min}–{max} Days Home Delivery", bn: "{min}–{max} দিনে হোম ডেলিভারি" }
  },
  {
    id: "cod",
    icon: "shield",
    badge: "whatsapp",
    tag: { en: "Payment Method", bn: "পেমেন্ট সুবিধা" },
    title: { en: "100% Cash on Delivery Nationwide", bn: "সারাদেশে {districts} জেলায় ক্যাশ অন ডেলিভারি" },
    description: {
      en: "We operate primarily via Cash on Delivery (COD) across Dhaka and all {districts} districts in Bangladesh with zero prepayment risk on in-stock orders.",
      bn: "আমরা মূলত ক্যাশ অন ডেলিভারি (COD) পদ্ধতিতে কাজ করি ঢাকা ও সারাদেশের {districts} জেলায়। পার্সেল রিসিভ করার সময় সম্পূর্ণ মূল্য পরিশোধ করতে পারবেন।"
    },
    metaIcon: "shield",
    meta: { en: "Cash on Delivery Available", bn: "ক্যাশ অন ডেলিভারি প্রযোজ্য" }
  },
  {
    id: "authenticity",
    icon: "sparkles",
    badge: "messenger",
    tag: { en: "Authenticity Guarantee", bn: "পণ্যের শতভাগ নিশ্চয়তা" },
    title: { en: "100% Authentic & Genuine Products", bn: "১০০% আসল ও যাচাইকৃত গ্যাজেট" },
    description: {
      en: "All gadgets, creator tools, camera rigs, lighting, and desk accessories sold by Xtream UTD are 100% authentic and verified.",
      bn: "Xtream UTD-এর সকল গ্যাজেট, ক্রিয়েটর টুলস, লাইটিং ও ডেস্ক এক্সেসরিজ শতভাগ আসল, টেকসই এবং কোয়ালিটি-টেস্টেড।"
    },
    metaIcon: "rotate",
    meta: { en: "Quality Tested", bn: "কোয়ালিটি পরীক্ষিত" }
  },
  {
    id: "confirmation",
    icon: "package",
    badge: "email",
    tag: { en: "Order Confirmation", bn: "অর্ডার প্রসেসিং" },
    title: { en: "Confirmed via Seller Message", bn: "সেলার মেসেজে অর্ডার চূড়ান্তকরণ" },
    description: {
      en: "Orders are reviewed and confirmed promptly by our seller desk. You will receive direct updates until your parcel is delivered.",
      bn: "অর্ডার সাবমিট করার পর আমাদের সেলার ডেস্ক থেকে প্রসেসিং ও কনফার্মেশন মেসেজ পাওয়ার পর আপনার অর্ডার চূড়ান্তভাবে নিশ্চিত করা হবে।"
    },
    metaIcon: "package",
    meta: { en: "Verified Before Dispatch", bn: "সেলার ভেরিফিকেশন" }
  }
];

export const preOrderTerms: {
  tag: LocalizedText;
  title: LocalizedText;
  lede: LocalizedText;
  rules: Array<Record<Language, RichSegment[]>>;
  alertLabel: LocalizedText;
  alert: Record<Language, RichSegment[]>;
} = {
  tag: { en: "Direct Import Pre-Order", bn: "চীন থেকে সরাসরি প্রি-অর্ডার" },
  title: { en: "How to Place a Pre-Order", bn: "কিভাবে প্রি-অর্ডার করবেন (How to Place a Pre-Order)" },
  lede: {
    en: "Step-by-step requirements for custom gadget pre-orders from China to Bangladesh.",
    bn: "চীন থেকে কাঙ্ক্ষিত প্রিমিয়াম গ্যাজেট ও অ্যাক্সেসরিজ প্রি-অর্ডারের স্বচ্ছ নিয়মাবলী:"
  },
  rules: [
    {
      en: ["To place a pre-order, you need to pay ", { strong: "50% of the product price in advance" }, "."],
      bn: ["প্রি-অর্ডার কনফার্ম করতে পণ্যের মূল্যের ", { strong: "৫০% অগ্রিম পেমেন্ট (50% of the product price in advance)" }, " করতে হবে।"]
    },
    {
      en: ["The ", { strong: "remaining 50% can be paid upon delivery" }, " of the product."],
      bn: ["বাকি ", { strong: "৫০% মূল্য পণ্য হাতে পাওয়ার পর ক্যাশ অন ডেলিভারিতে (remaining 50% upon delivery)" }, " পরিশোধ করা যাবে।"]
    },
    {
      en: ["Delivery usually takes ", { strong: "25–30 days" }, "."],
      bn: ["প্রি-অর্ডার ডেলিভারির সময় সাধারণত ", { strong: "২৫–৩০ দিন (25–30 days)" }, "।"]
    },
    {
      en: ["The advance payment can be made via ", { strong: "bKash or Nagad" }, "."],
      bn: ["অগ্রিম পেমেন্ট ", { strong: "বিকাশ বা নগদ (bKash or Nagad)" }, "-এর মাধ্যমে সম্পন্ন করা যাবে।"]
    },
    {
      en: ["After placing your pre-order, you will receive ", { strong: "regular updates on the product’s journey from China to Bangladesh" }, "."],
      bn: [
        "প্রি-অর্ডার করার পর ",
        { strong: "চীন থেকে বাংলাদেশে পণ্য পৌঁছানোর প্রতিটি ধাপের নিয়মিত আপডেট (regular updates on the product’s journey from China to Bangladesh)" },
        " আপনাকে প্রদান করা হবে।"
      ]
    }
  ],
  alertLabel: { en: "Important:", bn: "জরুরী নির্দেশিকা (Important):" },
  alert: {
    en: ["Once the pre-ordered product arrives in Bangladesh, if you do not receive it, the ", { strong: "advance payment will not be refunded" }, "."],
    bn: [
      "প্রি-অর্ডার করা পণ্য বাংলাদেশে পৌঁছানোর পর আপনি যদি পার্সেল রিসিভ না করেন, তবে ",
      { strong: "অগ্রিম প্রদানকৃত পেমেন্ট রিফান্ড করা হবে না (advance payment will not be refunded)" },
      "।"
    ]
  }
};
