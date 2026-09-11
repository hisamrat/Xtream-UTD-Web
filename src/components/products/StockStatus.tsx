"use client";

import type { StockStatus as StockStatusType } from "@/lib/product-schema";
import { useLanguage } from "@/components/site/LanguageProvider";

type StockStatusProps = {
  stock: StockStatusType;
  dotOnly?: boolean;
};

export function StockStatus({ stock, dotOnly = false }: StockStatusProps) {
  const { tStock } = useLanguage();
  const statusClass =
    stock === "Low stock" ? "stock-low" : stock === "Out of stock" ? "stock-out" : "stock-in";

  if (dotOnly) {
    return (
      <span
        className={`stock-indicator-dot ${statusClass}`}
        title={tStock(stock)}
        aria-label={tStock(stock)}
      />
    );
  }

  return (
    <span className={`stock-badge ${statusClass}`}>
      <span className="stock-dot" aria-hidden="true" />
      <span className="stock-text">{tStock(stock)}</span>
    </span>
  );
}
