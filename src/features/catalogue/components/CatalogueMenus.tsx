"use client";

import { ArrowUpDown, Check, ChevronDown, LayoutGrid } from "lucide-react";
import { useRef, useState } from "react";
import { type SortKey, sortKeys } from "@/domain/product/catalogue-filter";
import { useI18n } from "@/i18n/LanguageProvider";
import { useDismissOnOutside } from "@/shared/hooks/useDismissOnOutside";

type CategoryMenuProps = {
  categories: string[];
  counts: Record<string, number>;
  totalCount: number;
  selected: string | null;
  onSelect: (category: string | null) => void;
};

export function CategoryMenu({ categories, counts, totalCount, selected, onSelect }: CategoryMenuProps) {
  const { t, tCategory } = useI18n();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useDismissOnOutside(menuRef, open, () => setOpen(false));

  const choose = (category: string | null) => {
    onSelect(category);
    setOpen(false);
  };

  return (
    <div className="catalogue-dropdown-wrap" ref={menuRef}>
      <button
        type="button"
        className={`catalogue-dropdown-btn ${selected ? "is-active" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <LayoutGrid size={16} aria-hidden="true" />
        <span className="dropdown-btn-label">{selected ? tCategory(selected) : t("catalogue.category.button")}</span>
        <ChevronDown size={14} className={`dropdown-chevron ${open ? "is-open" : ""}`} aria-hidden="true" />
      </button>

      {open ? (
        <div className="catalogue-dropdown-menu" role="listbox">
          <button
            type="button"
            className={`dropdown-menu-item ${!selected ? "is-selected" : ""}`}
            onClick={() => choose(null)}
            role="option"
            aria-selected={!selected}
          >
            <span>{t("catalogue.category.all")}</span>
            <span className="dropdown-item-count">{totalCount}</span>
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`dropdown-menu-item ${selected === category ? "is-selected" : ""}`}
              onClick={() => choose(category)}
              role="option"
              aria-selected={selected === category}
            >
              <span>{tCategory(category)}</span>
              <span className="dropdown-item-count">{counts[category] ?? 0}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type SortMenuProps = {
  value: SortKey;
  onChange: (sort: SortKey) => void;
};

export function SortMenu({ value, onChange }: SortMenuProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useDismissOnOutside(menuRef, open, () => setOpen(false));

  return (
    <div className="catalogue-sort-wrap" ref={menuRef}>
      <button
        type="button"
        className="catalogue-sort-btn"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <ArrowUpDown size={14} aria-hidden="true" />
        <span>
          {t("catalogue.sort.label")} <strong>{t(`catalogue.sort.${value}`)}</strong>
        </span>
        <ChevronDown size={14} className={`dropdown-chevron ${open ? "is-open" : ""}`} aria-hidden="true" />
      </button>

      {open ? (
        <div className="catalogue-dropdown-menu sort-menu" role="listbox">
          {sortKeys.map((option) => (
            <button
              key={option}
              type="button"
              className={`dropdown-menu-item ${value === option ? "is-selected" : ""}`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              role="option"
              aria-selected={value === option}
            >
              <span>{t(`catalogue.sort.${option}`)}</span>
              {value === option ? <Check size={14} aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
