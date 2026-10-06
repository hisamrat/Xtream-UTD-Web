"use client";

import { ChevronDown, HelpCircle, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { contactFaqIntro, contactFaqs, type FaqIcon } from "@/content/contact";
import { deliveryParams } from "@/features/brand/trust-points";
import { useI18n } from "@/i18n/LanguageProvider";

const icons: Record<FaqIcon, typeof HelpCircle> = { sparkles: Sparkles, truck: Truck, shield: ShieldCheck, help: HelpCircle };

export function ContactFaq() {
  const { localize, formatNumber } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);
  const params = { ...deliveryParams, phone: formatNumber(siteConfig.order.phone) };

  return (
    <div className="contact-faq-section">
      <div className="faq-header">
        <span className="section-kicker">{localize(contactFaqIntro.kicker)}</span>
        <h2 className="faq-main-title">{localize(contactFaqIntro.title)}</h2>
        <p className="page-lede flush-lede">{localize(contactFaqIntro.lede)}</p>
      </div>

      <div className="faq-accordion-list">
        {contactFaqs.map((faq) => {
          const isOpen = openId === faq.id;
          const Icon = icons[faq.icon];
          const panelId = `faq-answer-${faq.id}`;

          return (
            <div className={`faq-accordion-item ${isOpen ? "is-open" : ""}`} key={faq.id}>
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <div className="faq-question-left">
                  <div className="faq-icon-badge" aria-hidden="true">
                    <Icon size={18} />
                  </div>
                  <span className="faq-question-text">{localize(faq.question)}</span>
                </div>
                <ChevronDown size={18} className={`faq-chevron ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {isOpen ? (
                <div className="faq-answer-panel" id={panelId}>
                  <p className="faq-answer-text">{localize(faq.answer, params)}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
