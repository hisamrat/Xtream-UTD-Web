"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { commerceConfig } from "@/config/commerce";
import type { Product } from "@/domain/product/product-schema";
import { getDefaultVariant, getProductVariants, type ProductSummary } from "@/domain/product/product-summary";
import { ProductCard } from "@/features/product/components/ProductCard";
import { useI18n } from "@/i18n/LanguageProvider";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { BuyBox } from "./BuyBox";
import { InquiryDialog } from "./InquiryDialog";
import { ProductGallery } from "./ProductGallery";

type ProductDetailsViewProps = {
  product: Product;
  relatedProducts: ProductSummary[];
};

export function ProductDetailsView({ product, relatedProducts }: ProductDetailsViewProps) {
  const { t, tCategory, tStock } = useI18n();
  const [selectedVariant, setSelectedVariant] = useState(() => getDefaultVariant(product));
  const [quantity, setQuantity] = useState(1);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const recentlyViewed = useRecentlyViewed(product.slug);

  const categoryHref = `/products?category=${encodeURIComponent(product.category)}`;
  const variants = getProductVariants(product);
  const specifications = Object.entries(product.specifications);
  const { nationwideDeliveryDays } = commerceConfig;

  const handleVariantChange = (variant: string) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  return (
    <>
      <section className="details-page">
        <Breadcrumb
          homeLabel={t("nav.home")}
          ariaLabel={t("nav.breadcrumb")}
          items={[
            { label: t("product.details.breadcrumbProducts"), href: "/products" },
            { label: tCategory(product.category), href: categoryHref },
            { label: product.title }
          ]}
        />

        <div className="details-layout">
          <ProductGallery product={product} />
          <BuyBox
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={handleVariantChange}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onInquiry={() => setInquiryOpen(true)}
          />
        </div>

        {product.short ? (
          <div className="details-overview-card">
            <h2 className="section-title-sm">
              <FileText size={17} className="text-accent" aria-hidden="true" />
              <span>{t("product.details.overview")}</span>
            </h2>
            <p className="overview-paragraph">{product.short}</p>
          </div>
        ) : null}

        <div className="details-sections">
          {product.features.length > 0 ? (
            <div className="details-card features-card">
              <h2 className="section-title-sm">
                <CheckCircle2 size={17} className="text-accent" aria-hidden="true" />
                <span>{t("product.details.features")}</span>
              </h2>
              <ul className="feature-list">
                {product.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="details-card specs-card">
            <h2 className="section-title-sm">
              <ShieldCheck size={17} className="text-accent" aria-hidden="true" />
              <span>{t("product.details.specifications")}</span>
            </h2>
            <dl className="spec-list">
              {specifications.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div>
                <dt>{t("product.details.specCategory")}</dt>
                <dd>{tCategory(product.category)}</dd>
              </div>
              <div>
                <dt>{t("product.details.specAvailability")}</dt>
                <dd>{tStock(product.stock)}</dd>
              </div>
              {variants.length > 0 ? (
                <div>
                  <dt>{t("product.details.specOptions")}</dt>
                  <dd>{variants.join(", ")}</dd>
                </div>
              ) : null}
              <div>
                <dt>{t("product.details.specDelivery")}</dt>
                <dd>{t("product.details.specDeliveryValue", { min: nationwideDeliveryDays.min, max: nationwideDeliveryDays.max })}</dd>
              </div>
            </dl>
          </div>
        </div>

        {relatedProducts.length > 0 ? (
          <ProductShelf
            id="related-products-heading"
            kicker={t("product.details.relatedKicker")}
            title={t("product.details.relatedTitle")}
            href={categoryHref}
            linkAriaLabel={t("product.details.shopAllAria", { category: tCategory(product.category) })}
            products={relatedProducts}
          />
        ) : null}

        {recentlyViewed.length > 0 ? (
          <ProductShelf
            id="recently-viewed-heading"
            kicker={t("product.details.recentKicker")}
            title={t("product.details.recentTitle")}
            href="/products"
            linkAriaLabel={t("product.details.shopAllProductsAria")}
            products={recentlyViewed}
          />
        ) : null}
      </section>

      <InquiryDialog
        product={product}
        variant={selectedVariant}
        quantity={quantity}
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
      />
    </>
  );
}

type ProductShelfProps = {
  id: string;
  kicker: string;
  title: string;
  href: string;
  linkAriaLabel: string;
  products: ProductSummary[];
};

function ProductShelf({ id, kicker, title, href, linkAriaLabel, products }: ProductShelfProps) {
  const { t } = useI18n();
  return (
    <section className="related-section" aria-labelledby={id}>
      <div className="explore-section-header">
        <div className="explore-section-header-left">
          <span className="explore-section-kicker">{kicker}</span>
          <h2 id={id} className="explore-section-title">
            {title}
          </h2>
        </div>
        <Link href={href} className="explore-shop-all-link" aria-label={linkAriaLabel}>
          <span>{t("action.shopAll")}</span>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <div className="product-grid related-grid">
        {products.slice(0, 3).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
