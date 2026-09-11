"use client";

import { ArrowUpDown, Check, ChevronDown, LayoutGrid, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { formatPrice } from "@/lib/format";
import type { Product, StockStatus } from "@/lib/product-schema";
import {
  type CatalogueFilters,
  type SortKey,
  filterProducts,
  getCategories,
  getPriceRange,
  stockStatuses
} from "@/lib/products";
import { useLanguage } from "@/components/site/LanguageProvider";
import { Breadcrumb } from "@/components/site/Breadcrumb";

type CatalogueClientProps = {
  products: Product[];
  initialFilters: CatalogueFilters;
};

const sortOptions: Array<{ label: string; value: SortKey }> = [
  { label: "Featured", value: "featured" },
  { label: "Newest first", value: "newest" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Title (A-Z)", value: "title" }
];

const pricePresets = [
  { label: "Under ৳10,000", min: undefined, max: 10000 },
  { label: "৳10,000 - ৳30,000", min: 10000, max: 30000 },
  { label: "৳30,000 - ৳60,000", min: 30000, max: 60000 },
  { label: "Over ৳60,000", min: 60000, max: undefined }
];

const productsPerPage = 12;

function getVisiblePaginationPages(
  currentPage: number,
  pageCount: number,
  maxVisible: number
): number[] {
  if (pageCount <= maxVisible) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = currentPage - half;
  let end = start + maxVisible - 1;

  if (start < 1) {
    start = 1;
    end = maxVisible;
  }

  if (end > pageCount) {
    end = pageCount;
    start = Math.max(1, pageCount - maxVisible + 1);
  }

  const pages: number[] = [];
  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }
  return pages;
}

export function CatalogueClient({ products, initialFilters }: CatalogueClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, formatNumber, tCategory } = useLanguage();
  const productGridRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [filters, setFilters] = useState<CatalogueFilters>({
    sort: "featured",
    ...initialFilters
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateMobile = () => setIsMobile(mediaQuery.matches);
    updateMobile();
    mediaQuery.addEventListener("change", updateMobile);
    return () => mediaQuery.removeEventListener("change", updateMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const categories = useMemo(() => getCategories(), []);
  const priceRange = useMemo(() => getPriceRange(products), [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [products]);

  const deferredFilters = useDeferredValue(filters);
  const results = useMemo(() => filterProducts(products, deferredFilters), [deferredFilters, products]);
  const activeChips = buildActiveChips(filters);
  const activeFilterCount =
    (filters.categories?.length ?? 0) +
    (filters.availability?.length ?? 0) +
    (filters.newArrivals ? 1 : 0) +
    (filters.bestSellers ? 1 : 0) +
    (filters.discounted ? 1 : 0) +
    (typeof filters.priceMin === "number" || typeof filters.priceMax === "number" ? 1 : 0);
  const updatingResults = isPending || deferredFilters !== filters;
  const pageCount = Math.max(1, Math.ceil(results.length / productsPerPage));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const pageStart = (safeCurrentPage - 1) * productsPerPage;
  const visibleProducts = results.slice(pageStart, pageStart + productsPerPage);
  const visibleStart = results.length ? pageStart + 1 : 0;
  const visibleEnd = Math.min(pageStart + visibleProducts.length, results.length);

  const selectedCategory = filters.categories && filters.categories.length === 1 ? filters.categories[0] : null;
  const currentSortOption = sortOptions.find((opt) => opt.value === filters.sort) ?? sortOptions[0];

  const maxVisiblePages = isMobile ? 5 : 10;
  const visiblePageNumbers = useMemo(
    () => getVisiblePaginationPages(safeCurrentPage, pageCount, maxVisiblePages),
    [safeCurrentPage, pageCount, maxVisiblePages]
  );

  useEffect(() => {
    document.body.classList.toggle("modal-open", filtersOpen || mobileFiltersOpen);
    return () => document.body.classList.remove("modal-open");
  }, [filtersOpen, mobileFiltersOpen]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount));
  }, [pageCount]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFiltersOpen(false);
        setMobileFiltersOpen(false);
        setCategoryDropdownOpen(false);
        setSortDropdownOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const updateFilters = (nextFilters: CatalogueFilters) => {
    setCurrentPage(1);
    setFilters(nextFilters);
    startTransition(() => {
      router.replace(`${pathname}${toQueryString(nextFilters)}`, { scroll: false });
    });
  };

  const goToPage = (page: number) => {
    const nextPage = Math.min(pageCount, Math.max(1, page));
    setCurrentPage(nextPage);
    window.setTimeout(() => productGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
  };

  const setFilterValue = <Key extends keyof CatalogueFilters>(
    key: Key,
    value: CatalogueFilters[Key]
  ) => updateFilters({ ...filters, [key]: value });

  const toggleCategory = (category: string) => {
    const current = new Set(filters.categories ?? []);
    if (current.has(category)) {
      current.delete(category);
    } else {
      current.add(category);
    }
    updateFilters({ ...filters, categories: Array.from(current) });
  };

  const toggleAvailability = (stock: StockStatus) => {
    const current = new Set(filters.availability ?? []);
    if (current.has(stock)) {
      current.delete(stock);
    } else {
      current.add(stock);
    }
    updateFilters({ ...filters, availability: Array.from(current) });
  };

  const clearFilters = () => {
    updateFilters({ sort: "featured" });
  };

  const filterPanel = (
    <FilterPanel
      categories={categories}
      categoryCounts={categoryCounts}
      priceRange={priceRange}
      filters={filters}
      resultCount={results.length}
      onCategoryToggle={toggleCategory}
      onAvailabilityToggle={toggleAvailability}
      onBooleanToggle={(key) => setFilterValue(key, !filters[key])}
      onSort={(sort) => setFilterValue("sort", sort)}
      onPriceMin={(value) => setFilterValue("priceMin", value)}
      onPriceMax={(value) => setFilterValue("priceMax", value)}
      onClear={clearFilters}
      onApply={() => {
        setFiltersOpen(false);
        setMobileFiltersOpen(false);
      }}
    />
  );

  return (
    <section className="catalogue-page">
      <Breadcrumb
        items={
          filters.categories && filters.categories.length === 1
            ? [
                { label: language === "bn" ? "প্রোডাক্টস" : "Products", href: "/products" },
                { label: filters.categories[0] }
              ]
            : filters.query
            ? [
                { label: language === "bn" ? "প্রোডাক্টস" : "Products", href: "/products" },
                { label: `${language === "bn" ? "অনুসন্ধান" : "Search"}: ${filters.query}` }
              ]
            : [{ label: language === "bn" ? "প্রোডাক্টস" : "Products" }]
        }
      />

      <div className="catalogue-hero">
        <h1 className="page-title">
          {filters.query
            ? (language === "bn" ? "অনুসন্ধান ফলাফল" : "Search results")
            : (language === "bn" ? "প্রোডাক্টস" : "Products")}
        </h1>
        {filters.query ? (
          <p className="page-lede">
            {language === "bn" ? `"${filters.query}" এর জন্য ফলাফল` : `Results for “${filters.query}”`}
          </p>
        ) : null}
      </div>

      <div className="catalogue-toolbar-container">
        {/* Main Search & Quick Filter Toolbar */}
        <div className="catalogue-toolbar" id="categories">
          {/* Large Expanded Search Bar */}
          <div className="catalogue-search-wrap">
            <Search size={18} className="catalogue-search-icon" aria-hidden="true" />
            <label className="sr-only" htmlFor="catalogue-search">
              {language === "bn" ? "পণ্য খুঁজুন" : "Search products"}
            </label>
            <input
              id="catalogue-search"
              className="catalogue-search-field"
              value={filters.query ?? ""}
              onChange={(event) => setFilterValue("query", event.target.value)}
              placeholder={
                language === "bn"
                  ? "নাম, ব্র্যান্ড বা মডেল দিয়ে পণ্য খুঁজুন..."
                  : "Search products by name, brand, or model..."
              }
            />
            {filters.query ? (
              <button
                className="catalogue-search-clear"
                type="button"
                onClick={() => setFilterValue("query", "")}
                aria-label="Clear search query"
              >
                <X size={15} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          {/* Category Dropdown Selector */}
          <div className="catalogue-dropdown-wrap" ref={categoryMenuRef}>
            <button
              type="button"
              className={`catalogue-dropdown-btn ${selectedCategory ? "is-active" : ""}`}
              onClick={() => setCategoryDropdownOpen((open) => !open)}
              aria-expanded={categoryDropdownOpen}
              aria-haspopup="listbox"
            >
              <LayoutGrid size={16} aria-hidden="true" />
              <span className="dropdown-btn-label">
                {selectedCategory ? tCategory(selectedCategory) : (language === "bn" ? "ক্যাটাগরি" : "Category")}
              </span>
              <ChevronDown size={14} className={`dropdown-chevron ${categoryDropdownOpen ? "is-open" : ""}`} aria-hidden="true" />
            </button>

            {categoryDropdownOpen ? (
              <div className="catalogue-dropdown-menu" role="listbox">
                <button
                  type="button"
                  className={`dropdown-menu-item ${!selectedCategory ? "is-selected" : ""}`}
                  onClick={() => {
                    updateFilters({ ...filters, categories: undefined });
                    setCategoryDropdownOpen(false);
                  }}
                  role="option"
                  aria-selected={!selectedCategory}
                >
                  <span>{language === "bn" ? "সকল ক্যাটাগরি" : "All Categories"}</span>
                  <span className="dropdown-item-count">{products.length}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`dropdown-menu-item ${selectedCategory === cat ? "is-selected" : ""}`}
                    onClick={() => {
                      updateFilters({ ...filters, categories: [cat] });
                      setCategoryDropdownOpen(false);
                    }}
                    role="option"
                    aria-selected={selectedCategory === cat}
                  >
                    <span>{tCategory(cat)}</span>
                    <span className="dropdown-item-count">{categoryCounts[cat] || 0}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Comprehensive Filters Button */}
          <button
            className={`filter-trigger-btn ${activeFilterCount > 0 ? "has-active-filters" : ""}`}
            type="button"
            onClick={() => {
              if (isMobile) {
                setMobileFiltersOpen(true);
              } else {
                setFiltersOpen((open) => !open);
              }
            }}
            aria-expanded={filtersOpen || mobileFiltersOpen}
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            <span>{language === "bn" ? "ফিল্টার" : "Filters"}</span>
            {activeFilterCount > 0 ? (
              <span className="filter-count-badge">{formatNumber(activeFilterCount)}</span>
            ) : null}
          </button>
        </div>

        {/* Secondary Subbar: Products Count (Left) & Sort By Dropdown (Right) */}
        <div className="catalogue-subbar">
          <span className="catalogue-count-text">
            {updatingResults
              ? (language === "bn" ? "আপডেট হচ্ছে..." : "Updating...")
              : (language === "bn"
                  ? `${formatNumber(results.length)}টি পণ্যের মধ্যে ${formatNumber(visibleStart)}–${formatNumber(visibleEnd)} দেখাচ্ছে`
                  : `Showing ${visibleStart}–${visibleEnd} of ${results.length} products`)}
          </span>

          <div className="catalogue-sort-wrap" ref={sortMenuRef}>
            <button
              type="button"
              className="catalogue-sort-btn"
              onClick={() => setSortDropdownOpen((open) => !open)}
              aria-expanded={sortDropdownOpen}
              aria-haspopup="listbox"
            >
              <ArrowUpDown size={14} aria-hidden="true" />
              <span>
                {language === "bn" ? "সর্ট:" : "Sort by:"} <strong>{currentSortOption.label}</strong>
              </span>
              <ChevronDown size={14} className={`dropdown-chevron ${sortDropdownOpen ? "is-open" : ""}`} aria-hidden="true" />
            </button>

            {sortDropdownOpen ? (
              <div className="catalogue-dropdown-menu sort-menu" role="listbox">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`dropdown-menu-item ${filters.sort === opt.value ? "is-selected" : ""}`}
                    onClick={() => {
                      setFilterValue("sort", opt.value);
                      setSortDropdownOpen(false);
                    }}
                    role="option"
                    aria-selected={filters.sort === opt.value}
                  >
                    <span>{opt.label}</span>
                    {filters.sort === opt.value ? <Check size={14} aria-hidden="true" /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {activeChips.length ? (
        <div className="active-chips" aria-label="Active filters">
          {activeChips.map((chip) => (
            <span className="active-chip" key={chip}>
              {chip}
            </span>
          ))}
          <button className="active-chip clear-all-chip" type="button" onClick={clearFilters}>
            Clear all <X size={13} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {filtersOpen ? (
        <div className="filter-backdrop desktop-filter" role="dialog" aria-modal="true" aria-label="Filter products">
          <button
            className="filter-scrim"
            type="button"
            onClick={() => setFiltersOpen(false)}
            aria-label="Close filters"
          />
          <div className="filter-drawer panel">{filterPanel}</div>
        </div>
      ) : null}

      {results.length ? (
        <>
          <div ref={productGridRef} className="catalogue-results">
            <ProductGrid products={visibleProducts} />
          </div>
          {pageCount > 1 ? (
            <nav className="catalogue-pagination" aria-label="Product catalogue pages">
              <span className="pagination-summary">
                {language === "bn"
                  ? `${formatNumber(results.length)}টির মধ্যে ${formatNumber(visibleStart)}-${formatNumber(visibleEnd)} দেখাচ্ছে`
                  : `Showing ${visibleStart}-${visibleEnd} of ${results.length}`}
              </span>
              <div className="pagination-controls">
                <button
                  className="pagination-button"
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={safeCurrentPage === 1}
                >
                  {language === "bn" ? "আগের" : "Previous"}
                </button>
                {visiblePageNumbers.map((page) => (
                  <button
                    className="pagination-button page-number"
                    type="button"
                    key={page}
                    aria-current={safeCurrentPage === page ? "page" : undefined}
                    onClick={() => goToPage(page)}
                  >
                    {formatNumber(page)}
                  </button>
                ))}
                <button
                  className="pagination-button"
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={safeCurrentPage === pageCount}
                >
                  {language === "bn" ? "পরের" : "Next"}
                </button>
              </div>
            </nav>
          ) : null}
        </>
      ) : (
        <div className="no-results">
          <div className="no-results-inner">
            <div className="no-results-icon">
              <Search size={58} aria-hidden="true" />
            </div>
            <h2>No products match your search.</h2>
            <p className="page-lede">Try another phrase or clear the current filters.</p>
            <div className="inline-action-row">
              <button className="pill-button light" type="button" onClick={() => setFilterValue("query", "")}>
                Clear Search
              </button>
              <button className="pill-button primary" type="button" onClick={clearFilters}>
                {language === "bn" ? "সকল প্রোডাক্ট দেখুন" : "View Products"}
              </button>
            </div>
          </div>
        </div>
      )}

      {mobileFiltersOpen ? (
        <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-label="Filter products">
          <div className="sheet-panel">
            <div className="sheet-handle" />
            {filterPanel}
          </div>
        </div>
      ) : null}
    </section>
  );
}

type BooleanFilterKey = "newArrivals" | "bestSellers" | "discounted";

type FilterPanelProps = {
  categories: string[];
  categoryCounts: Record<string, number>;
  priceRange: { min: number; max: number };
  filters: CatalogueFilters;
  resultCount: number;
  onCategoryToggle: (category: string) => void;
  onAvailabilityToggle: (stock: StockStatus) => void;
  onBooleanToggle: (key: BooleanFilterKey) => void;
  onSort: (sort: SortKey) => void;
  onPriceMin: (value: number | undefined) => void;
  onPriceMax: (value: number | undefined) => void;
  onClear: () => void;
  onApply: () => void;
};

function FilterPanel({
  categories,
  categoryCounts,
  priceRange,
  filters,
  resultCount,
  onCategoryToggle,
  onAvailabilityToggle,
  onBooleanToggle,
  onSort,
  onPriceMin,
  onPriceMax,
  onClear,
  onApply
}: FilterPanelProps) {
  return (
    <>
      <div className="filter-panel-header">
        <p className="section-kicker">Filter products</p>
        <h2 className="filter-title">Find the right product quickly</h2>
        <p className="filter-match">{resultCount} products match</p>
      </div>

      <div className="filter-section">
        <span className="filter-heading">Quick Highlights</span>
        <div className="filter-grid">
          <button
            className="filter-choice"
            type="button"
            aria-pressed={filters.newArrivals ?? false}
            onClick={() => onBooleanToggle("newArrivals")}
          >
            🔥 New Arrivals
          </button>
          <button
            className="filter-choice"
            type="button"
            aria-pressed={filters.bestSellers ?? false}
            onClick={() => onBooleanToggle("bestSellers")}
          >
            ⭐ Best Sellers
          </button>
          <button
            className="filter-choice"
            type="button"
            aria-pressed={filters.discounted ?? false}
            onClick={() => onBooleanToggle("discounted")}
          >
            🏷️ Discounted Deals
          </button>
        </div>
      </div>

      <div className="filter-section">
        <span className="filter-heading">Category</span>
        <div className="filter-grid">
          {categories.map((category) => (
            <button
              key={category}
              className="filter-choice"
              type="button"
              aria-pressed={filters.categories?.includes(category) ?? false}
              onClick={() => onCategoryToggle(category)}
            >
              <span>{category}</span>
              <span className="filter-badge-count">{categoryCounts[category] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <span className="filter-heading">Availability</span>
        <div className="filter-grid">
          {stockStatuses.map((stock) => (
            <button
              key={stock}
              className="filter-choice"
              type="button"
              aria-pressed={filters.availability?.includes(stock) ?? false}
              onClick={() => onAvailabilityToggle(stock)}
            >
              <span>{stock}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <span className="filter-heading">Price Quick Presets</span>
        <div className="filter-grid">
          {pricePresets.map((preset) => {
            const isSelected = filters.priceMin === preset.min && filters.priceMax === preset.max;
            return (
              <button
                key={preset.label}
                className="filter-choice"
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  if (isSelected) {
                    onPriceMin(undefined);
                    onPriceMax(undefined);
                  } else {
                    onPriceMin(preset.min);
                    onPriceMax(preset.max);
                  }
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-section">
        <span className="filter-heading">Price Range (BDT ৳)</span>
        <div className="filter-grid">
          <label className="field-label">
            Minimum (৳)
            <input
              className="field"
              type="number"
              min={priceRange.min}
              max={priceRange.max}
              value={filters.priceMin ?? ""}
              placeholder={formatPrice(priceRange.min)}
              onChange={(event) => onPriceMin(event.target.value ? Number(event.target.value) : undefined)}
            />
          </label>
          <label className="field-label">
            Maximum (৳)
            <input
              className="field"
              type="number"
              min={priceRange.min}
              max={priceRange.max}
              value={filters.priceMax ?? ""}
              placeholder={formatPrice(priceRange.max)}
              onChange={(event) => onPriceMax(event.target.value ? Number(event.target.value) : undefined)}
            />
          </label>
        </div>
      </div>

      <div className="filter-section">
        <span className="filter-heading">Sort Order</span>
        <div className="filter-grid">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              className="filter-choice"
              type="button"
              aria-pressed={(filters.sort ?? "newest") === option.value}
              onClick={() => onSort(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-actions">
        <button className="pill-button filter-clear-btn" type="button" onClick={onClear}>
          Clear all
        </button>
        <button className="pill-button primary filter-apply-btn" type="button" onClick={onApply}>
          Apply Filters ({resultCount})
        </button>
      </div>
    </>
  );
}

function buildActiveChips(filters: CatalogueFilters): string[] {
  return [
    ...(filters.query ? [`Search: ${filters.query}`] : []),
    ...(filters.categories ?? []),
    ...(filters.availability ?? []),
    ...(filters.newArrivals ? ["New Arrivals"] : []),
    ...(filters.bestSellers ? ["Best Sellers"] : []),
    ...(filters.discounted ? ["Discounted"] : []),
    ...(typeof filters.priceMin === "number" ? [`From ${formatPrice(filters.priceMin)}`] : []),
    ...(typeof filters.priceMax === "number" ? [`Up to ${formatPrice(filters.priceMax)}`] : [])
  ];
}

function toQueryString(filters: CatalogueFilters): string {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set("q", filters.query);
  }
  if (filters.categories?.length) {
    params.set("category", filters.categories.join(","));
  }
  if (filters.availability?.length) {
    params.set("stock", filters.availability.join(","));
  }
  if (typeof filters.priceMin === "number") {
    params.set("min", String(filters.priceMin));
  }
  if (typeof filters.priceMax === "number") {
    params.set("max", String(filters.priceMax));
  }
  if (filters.newArrivals) {
    params.set("new", "1");
  }
  if (filters.bestSellers) {
    params.set("best", "1");
  }
  if (filters.discounted) {
    params.set("discount", "1");
  }
  if (filters.sort && filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
