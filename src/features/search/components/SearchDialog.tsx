"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { filterProducts } from "@/domain/product/catalogue-filter";
import type { ProductSummary } from "@/domain/product/product-summary";
import { ProductGrid } from "@/features/product/components/ProductGrid";
import { useI18n } from "@/i18n/LanguageProvider";
import { useDialog } from "@/shared/hooks/useDialog";

type SearchDialogProps = Readonly<{
  products: ProductSummary[];
  open: boolean;
  onClose: () => void;
}>;

const MAX_SUGGESTIONS = 3;

export function SearchDialog({ products, open, onClose }: SearchDialogProps) {
  const router = useRouter();
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useDialog({ open, onClose, initialFocusRef: inputRef });
  const [query, setQuery] = useState("");

  const trimmedQuery = query.trim();
  const results = useMemo(
    () =>
      trimmedQuery ? filterProducts(products, { query: trimmedQuery, sort: "featured" }).slice(0, MAX_SUGGESTIONS) : [],
    [products, trimmedQuery]
  );

  if (!open) {
    return null;
  }

  const submitSearch = () => {
    if (!trimmedQuery) return;
    router.push(`/products?q=${encodeURIComponent(trimmedQuery)}`);
    onClose();
  };

  return (
    <div ref={dialogRef} className="search-overlay" role="dialog" aria-modal="true" aria-label={t("shell.search.dialogAria")}>
      <div className="search-panel">
        <div className="search-modal-header">
          <div className="search-modal-title-wrap">
            <h2 className="search-modal-title">{t("shell.search.title")}</h2>
          </div>
          <button className="search-modal-close-btn" type="button" onClick={onClose} aria-label={t("action.close")}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form
          className="search-form"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch();
          }}
        >
          <div className="catalogue-search-wrap">
            <Search className="catalogue-search-icon" size={18} aria-hidden="true" />
            <label className="sr-only" htmlFor="modal-search-input">
              {t("label.searchProducts")}
            </label>
            <input
              id="modal-search-input"
              ref={inputRef}
              className="catalogue-search-field"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("shell.search.placeholder")}
            />
            {trimmedQuery ? (
              <button className="catalogue-search-clear" type="button" onClick={() => setQuery("")} aria-label={t("action.clear")}>
                <X size={15} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </form>

        <div className="search-status" aria-live="polite">
          <span>{trimmedQuery ? t("shell.search.suggested", { count: results.length }) : t("shell.search.start")}</span>
        </div>

        {trimmedQuery ? (
          results.length ? (
            <ProductGrid className="search-results-list product-grid" products={results} onProductClick={onClose} />
          ) : (
            <div className="search-empty-state">
              <h2>{t("shell.search.noResults")}</h2>
              <p className="page-lede">{t("shell.search.noResultsHint")}</p>
            </div>
          )
        ) : (
          <div className="search-start-state">
            <Search size={32} aria-hidden="true" />
            <p>{t("shell.search.startHint")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
