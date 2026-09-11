"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useLanguage } from "@/components/site/LanguageProvider";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const { language } = useLanguage();
  const homeLabel = language === "bn" ? "হোম" : "Home";

  return (
    <nav className={`page-breadcrumbs ${className}`.trim()} aria-label="Breadcrumb navigation">
      <Link href="/" className="breadcrumb-item" title={homeLabel}>
        <Home size={14} aria-hidden="true" />
        <span>{homeLabel}</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="breadcrumb-segment">
            <ChevronRight size={13} className="breadcrumb-separator" aria-hidden="true" />
            {isLast || !item.href ? (
              <span className="breadcrumb-current" aria-current={isLast ? "page" : undefined}>
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="breadcrumb-item">
                <span>{item.label}</span>
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

