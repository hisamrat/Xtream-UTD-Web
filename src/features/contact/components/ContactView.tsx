"use client";

import { contactHero } from "@/content/contact";
import { TrustPerks } from "@/features/brand/TrustPerks";
import { useI18n } from "@/i18n/LanguageProvider";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import { ContactChannels } from "./ContactChannels";
import { ContactFaq } from "./ContactFaq";
import { ContactForm } from "./ContactForm";

export function ContactView() {
  const { t, localize } = useI18n();

  return (
    <main className="page-main contact-page-main contact-page">
      <Breadcrumb homeLabel={t("nav.home")} ariaLabel={t("nav.breadcrumb")} items={[{ label: t("contact.breadcrumb") }]} />

      <section className="contact-hero-section">
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">
            {localize(contactHero.title)} <br />
            <span className="text-accent">{localize(contactHero.titleAccent)}</span>
          </h1>
          <p className="contact-hero-lede">{localize(contactHero.lede)}</p>
          <TrustPerks ids={["authentic", "dispatch", "cod", "supportChat"]} ariaLabel={t("brand.perks.aria")} />
        </div>
      </section>

      <section className="contact-main-grid">
        <ContactChannels />
        <ContactForm />
      </section>

      <section className="contact-faq-container">
        <ContactFaq />
      </section>
    </main>
  );
}
