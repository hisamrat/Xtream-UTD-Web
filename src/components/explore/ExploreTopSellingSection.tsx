"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/product-schema";
import { useLanguage } from "@/components/site/LanguageProvider";
import { ProductCard } from "@/components/products/ProductCard";

type ExploreTopSellingSectionProps = {
  products: Product[];
};

export function ExploreTopSellingSection({ products }: ExploreTopSellingSectionProps) {
  const { t } = useLanguage();

  // Pick top 3 products (preferring best sellers)
  const topProducts = (() => {
    const bestSellers = products.filter((p) => p.best_seller);
    if (bestSellers.length >= 3) {
      return bestSellers.slice(0, 3);
    }
    const remainder = products.filter((p) => !p.best_seller);
    return [...bestSellers, ...remainder].slice(0, 3);
  })();

  return (
    <section className="explore-section-block explore-top-selling-section" aria-labelledby="top-selling-heading">
      <div className="explore-section-header">
        <div className="explore-section-header-left">
          <span className="explore-section-kicker">{t("most_wanted")}</span>
          <h2 id="top-selling-heading" className="explore-section-title">
            {t("top_selling_title")}
          </h2>
        </div>
        <Link href="/products" className="explore-shop-all-link" aria-label={`${t("shop_all")} products`}>
          <span>{t("shop_all")}</span>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <div className="explore-products-grid">
        {topProducts.map((product) => (
          <ProductCard key={`top-selling-${product.id}`} product={product} />
        ))}
      </div>
    </section>
  );
}

