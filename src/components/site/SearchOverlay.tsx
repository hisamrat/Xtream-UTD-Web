"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/lib/product-schema";
import { filterProducts } from "@/lib/products";
import { useLanguage } from "./LanguageProvider";

type SearchOverlayProps = Readonly<{
  products: Product[];
  open: boolean;
  onClose: () => void;
}>;

const maxSuggestedProducts = 8;

export function SearchOverlay({ products, open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    window.setTimeout(() => inputRef.current?.focus(), 20);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;
  const results = useMemo(() => {
    if (!trimmedQuery) {
      return [];
    }

    return filterProducts(products, { query: trimmedQuery, sort: "featured" }).slice(0, maxSuggestedProducts);
  }, [products, trimmedQuery]);
  const searchSummary = hasQuery ? `${results.length} suggested products` : "Start typing to find products";

  if (!open) {
    return null;
  }

  const submitSearch = (value = query) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    router.push(`/products?q=${encodeURIComponent(trimmed)}`);
    onClose();
  };

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search products">
      <div className="search-panel">
        {/* Header with Title & Close Icon (Matching Complete Your Order design) */}
        <div className="search-modal-header">
          <div className="search-modal-title-wrap">
            <Search className="search-modal-header-icon" size={20} aria-hidden="true" />
            <h2 className="search-modal-title">
              {language === "bn" ? "পণ্য অনুসন্ধান" : "Search Products"}
            </h2>
          </div>
          <button
            className="search-modal-close-btn"
            type="button"
            onClick={onClose}
            aria-label={t("close")}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Full-Line Product Search Bar */}
        <form
          className="search-form"
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch();
          }}
        >
          <div className="catalogue-search-wrap">
            <Search className="catalogue-search-icon" size={18} aria-hidden="true" />
            <label className="sr-only" htmlFor="modal-search-input">
              {t("search_products")}
            </label>
            <input
              id="modal-search-input"
              ref={inputRef}
              className="catalogue-search-field"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("search_placeholder")}
              aria-label={t("search_products")}
            />
            {hasQuery ? (
              <button
                className="catalogue-search-clear"
                type="button"
                onClick={() => setQuery("")}
                aria-label={language === "bn" ? "মুছুন" : "Clear"}
              >
                <X size={15} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </form>

        <div className="search-status" aria-live="polite">
          <span>{searchSummary}</span>
        </div>

        {hasQuery ? (
          results.length ? (
            <div className="search-results-list product-grid">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} onClick={onClose} />
              ))}
            </div>
          ) : (
            <div className="search-empty-state">
              <h2>{t("no_products_found")}</h2>
              <p className="page-lede">
                {language === "bn" ? "অন্য কোনো প্রোডাক্টের নাম, ক্যাটাগরি বা ব্র্যান্ড দিয়ে চেষ্টা করুন।" : "Try another product name, category, or feature."}
              </p>
            </div>
          )
        ) : (
          <div className="search-start-state">
            <Search size={32} aria-hidden="true" />
            <p>{language === "bn" ? "প্রোডাক্টের নাম, ক্যাটাগরি বা মডেল লিখে খুঁজুন।" : "Search by product title, category or feature."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
