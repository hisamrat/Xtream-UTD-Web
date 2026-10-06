"use client";

import type { StockStatus } from "@/domain/product/product-schema";
import { useI18n } from "@/i18n/LanguageProvider";

const statusClass: Record<StockStatus, string> = {
  "In stock": "stock-in",
  "Low stock": "stock-low",
  "Out of stock": "stock-out"
};

export function StockBadge({ stock }: { stock: StockStatus }) {
  const { tStock } = useI18n();

  return (
    <span className={`stock-badge ${statusClass[stock]}`}>
      <span className="stock-dot" aria-hidden="true" />
      <span className="stock-text">{tStock(stock)}</span>
    </span>
  );
}
