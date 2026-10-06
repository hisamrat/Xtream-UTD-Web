"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { formatPrice } from "@/domain/commerce/money";
import { type CatalogueFilters, countActiveFilters, getPriceRange } from "@/domain/product/catalogue-filter";
import { countByCategory, getCategories } from "@/domain/product/categories";
import type { ProductSummary } from "@/domain/product/product-summary";
import { ProductGrid } from "@/features/product/components/ProductGrid";
import { useI18n } from "@/i18n/LanguageProvider";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import { useCatalogueFilters } from "../hooks/useCatalogueFilters";
import { CatalogueHero } from "./CatalogueHero";
import { CategoryMenu, SortMenu } from "./CatalogueMenus";
import { CataloguePagination } from "./CataloguePagination";
import { FilterDrawer } from "./FilterDrawer";

type CatalogueViewProps = {
  products: ProductSummary[];
  initialFilters: CatalogueFilters;
};

export function CatalogueView({ products, initialFilters }: CatalogueViewProps) {
  const { t, tCategory, tStock, formatNumber } = useI18n();
  const productGridRef = useRef<HTMLDivElement>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const catalogue = useCatalogueFilters(products, initialFilters);
  const { filters, results, visibleProducts, pagination } = catalogue;

  const categories = useMemo(() => getCategories(products), [products]);
  const categoryCounts = useMemo(() => countByCategory(products), [products]);
  const priceRange = useMemo(() => getPriceRange(products), [products]);

  const activeFilterCount = countActiveFilters(filters);
  const selectedCategory = filters.categories?.length === 1 ? (filters.categories[0] ?? null) : null;

  const activeChips = [
    ...(filters.query ? [t("catalogue.chips.search", { query: filters.query })] : []),
    ...(filters.categories ?? []).map(tCategory),
    ...(filters.availability ?? []).map(tStock),
    ...(filters.newArrivals ? [t("catalogue.chips.newArrivals")] : []),
    ...(filters.bestSellers ? [t("catalogue.chips.bestSellers")] : []),
    ...(filters.discounted ? [t("catalogue.chips.discounted")] : []),
    ...(typeof filters.priceMin === "number" ? [t("catalogue.chips.from", { price: formatPrice(filters.priceMin) })] : []),
    ...(typeof filters.priceMax === "number" ? [t("catalogue.chips.upTo", { price: formatPrice(filters.priceMax) })] : [])
  ];

  const breadcrumbItems = selectedCategory
    ? [{ label: t("catalogue.breadcrumb.products"), href: "/products" }, { label: tCategory(selectedCategory) }]
    : filters.query
      ? [
          { label: t("catalogue.breadcrumb.products"), href: "/products" },
          { label: t("catalogue.breadcrumb.search", { query: filters.query }) }
        ]
      : [{ label: t("catalogue.breadcrumb.products") }];

  const goToPage = (page: number) => {
    pagination.goToPage(page);
    window.setTimeout(() => productGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
  };

  return (
    <section className="catalogue-page">
      <Breadcrumb homeLabel={t("nav.home")} ariaLabel={t("nav.breadcrumb")} items={breadcrumbItems} />

      <CatalogueHero query={filters.query} category={selectedCategory} />

      <div className="catalogue-toolbar-container">
        <div className="catalogue-toolbar" id="categories">
          <div className="catalogue-search-wrap" role="search">
            <Search size={18} className="catalogue-search-icon" aria-hidden="true" />
            <label className="sr-only" htmlFor="catalogue-search">
              {t("catalogue.search.label")}
            </label>
            <input
              id="catalogue-search"
              className="catalogue-search-field"
              value={filters.query ?? ""}
              onChange={(event) => catalogue.setFilter("query", event.target.value)}
              placeholder={t("catalogue.search.placeholder")}
            />
            {filters.query ? (
              <button
                className="catalogue-search-clear"
                type="button"
                onClick={() => catalogue.setFilter("query", "")}
                aria-label={t("catalogue.search.clear")}
              >
                <X size={15} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <CategoryMenu
            categories={categories}
            counts={categoryCounts}
            totalCount={products.length}
            selected={selectedCategory}
            onSelect={(category) => catalogue.updateFilters({ ...filters, categories: category ? [category] : undefined })}
          />

          <button
            className={`filter-trigger-btn ${activeFilterCount > 0 ? "has-active-filters" : ""}`}
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal size={15} className="filter-btn-icon" aria-hidden="true" />
            <span className="filter-btn-label">{t("catalogue.filters.button")}</span>
            <span className="filter-btn-end" aria-hidden={activeFilterCount === 0}>
              {activeFilterCount > 0 ? (
                <span className="filter-count-badge">{formatNumber(activeFilterCount)}</span>
              ) : (
                <span className="filter-btn-spacer" aria-hidden="true" />
              )}
            </span>
          </button>
        </div>

        <div className="catalogue-subbar">
          <span className="catalogue-count-text" aria-live="polite">
            {catalogue.isUpdating
              ? t("catalogue.count.updating")
              : t("catalogue.count.showing", {
                  start: pagination.visibleStart,
                  end: pagination.visibleEnd,
                  total: results.length
                })}
          </span>

          <SortMenu value={filters.sort ?? "newest"} onChange={(sort) => catalogue.setFilter("sort", sort)} />
        </div>
      </div>

      {activeChips.length ? (
        <div className="active-chips" aria-label={t("catalogue.chips.aria")}>
          {activeChips.map((chip) => (
            <span className="active-chip" key={chip}>
              {chip}
            </span>
          ))}
          <button className="active-chip clear-all-chip" type="button" onClick={catalogue.clearFilters}>
            {t("catalogue.chips.clearAll")} <X size={13} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        priceRange={priceRange}
        resultCount={results.length}
        onAvailabilityToggle={catalogue.toggleAvailability}
        onBooleanToggle={(key) => catalogue.setFilter(key, !filters[key])}
        onPriceMin={(value) => catalogue.setFilter("priceMin", value)}
        onPriceMax={(value) => catalogue.setFilter("priceMax", value)}
        onClear={catalogue.clearFilters}
      />

      {results.length ? (
        <>
          <div ref={productGridRef} className="catalogue-results">
            <ProductGrid products={visibleProducts} />
          </div>
          {pagination.pageCount > 1 ? (
            <CataloguePagination
              currentPage={pagination.currentPage}
              pageCount={pagination.pageCount}
              visibleStart={pagination.visibleStart}
              visibleEnd={pagination.visibleEnd}
              total={results.length}
              onPageChange={goToPage}
            />
          ) : null}
        </>
      ) : (
        <div className="no-results">
          <div className="no-results-inner">
            <div className="no-results-icon">
              <Search size={58} aria-hidden="true" />
            </div>
            <h2>{t("catalogue.empty.title")}</h2>
            <p className="page-lede">{t("catalogue.empty.lede")}</p>
            <div className="inline-action-row">
              <button className="button light" type="button" onClick={() => catalogue.setFilter("query", "")}>
                {t("catalogue.empty.clearSearch")}
              </button>
              <button className="button primary" type="button" onClick={catalogue.clearFilters}>
                {t("catalogue.empty.viewAll")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
