"use client";

import { Package } from "lucide-react";
import { useEffect } from "react";
import { commerceConfig } from "@/config/commerce";
import { preOrderTerms, termsAgreements, termsHero } from "@/content/terms";
import { deliveryParams } from "@/features/brand/trust-points";
import { TrustPerks } from "@/features/brand/TrustPerks";
import { useI18n } from "@/i18n/LanguageProvider";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import { RichText } from "@/shared/ui/RichText";
import { ValueCards } from "./ValueCards";

export function TermsView() {
  const { t, localize, language } = useI18n();
  const couriersList = new Intl.ListFormat(language === "bn" ? "bn" : "en", { style: "long", type: "conjunction" }).format(
    commerceConfig.courierPartners
  );

  // Deep link to the pre-order section (footer "Pre Order Terms" link).
  useEffect(() => {
    if (window.location.hash !== "#pre-order") return;
    const timer = window.setTimeout(() => {
      document.getElementById("pre-order")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="page-main contact-page-main">
      <Breadcrumb homeLabel={t("nav.home")} ariaLabel={t("nav.breadcrumb")} items={[{ label: localize(termsHero.breadcrumb) }]} />

      <section className="contact-hero-section">
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">
            {localize(termsHero.title)} <br />
            <span className="text-accent">{localize(termsHero.titleAccent)}</span>
          </h1>
          <p className="contact-hero-lede">{localize(termsHero.lede)}</p>
          <TrustPerks ids={["authentic", "dispatch", "cod", "support"]} ariaLabel={t("brand.perks.aria")} />
        </div>
      </section>

      <ValueCards cards={termsAgreements} params={{ ...deliveryParams, couriersList }} />

      <section id="pre-order" className="stack-section terms-preorder-section" style={{ marginTop: "32px" }}>
        <div className="terms-preorder-card">
          <div className="terms-preorder-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div className="channel-icon-badge phone-badge" style={{ width: "36px", height: "36px" }}>
                <Package size={18} aria-hidden="true" />
              </div>
              <span className="bento-tag">{localize(preOrderTerms.tag)}</span>
            </div>
            <h2 className="terms-preorder-title" style={{ marginTop: "8px" }}>
              {localize(preOrderTerms.title)}
            </h2>
            <p className="page-lede flush-lede">{localize(preOrderTerms.lede)}</p>
          </div>

          <ul className="terms-preorder-list">
            {preOrderTerms.rules.map((rule, index) => (
              <li key={index}>
                <span className="preorder-bullet-icon" aria-hidden="true">
                  ✓
                </span>
                <span>
                  <RichText segments={rule[language]} />
                </span>
              </li>
            ))}
          </ul>

          <div className="terms-preorder-alert" role="note">
            <span className="preorder-alert-icon" aria-hidden="true">
              📢
            </span>
            <div className="preorder-alert-content">
              <strong>{localize(preOrderTerms.alertLabel)}</strong> <RichText segments={preOrderTerms.alert[language]} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
