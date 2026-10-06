"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProductSummary } from "@/domain/product/product-summary";
import { ProductCard } from "@/features/product/components/ProductCard";
import { useI18n } from "@/i18n/LanguageProvider";

const TOP_SELLING_COUNT = 3;

/** Best sellers first, topped up with other products when there are fewer than three. */
export function pickTopSelling(products: readonly ProductSummary[], count = TOP_SELLING_COUNT): ProductSummary[] {
  const bestSellers = products.filter((product) => product.best_seller);
  const others = products.filter((product) => !product.best_seller);
  return [...bestSellers, ...others].slice(0, count);
}

export function TopSelling({ products }: { products: ProductSummary[] }) {
  const { t } = useI18n();

  return (
    <section className="explore-section-block explore-top-selling-section" aria-labelledby="top-selling-heading">
      <div className="explore-section-header">
        <div className="explore-section-header-left">
          <span className="explore-section-kicker">{t("showcase.topSelling.kicker")}</span>
          <h2 id="top-selling-heading" className="explore-section-title">
            {t("showcase.topSelling.title")}
          </h2>
        </div>
        <Link href="/products" className="explore-shop-all-link" aria-label={t("showcase.topSelling.shopAllAria")}>
          <span>{t("action.shopAll")}</span>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <div className="explore-products-grid">
        {pickTopSelling(products).map((product) => (
          <ProductCard key={`top-selling-${product.id}`} product={product} />
        ))}
      </div>
    </section>
  );
}
