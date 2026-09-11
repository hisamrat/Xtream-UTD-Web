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
  | "view_details"
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "pages"
  | "products"
  | "opening_product_details"
  | "featured_product"
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
  | "cart";

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    nav_home: "Home",
    nav_reload: "Reload",
    nav_products: "Products",
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
    scroll_to_zoom: "SCROLL TO ZOOM",
    view_details: "View Details",
    in_stock: "In stock",
    low_stock: "Low stock",
    out_of_stock: "Out of stock",
    pages: "Pages",
    products: "Products",
    opening_product_details: "Opening product details",
    featured_product: "Featured product",
    catalogue_title: "Products",
    catalogue_desc: "Browse professional creator gear, cameras, audio, gimbals, lighting, and accessories.",
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
    cart: "Shopping Cart"
  },
  bn: {
    nav_home: "হোম",
    nav_reload: "রিলোড",
    nav_products: "প্রোডাক্টস",
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
    scroll_to_zoom: "জুম করতে স্ক্রোল করুন",
    view_details: "বিস্তারিত দেখুন",
    in_stock: "স্টকে আছে",
    low_stock: "সীমিত স্টক",
    out_of_stock: "স্টক শেষ",
    pages: "পেজ",
    products: "প্রোডাক্ট",
    opening_product_details: "প্রোডাক্টের বিবরণ খোলা হচ্ছে",
    featured_product: "জনপ্রিয় প্রোডাক্ট",
    catalogue_title: "প্রোডাক্টস",
    catalogue_desc: "প্রফেশনাল ক্রিয়েটর গিয়ার, ক্যামেরা, অডিও, গিম্বল, লাইটিং এবং এক্সেসরিজ কালেকশন।",
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
    cart: "শপিং কার্ট"
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

