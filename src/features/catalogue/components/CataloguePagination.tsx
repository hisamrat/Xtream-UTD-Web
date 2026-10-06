"use client";

import { useI18n } from "@/i18n/LanguageProvider";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { getVisiblePageNumbers } from "../lib/pagination";

type CataloguePaginationProps = {
  currentPage: number;
  pageCount: number;
  visibleStart: number;
  visibleEnd: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function CataloguePagination({
  currentPage,
  pageCount,
  visibleStart,
  visibleEnd,
  total,
  onPageChange
}: CataloguePaginationProps) {
  const { t, formatNumber } = useI18n();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const pages = getVisiblePageNumbers(currentPage, pageCount, isMobile ? 5 : 10);

  return (
    <nav className="catalogue-pagination" aria-label={t("catalogue.pagination.aria")}>
      <span className="pagination-summary">
        {t("catalogue.pagination.summary", { start: visibleStart, end: visibleEnd, total })}
      </span>
      <div className="pagination-controls">
        <button
          className="pagination-button"
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {t("catalogue.pagination.previous")}
        </button>
        {pages.map((page) => (
          <button
            className="pagination-button page-number"
            type="button"
            key={page}
            aria-current={currentPage === page ? "page" : undefined}
            onClick={() => onPageChange(page)}
          >
            {formatNumber(page)}
          </button>
        ))}
        <button
          className="pagination-button"
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          {t("catalogue.pagination.next")}
        </button>
      </div>
    </nav>
  );
}
