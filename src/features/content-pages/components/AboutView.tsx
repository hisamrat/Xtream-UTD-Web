"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { siteConfig } from "@/config/site";
import { aboutCollections, aboutHero, aboutValues } from "@/content/about";
import { deliveryParams } from "@/features/brand/trust-points";
import { TrustPerks } from "@/features/brand/TrustPerks";
import { useI18n } from "@/i18n/LanguageProvider";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import { ValueCards } from "./ValueCards";

/** `categories` are the categories present in the current catalogue. */
export function AboutView({ categories }: { categories: string[] }) {
  const { t, localize, tCategory, formatNumber } = useI18n();
  const params = {
    ...deliveryParams,
    phone: formatNumber(siteConfig.order.phone),
    hours: localize(siteConfig.business.hours),
    locationShort: localize(siteConfig.business.locationShort)
  };

  return (
    <main className="page-main about-page-main about-page contact-page-main">
      <Breadcrumb homeLabel={t("nav.home")} ariaLabel={t("nav.breadcrumb")} items={[{ label: localize(aboutHero.breadcrumb) }]} />

      <section className="contact-hero-section">
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">
            {localize(aboutHero.title)} <br />
            <span className="text-accent">{localize(aboutHero.titleAccent)}</span>
          </h1>
          <p className="contact-hero-lede">{localize(aboutHero.lede)}</p>
          <TrustPerks ids={["quality", "pricing", "nationwide", "support"]} ariaLabel={t("brand.perks.brandAria")} />
        </div>
      </section>

      <ValueCards cards={aboutValues} params={params} />

      {categories.length > 0 ? (
        <section className="stack-section" style={{ marginTop: "32px" }}>
          <div className="terms-preorder-card">
            <div className="terms-preorder-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <div className="channel-icon-badge phone-badge" style={{ width: "36px", height: "36px" }}>
                  <Layers size={18} aria-hidden="true" />
                </div>
                <span className="bento-tag">{localize(aboutCollections.tag)}</span>
              </div>
              <h2 className="terms-preorder-title" style={{ marginTop: "8px" }}>
                {localize(aboutCollections.title)}
              </h2>
              <p className="page-lede flush-lede">{localize(aboutCollections.lede)}</p>
            </div>

            <div className="category-pills" style={{ marginTop: "12px" }}>
              {categories.map((category) => (
                <Link className="category-pill" href={`/products?category=${encodeURIComponent(category)}`} key={category}>
                  {tCategory(category)}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
