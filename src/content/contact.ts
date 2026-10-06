import type { LocalizedText } from "@/shared/i18n/languages";

/**
 * Editable copy for the contact page. `{placeholders}` are filled from config
 * (fees, delivery windows, couriers, phone) so prices never drift from checkout.
 */

export const contactHero = {
  title: { en: "Need Creator Gear Help?", bn: "ক্রিয়েটর গিয়ার বা গ্যাজেট নিয়ে সাহায্য চাই?" },
  titleAccent: { en: "Talk with Xtream UTD.", bn: "Xtream UTD-এর সাথে কথা বলুন।" },
  lede: {
    en: "Whether you're building a hybrid studio, searching for rare mirrorless accessories, or tracking a nationwide delivery, our support team in Dhaka is here to help.",
    bn: "স্টুডিও সেটআপ, ক্যামেরার এক্সেসরিজ খোঁজা বা দেশব্যাপী পার্সেল ট্র্যাকিং—আমাদের সাপোর্ট টিম সবসময় আপনাকে সহযোগিতা করতে প্রস্তুত।"
  }
} satisfies Record<string, LocalizedText>;

export const contactChannels = {
  statusOnline: { en: "Support Desk Online", bn: "সাপোর্ট ডেস্ক অনলাইন" },
  responseTime: { en: "Replies in ~15 mins", bn: "১৫ মিনিটে উত্তর দেওয়া হয়" },
  title: { en: "Direct Quick-Connect", bn: "সরাসরি যোগাযোগ চ্যানেল" },
  subtitle: {
    en: "Choose your preferred direct channel for instant product advice, price confirmation, or nationwide delivery details.",
    bn: "প্রোডাক্টের তথ্য, মূল্য নিশ্চিতকরণ বা দেশব্যাপী ডেলিভারি সংক্রান্ত পরামর্শের জন্য আপনার পছন্দের মাধ্যম বেছে নিন।"
  },
  phoneTag: { en: "Customer Hotline", bn: "কাস্টমার হটলাইন" },
  phoneDesc: {
    en: "Direct phone line for urgent inquiries, advice & order confirmation.",
    bn: "পণ্য অনুসন্ধান, পরামর্শ ও দ্রুত অর্ডারের জন্য সরাসরি কল করুন।"
  },
  phoneAction: { en: "Call Now", bn: "কল করুন" },
  phoneAria: { en: "Call Xtream UTD hotline", bn: "Xtream UTD হটলাইনে কল করুন" },
  phoneCopyAria: { en: "Copy phone number", bn: "ফোন নম্বর কপি করুন" },
  emailTag: { en: "Official Inquiries", bn: "অফিসিয়াল ইমেইল" },
  emailDesc: {
    en: "For invoices, bulk orders, corporate inquiries and official requests.",
    bn: "ইনভয়েস, বাল্ক ও প্রাতিষ্ঠানিক অর্ডার এবং তথ্যের জন্য ইমেইল করুন।"
  },
  emailAction: { en: "Email Us", bn: "ইমেইল পাঠান" },
  emailAria: { en: "Send email to Xtream UTD", bn: "Xtream UTD-কে ইমেইল পাঠান" },
  emailCopyAria: { en: "Copy email address", bn: "ইমেইল ঠিকানা কপি করুন" },
  locationTag: { en: "{districts} Districts", bn: "{districts} জেলা" },
  locationDesc: {
    en: "Inside Dhaka: ৳{dhakaFee} ({dhakaEtaMin}–{dhakaEtaMax}h). Outside Dhaka: ৳{outsideFee} ({outsideEtaMin}–{outsideEtaMax}h via {couriers}) nationwide with Cash on Delivery.",
    bn: "ঢাকার ভেতরে ডেলিভারি চার্জ {dhakaFee}/- ({dhakaEtaMin}–{dhakaEtaMax} ঘণ্টা), ঢাকার বাইরে {outsideFee}/- ({outsideEtaMin}–{outsideEtaMax} ঘণ্টা) সারাদেশে {districts} জেলায় ক্যাশ অন ডেলিভারি।"
  },
  locationBadge: { en: "100% Authentic Product Guarantee", bn: "১০০% অথেনটিক প্রোডাক্ট গ্যারান্টি" },
  hoursTag: { en: "Schedule", bn: "সময়সূচি" },
  hoursDesc: {
    en: "Customer service available 7 days a week for all inquiries.",
    bn: "সপ্তাহের ৭ দিন কাস্টমার সাপোর্ট সার্ভিস সক্রিয়।"
  },
  hoursBadge: { en: "7 Days a Week", bn: "সপ্তাহের ৭ দিন খোলা" }
} satisfies Record<string, LocalizedText>;

export type FaqIcon = "sparkles" | "truck" | "shield" | "help";

export type FaqItem = { id: string; icon: FaqIcon; question: LocalizedText; answer: LocalizedText };

export const contactFaqIntro = {
  kicker: { en: "Help & Clarity", bn: "সাহায্য ও স্পষ্টতা" },
  title: { en: "Frequently Asked Questions", bn: "সচরাচর জিজ্ঞাসিত প্রশ্নাবলী" },
  lede: {
    en: "Everything you need to know about dispatch, package verification, and customer support in Bangladesh.",
    bn: "ডেলিভারি, পার্সেল চেকিং ও কাস্টমার সাপোর্ট সংক্রান্ত প্রয়োজনীয় সকল তথ্য।"
  }
} satisfies Record<string, LocalizedText>;

export const contactFaqs: FaqItem[] = [
  {
    id: "ordering",
    icon: "sparkles",
    question: { en: "How do I place an order with Xtream UTD?", bn: "Xtream UTD-তে কীভাবে অর্ডার করব?" },
    answer: {
      en: "Select your desired gadgets, add them to your cart, and proceed to checkout, or call our hotline ({phone}) directly. Home delivery is available nationwide within {min}–{max} days. Your order will be confirmed after the order processing message from our seller desk.",
      bn: "আপনার পছন্দের গ্যাজেট কার্টে যোগ করে চেকআউট করুন অথবা আমাদের হটলাইনে ({phone}) কল করুন। সারাদেশে {min}–{max} দিনের মধ্যে হোম ডেলিভারি সুবিধা রয়েছে। সেলারের পক্ষ থেকে অর্ডার প্রসেসিং মেসেজ পাওয়ার পর অর্ডার চূড়ান্তভাবে কনফার্ম হবে।"
    }
  },
  {
    id: "delivery",
    icon: "truck",
    question: {
      en: "What are your delivery timelines and courier charges in Bangladesh?",
      bn: "ডেলিভারির সময়সীমা এবং কুরিয়ার চার্জ কত?"
    },
    answer: {
      en: "Inside Dhaka Delivery Charge is ৳{dhakaFee} (typically arrives within {dhakaEtaMin} to {dhakaEtaMax} hours). Outside Dhaka Delivery Charge is ৳{outsideFee} (dispatched via trusted courier partners {couriers} across all {districts} districts within {outsideEtaMin} to {outsideEtaMax} hours).",
      bn: "ঢাকার ভেতরে ডেলিভারি চার্জ {dhakaFee}/- ({dhakaEtaMin} থেকে {dhakaEtaMax} ঘণ্টা)। ঢাকার বাইরে ডেলিভারি চার্জ {outsideFee}/- (বিশ্বস্ত কুরিয়ার {couriers}-এর মাধ্যমে {outsideEtaMin} থেকে {outsideEtaMax} ঘণ্টা) সারাদেশে {districts} জেলায় নির্ভরযোগ্যভাবে পৌঁছে দেওয়া হয়।"
    }
  },
  {
    id: "payment",
    icon: "shield",
    question: { en: "Is Cash on Delivery available across Bangladesh?", bn: "সারাদেশে কি ক্যাশ অন ডেলিভারি সুবিধা আছে?" },
    answer: {
      en: "Yes! Cash on Delivery is supported across all {districts} districts in Bangladesh with home delivery available nationwide within {min}–{max} days.",
      bn: "হ্যাঁ! ঢাকা ও সারাদেশের {districts} জেলার প্রতিটি ঠিকানায় ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। পার্সেল হাতে পেয়ে মূল্য পরিশোধ করতে পারবেন।"
    }
  },
  {
    id: "authenticity",
    icon: "sparkles",
    question: { en: "Are all products 100% authentic and genuine?", bn: "পণ্যগুলো কি ১০০% আসল ও জেনুইন?" },
    answer: {
      en: "Yes! Xtream UTD maintains a strict 100% Authentic Product Guarantee across all trending gadgets, creator tools, desk setups, and lifestyle accessories.",
      bn: "হ্যাঁ! Xtream UTD-এর প্রতিটি গ্যাজেট, ক্রিয়েটর টুলস ও এক্সেসরিজে রয়েছে ১০০% আসল পণ্যের শতভাগ নিশ্চয়তা।"
    }
  },
  {
    id: "setups",
    icon: "help",
    question: {
      en: "Do you offer consultations for custom creator desk and camera rigs?",
      bn: "আপনারা কি কনটেন্ট ক্রিয়েটর ও স্টুডিও সেটআপের জন্য পরামর্শ দেন?"
    },
    answer: {
      en: "Yes! Whether you need a multi-camera live streaming setup, podcast microphone array, gimbal balancing configuration, or studio lighting layout, our specialists will guide you to matching brackets, cables, and power solutions tailored to your budget.",
      bn: "হ্যাঁ! লাইভ স্ট্রিমিং, পডকাস্ট মাইক্রোফোন, গিম্বল ব্যালেন্সিং বা স্টুডিও লাইটিং সেটআপের জন্য আমাদের এক্সপার্ট টিম আপনাকে সঠিক গিয়ার ও এক্সেসরিজ নির্বাচনে সম্পূর্ণ বিনামূল্যে পরামর্শ দেবে।"
    }
  }
];
