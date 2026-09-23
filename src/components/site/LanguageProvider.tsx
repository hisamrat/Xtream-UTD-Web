"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "bn";

export type TranslationKey =
  | "nav_home"
  | "nav_reload"
  | "nav_products"
  | "nav_contact"
  | "nav_about"
  | "nav_terms"
  | "switch_to_bangla"
  | "switch_to_english"
  | "language"
  | "search"
  | "search_placeholder"
  | "search_products"
  | "no_products_found"
  | "close"
  | "drag_to_rotate"
  | "hover_for_details"
  | "scroll_to_zoom"
  | "scroll_to_explore"
  | "view_details"
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "pages"
  | "products"
  | "opening_product_details"
  | "featured_product"
  | "catalogue_kicker"
  | "catalogue_title"
  | "catalogue_desc"
  | "all_categories"
  | "sort_newest"
  | "sort_featured"
  | "sort_price_asc"
  | "sort_price_desc"
  | "sort_title"
  | "order_primary"
  | "messenger"
  | "whatsapp"
  | "share"
  | "colour"
  | "quantity"
  | "product_features"
  | "specifications"
  | "delivery"
  | "policy"
  | "related_products"
  | "recently_viewed"
  | "explore"
  | "central_hub"
  | "mirpur_address"
  | "all_rights_reserved"
  | "top_selling"
  | "best_sellers"
  | "new_products"
  | "add_to_cart"
  | "added_to_cart"
  | "cart"
  | "click_to_view_detail"
  | "reload_to_reset"
  | "feature_authentic_title"
  | "feature_authentic_desc"
  | "feature_dispatch_title"
  | "feature_dispatch_desc"
  | "feature_cod_title"
  | "feature_cod_desc"
  | "feature_support_title"
  | "feature_support_desc"
  | "most_wanted"
  | "top_selling_title"
  | "shop_all"
  | "reviews_kicker"
  | "reviews_title"
  | "nav_explore"
  | "related_products_kicker"
  | "related_products_title"
  | "recently_viewed_kicker"
  | "recently_viewed_title";

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    nav_home: "Home",
    nav_reload: "Reload",
    nav_products: "Products",
    nav_explore: "Explore",
    nav_contact: "Contact",
    nav_about: "About Us",
    nav_terms: "Terms & Conditions",
    switch_to_bangla: "বাংলা ভাষায় দেখুন",
    switch_to_english: "Switch to English",
    language: "Language",
    search: "Search",
    search_placeholder: "Search products by name, brand, or model...",
    search_products: "Search Products",
    no_products_found: "No products found",
    close: "Close",
    drag_to_rotate: "DRAG TO ROTATE",
    hover_for_details: "HOVER FOR DETAILS",
    scroll_to_zoom: "SCROLL TO EXPLORE",
    scroll_to_explore: "SCROLL TO EXPLORE",
    view_details: "View Details",
    in_stock: "In stock",
    low_stock: "Low stock",
    out_of_stock: "Out of stock",
    pages: "Pages",
    products: "Products",
    opening_product_details: "Opening product details",
    featured_product: "Featured product",
    catalogue_kicker: "TRENDY GADGETS & ACCESSORIES",
    catalogue_title: "Useful Gadgets & Accessories, Chosen for Everyday Life",
    catalogue_desc: "Explore our curated collection of trending gadgets, smart desk accessories, ambient lighting, and everyday essentials with delivery across Bangladesh.",
    all_categories: "All Categories",
    sort_newest: "Newest first",
    sort_featured: "Featured",
    sort_price_asc: "Price: low to high",
    sort_price_desc: "Price: high to low",
    sort_title: "Title",
    order_primary: "Order on Messenger",
    messenger: "Messenger",
    whatsapp: "WhatsApp",
    share: "Share",
    colour: "Colour",
    quantity: "Quantity",
    product_features: "Product features",
    specifications: "Specifications",
    delivery: "Delivery",
    policy: "Policy",
    related_products: "Related products",
    recently_viewed: "Recently viewed",
    explore: "Explore",
    central_hub: "Central Hub",
    mirpur_address: "Mirpur-10, Dhaka, Bangladesh",
    all_rights_reserved: "All Rights are Reserved.",
    top_selling: "Top Selling",
    best_sellers: "Best Sellers",
    new_products: "New Products",
    add_to_cart: "Add to Cart",
    added_to_cart: "Added",
    cart: "Shopping Cart",
    click_to_view_detail: "CLICK TO VIEW DETAIL",
    reload_to_reset: "RELOAD TO RESET",
    feature_authentic_title: "100% Authentic Product",
    feature_authentic_desc: "100% authentic guarantee",
    feature_dispatch_title: "64-District Dispatch",
    feature_dispatch_desc: "Dhaka ৳70 & nationwide ৳130",
    feature_cod_title: "Cash on Delivery",
    feature_cod_desc: "Nationwide in 2–3 days",
    feature_support_title: "Support Hours",
    feature_support_desc: "Everyday: 9:00 AM – 10:00 PM",
    most_wanted: "MOST WANTED",
    top_selling_title: "The ones people come back for",
    shop_all: "SHOP ALL",
    reviews_kicker: "CUSTOMER REVIEWS & FEEDBACK",
    reviews_title: "What people say after a year",
    related_products_kicker: "RELATED PRODUCTS",
    related_products_title: "Gear tailored to your setup",
    recently_viewed_kicker: "RECENTLY VIEWED",
    recently_viewed_title: "Pick up where you left off"
  },
  bn: {
    nav_home: "হোম",
    nav_reload: "রিলোড",
    nav_products: "প্রোডাক্টস",
    nav_explore: "এক্সপ্লোর",
    nav_contact: "যোগাযোগ",
    nav_about: "আমাদের সম্পর্কে",
    nav_terms: "শর্তাবলী",
    switch_to_bangla: "বাংলা ভাষায় দেখুন",
    switch_to_english: "Switch to English",
    language: "ভাষা",
    search: "অনুসন্ধান",
    search_placeholder: "নাম, ব্র্যান্ড বা মডেল দিয়ে প্রোডাক্ট খুঁজুন...",
    search_products: "প্রোডাক্ট খুঁজুন",
    no_products_found: "কোনো প্রোডাক্ট পাওয়া যায়নি",
    close: "বন্ধ করুন",
    drag_to_rotate: "ঘোরাতে ড্র্যাগ করুন",
    hover_for_details: "বিস্তারিত দেখতে হোভার করুন",
    scroll_to_zoom: "স্ক্রোল করে দেখুন",
    scroll_to_explore: "স্ক্রোল করে দেখুন",
    view_details: "বিস্তারিত দেখুন",
    in_stock: "স্টকে আছে",
    low_stock: "সীমিত স্টক",
    out_of_stock: "স্টক শেষ",
    pages: "পেজ",
    products: "প্রোডাক্ট",
    opening_product_details: "প্রোডাক্টের বিবরণ খোলা হচ্ছে",
    featured_product: "জনপ্রিয় প্রোডাক্ট",
    catalogue_kicker: "ট্রেন্ডি গ্যাজেট ও এক্সেসরিজ",
    catalogue_title: "প্রয়োজনীয় গ্যাজেট ও এক্সেসরিজ, ডেস্ক ও দৈনন্দিন জীবনের জন্য",
    catalogue_desc: "আপনার ডেস্ক সেটআপ, বাসা ও দৈনন্দিন ব্যবহারের জন্য ১০০% আসল স্মার্ট গ্যাজেট, লাইফস্টাইল এক্সেসরিজ এবং লাইটিংয়ের বিশ্বস্ত কালেকশন।",
    all_categories: "সকল ক্যাটাগরি",
    sort_newest: "নতুন প্রোডাক্ট আগে",
    sort_featured: "জনপ্রিয়",
    sort_price_asc: "দাম: কম থেকে বেশি",
    sort_price_desc: "দাম: বেশি থেকে কম",
    sort_title: "নাম অনুসারে",
    order_primary: "মেসেঞ্জারে অর্ডার করুন",
    messenger: "মেসেঞ্জার",
    whatsapp: "হোয়াটসঅ্যাপ",
    share: "শেয়ার করুন",
    colour: "রং",
    quantity: "পরিমাণ",
    product_features: "প্রোডাক্টের বৈশিষ্ট্য",
    specifications: "স্পেসিফিকেশন",
    delivery: "ডেলিভারি",
    policy: "রিটার্ন ও ওয়ারেন্টি",
    related_products: "সম্পর্কিত প্রোডাক্ট",
    recently_viewed: "সম্প্রতি দেখা প্রোডাক্ট",
    explore: "তথ্য ও নির্দেশিকা",
    central_hub: "প্রধান কার্যালয়",
    mirpur_address: "মিরপুর-১০, ঢাকা, বাংলাদেশ",
    all_rights_reserved: "সর্বস্বত্ব সংরক্ষিত।",
    top_selling: "টপ সেলিং",
    best_sellers: "সেরা বিক্রীত",
    new_products: "নতুন প্রোডাক্ট",
    add_to_cart: "কার্টে যোগ করুন",
    added_to_cart: "যোগ হয়েছে",
    cart: "শপিং কার্ট",
    click_to_view_detail: "বিস্তারিত দেখতে ক্লিক করুন",
    reload_to_reset: "রিলোডে ক্লিক করে রিসেট করুন",
    feature_authentic_title: "১০০% আসল পণ্য",
    feature_authentic_desc: "শতভাগ অরিজিনাল গ্যারান্টি",
    feature_dispatch_title: "৬৪ জেলায় ডেলিভারি",
    feature_dispatch_desc: "ঢাকা ৳৭০ এবং সারা দেশে ৳১৩০",
    feature_cod_title: "ক্যাশ অন ডেলিভারি",
    feature_cod_desc: "সারা দেশে ২–৩ দিনে",
    feature_support_title: "সাপোর্ট সময়",
    feature_support_desc: "প্রতিদিন: সকাল ৯:০০ – রাত ১০:০০",
    most_wanted: "সবচেয়ে জনপ্রিয়",
    top_selling_title: "সবার পছন্দের সেরা কালেকশন",
    shop_all: "সব প্রোডাক্ট দেখুন",
    reviews_kicker: "গ্রাহকদের বাস্তব রিভিউ ও মতামত",
    reviews_title: "আমাদের কাস্টমারদের বাস্তব অভিজ্ঞতা",
    related_products_kicker: "সম্পর্কিত প্রোডাক্ট",
    related_products_title: "আপনার সেটআপের জন্য প্রয়োজনীয় গিয়ার",
    recently_viewed_kicker: "সম্প্রতি দেখা প্রোডাক্ট",
    recently_viewed_title: "আপনার সম্প্রতি দেখা আইটেমসমূহ"
  }
};

const categoryTranslations: Record<string, string> = {
  "Cameras & Optics": "ক্যামেরা ও অপটিকস",
  "Audio Products": "অডিও প্রোডাক্ট",
  "Studio Lighting": "স্টুডিও লাইটিং",
  "Gimbals & Stabilizers": "গিম্বল ও স্ট্যাবিলাইজার",
  "Monitors & Recorders": "মনিটর ও রেকর্ডার",
  "Tripods & Support": "ট্রাইপড ও সাপোর্ট",
  "Storage & Power": "স্টোরেজ ও পাওয়ার",
  "Creator Gear": "ক্রিয়েটর গিয়ার",
  Accessories: "এক্সেসরিজ"
};

const stockTranslations: Record<string, string> = {
  "In stock": "স্টকে আছে",
  "Low stock": "সীমিত স্টক",
  "Out of stock": "স্টক শেষ"
};

export function toBengaliDigits(value: string | number): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(value).replace(/[0-9]/g, (digit) => bengaliDigits[Number(digit)] ?? digit);
}

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  tCategory: (category: string) => string;
  tStock: (stock: string) => string;
  formatNumber: (value: string | number) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("xtream-language");
    if (stored === "en" || stored === "bn") {
      setLanguageState(stored);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    document.documentElement.lang = language;
    window.localStorage.setItem("xtream-language", language);
  }, [language, ready]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((curr) => (curr === "en" ? "bn" : "en"));
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] ?? translations.en[key] ?? key;
    },
    [language]
  );

  const tCategory = useCallback(
    (category: string): string => {
      if (language === "bn" && categoryTranslations[category]) {
        return categoryTranslations[category];
      }
      return category;
    },
    [language]
  );

  const tStock = useCallback(
    (stock: string): string => {
      if (language === "bn" && stockTranslations[stock]) {
        return stockTranslations[stock];
      }
      return stock;
    },
    [language]
  );

  const formatNumber = useCallback(
    (value: string | number): string => {
      if (language === "bn") {
        return toBengaliDigits(value);
      }
      return String(value);
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      tCategory,
      tStock,
      formatNumber
    }),
    [language, setLanguage, toggleLanguage, t, tCategory, tStock, formatNumber]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

