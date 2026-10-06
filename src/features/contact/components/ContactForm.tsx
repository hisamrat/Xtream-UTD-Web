"use client";

import { Check, CheckCircle2, Copy, ExternalLink, HelpCircle, Package, Send, Sparkles, Truck } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { hasErrors, validateCustomerFields } from "@/domain/commerce/customer-validation";
import { buildInquiryMessage, buildMessengerUrl } from "@/domain/commerce/order-message";
import { deliveryParams } from "@/features/brand/trust-points";
import type { TranslationKey } from "@/i18n/dictionary";
import { useI18n } from "@/i18n/LanguageProvider";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";

type TopicId = "advice" | "order" | "delivery" | "general";

const topics: { id: TopicId; Icon: typeof Sparkles }[] = [
  { id: "advice", Icon: Sparkles },
  { id: "order", Icon: Package },
  { id: "delivery", Icon: Truck },
  { id: "general", Icon: HelpCircle }
];

type ContactFormState = { name: string; phone: string; topic: TopicId; message: string };

const initialState: ContactFormState = { name: "", phone: "", topic: "advice", message: "" };
const MESSAGE_LIMIT = 500;

/** English topic names are used in the Messenger message so the seller sees one format. */
const topicNamesEn: Record<TopicId, string> = {
  advice: "Product Advice",
  order: "Place New Order",
  delivery: "Delivery & Tracking",
  general: "General Inquiry"
};

export function ContactForm() {
  const { t, formatNumber } = useI18n();
  const { copy, isCopied } = useCopyToClipboard();
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [error, setError] = useState<TranslationKey | null>(null);
  const [submitted, setSubmitted] = useState<ContactFormState | null>(null);

  const topicLabel = (topic: TopicId) => t(`contact.topic.${topic}`);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const errors = validateCustomerFields(form, ["name", "phone", "message"] as const);
    if (errors.name === "required" || errors.phone === "required" || errors.message === "required") {
      setError("contact.form.errorRequired");
      return;
    }
    if (hasErrors(errors)) {
      setError("contact.form.errorPhone");
      return;
    }
    setError(null);
    setSubmitted({ ...form });
  };

  if (submitted) {
    const message = buildInquiryMessage({ ...submitted, topic: topicNamesEn[submitted.topic] });
    return (
      <div className="contact-form-card panel submitted-card" role="status">
        <div className="success-header">
          <div className="success-icon-badge" aria-hidden="true">
            <CheckCircle2 size={36} />
          </div>
          <span className="bento-tag text-emerald">{t("contact.ready.tag")}</span>
          <h2 className="success-title">{t("contact.ready.title")}</h2>
          <p className="page-lede flush-lede">
            {t("contact.ready.lede", { name: submitted.name, topic: topicLabel(submitted.topic) })}
          </p>
        </div>

        <div className="inquiry-receipt">
          <div className="receipt-row">
            <span className="receipt-label">{t("contact.ready.customer")}</span>
            <span className="receipt-value">{submitted.name}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">{t("contact.ready.contact")}</span>
            <span className="receipt-value">{submitted.phone}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">{t("contact.ready.topic")}</span>
            <span className="receipt-value">{topicLabel(submitted.topic)}</span>
          </div>
          <div className="receipt-msg">
            <span className="receipt-label">{t("contact.ready.message")}</span>
            <p className="receipt-quote">&ldquo;{submitted.message}&rdquo;</p>
          </div>
        </div>

        <div className="receipt-actions">
          <a
            href={buildMessengerUrl(siteConfig.order.messengerUrl, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="button primary receipt-chat-btn"
          >
            <Send size={18} aria-hidden="true" />
            <span>{t("contact.ready.openMessenger")}</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
          <button type="button" className="button" onClick={() => void copy(message)}>
            {isCopied() ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            <span>{isCopied() ? t("contact.ready.copied") : t("contact.ready.copy")}</span>
          </button>
          <button
            type="button"
            className="button"
            onClick={() => {
              setSubmitted(null);
              setForm(initialState);
            }}
          >
            {t("contact.ready.another")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="contact-form-card panel" onSubmit={handleSubmit} noValidate>
      <div className="form-card-header">
        <div className="form-header-badge">
          <Sparkles size={16} aria-hidden="true" />
          <span>{t("contact.form.badge")}</span>
        </div>
        <h2 className="form-main-heading">{t("contact.form.heading")}</h2>
        <p className="form-sub-heading">{t("contact.form.subheading")}</p>
      </div>

      <div className="form-section">
        <span className="field-section-label" id="inquiry-type-label">
          {t("contact.form.topicLabel")}
        </span>
        <div className="inquiry-chip-grid" role="radiogroup" aria-labelledby="inquiry-type-label">
          {topics.map(({ id, Icon }) => {
            const isSelected = form.topic === id;
            return (
              <button
                type="button"
                key={id}
                role="radio"
                aria-checked={isSelected}
                className={`inquiry-chip ${isSelected ? "is-active" : ""}`}
                onClick={() => setForm({ ...form, topic: id })}
              >
                <div className="chip-icon-wrap" aria-hidden="true">
                  <Icon size={16} />
                </div>
                <div className="chip-text-wrap">
                  <span className="chip-title">{topicLabel(id)}</span>
                  <span className="chip-desc">{t(`contact.topic.${id}.desc`, deliveryParams)}</span>
                </div>
                {isSelected ? <Check size={16} className="chip-check" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-fields-grid">
        <div className="modern-field-group">
          <label className="field-label" htmlFor="contact-name">
            {t("contact.form.name")} <span className="field-required">*</span>
          </label>
          <input
            id="contact-name"
            className="field modern-field"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder={t("contact.form.namePlaceholder")}
            autoComplete="name"
            required
          />
        </div>

        <div className="modern-field-group">
          <label className="field-label" htmlFor="contact-phone">
            {t("contact.form.phone")} <span className="field-required">*</span>
          </label>
          <input
            id="contact-phone"
            className="field modern-field"
            type="tel"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            placeholder="01XXXXXXXXX"
            autoComplete="tel"
            required
          />
        </div>
      </div>

      <div className="modern-field-group">
        <div className="field-header-row">
          <label className="field-label" htmlFor="contact-message">
            {t("contact.form.message")} <span className="field-required">*</span>
          </label>
          <span className="char-count">
            {formatNumber(form.message.length)} / {formatNumber(MESSAGE_LIMIT)}
          </span>
        </div>
        <textarea
          id="contact-message"
          className="textarea modern-textarea"
          rows={4}
          maxLength={MESSAGE_LIMIT}
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          placeholder={t("contact.form.messagePlaceholder", { topic: topicLabel(form.topic).toLowerCase() })}
          required
        />
      </div>

      {error ? (
        <div className="field-error-banner" role="alert">
          <HelpCircle size={16} aria-hidden="true" />
          <span>{t(error)}</span>
        </div>
      ) : null}

      <button className="button primary form-submit-btn" type="submit">
        <Send size={18} aria-hidden="true" />
        <span>{t("contact.form.submit")}</span>
      </button>

      <p className="form-privacy-note">
        <Sparkles size={13} aria-hidden="true" />
        <span>{t("contact.form.privacy")}</span>
      </p>
    </form>
  );
}
