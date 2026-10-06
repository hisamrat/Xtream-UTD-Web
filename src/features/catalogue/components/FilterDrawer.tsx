"use client";

import { X } from "lucide-react";
import type { BooleanFilterKey, CatalogueFilters } from "@/domain/product/catalogue-filter";
import { type StockStatus, stockStatuses } from "@/domain/product/product-schema";
import type { TranslationKey } from "@/i18n/dictionary";
import { useI18n } from "@/i18n/LanguageProvider";
import { useDialog } from "@/shared/hooks/useDialog";

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  filters: CatalogueFilters;
  priceRange: { min: number; max: number };
  resultCount: number;
  onAvailabilityToggle: (stock: StockStatus) => void;
  onBooleanToggle: (key: BooleanFilterKey) => void;
  onPriceMin: (value: number | undefined) => void;
  onPriceMax: (value: number | undefined) => void;
  onClear: () => void;
};

const highlights: { key: BooleanFilterKey; icon: string; label: TranslationKey }[] = [
  { key: "newArrivals", icon: "🔥", label: "catalogue.drawer.newArrivals" },
  { key: "bestSellers", icon: "⭐", label: "catalogue.drawer.bestSellers" },
  { key: "discounted", icon: "🏷️", label: "catalogue.drawer.discounted" }
];

function toOptionalNumber(value: string): number | undefined {
  return value ? Number(value) : undefined;
}

export function FilterDrawer({
  open,
  onClose,
  filters,
  priceRange,
  resultCount,
  onAvailabilityToggle,
  onBooleanToggle,
  onPriceMin,
  onPriceMax,
  onClear
}: FilterDrawerProps) {
  const { t, tStock } = useI18n();
  const dialogRef = useDialog({ open, onClose });

  if (!open) return null;

  return (
    <div ref={dialogRef} className="filter-backdrop" role="dialog" aria-modal="true" aria-label={t("catalogue.drawer.aria")}>
      <button className="filter-scrim" type="button" onClick={onClose} aria-label={t("catalogue.drawer.close")} tabIndex={-1} />
      <div className="filter-drawer panel">
        <div className="filter-panel-header">
          <h2 className="filter-modal-title">{t("catalogue.drawer.title")}</h2>
          <button
            type="button"
            className="filter-close-btn"
            onClick={onClose}
            aria-label={t("catalogue.drawer.close")}
            title={t("catalogue.drawer.close")}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="filter-section">
          <span className="filter-heading">{t("catalogue.drawer.highlights")}</span>
          <div className="filter-grid filter-grid-3">
            {highlights.map((highlight) => (
              <button
                key={highlight.key}
                className="filter-choice filter-choice-stacked"
                type="button"
                aria-pressed={filters[highlight.key] ?? false}
                onClick={() => onBooleanToggle(highlight.key)}
              >
                <span className="filter-choice-icon" aria-hidden="true">
                  {highlight.icon}
                </span>
                <span className="filter-choice-text">{t(highlight.label)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <span className="filter-heading">{t("catalogue.drawer.availability")}</span>
          <div className="filter-grid filter-grid-3">
            {stockStatuses.map((stock) => (
              <button
                key={stock}
                className="filter-choice"
                type="button"
                aria-pressed={filters.availability?.includes(stock) ?? false}
                onClick={() => onAvailabilityToggle(stock)}
              >
                <span>{tStock(stock)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <span className="filter-heading">{t("catalogue.drawer.priceRange")}</span>
          <div className="filter-grid filter-grid-2">
            <label className="filter-field-label">
              <span className="filter-field-title">{t("catalogue.drawer.minimum")}</span>
              <div className="filter-input-wrap">
                <span className="filter-currency-symbol" aria-hidden="true">
                  ৳
                </span>
                <input
                  className="filter-number-input"
                  type="number"
                  inputMode="numeric"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={filters.priceMin ?? ""}
                  placeholder={String(priceRange.min)}
                  onChange={(event) => onPriceMin(toOptionalNumber(event.target.value))}
                />
              </div>
            </label>
            <label className="filter-field-label">
              <span className="filter-field-title">{t("catalogue.drawer.maximum")}</span>
              <div className="filter-input-wrap">
                <span className="filter-currency-symbol" aria-hidden="true">
                  ৳
                </span>
                <input
                  className="filter-number-input"
                  type="number"
                  inputMode="numeric"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={filters.priceMax ?? ""}
                  placeholder={String(priceRange.max)}
                  onChange={(event) => onPriceMax(toOptionalNumber(event.target.value))}
                />
              </div>
            </label>
          </div>
        </div>

        <div className="filter-actions">
          <button className="filter-clear-btn" type="button" onClick={onClear}>
            {t("catalogue.drawer.clear")}
          </button>
          <button className="filter-apply-btn" type="button" onClick={onClose}>
            {t("catalogue.drawer.apply", { count: resultCount })}
          </button>
        </div>
      </div>
    </div>
  );
}
