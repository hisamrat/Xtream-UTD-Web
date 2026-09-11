"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Package,
  Send,
  Sparkles,
  Truck
} from "lucide-react";
import type { Product } from "@/lib/product-schema";
import { siteConfig } from "@/config/site";
import { isEditablePlaceholder } from "@/lib/order";
import { useLanguage } from "@/components/site/LanguageProvider";

type ContactFormProps = {
  products?: Product[];
};

type ContactFormState = {
  name: string;
  phone: string;
  type: string;
  productSlug?: string;
  message: string;
};

const inquiryTypes = [
  {
    id: "advice",
    label: "Product Advice",
    labelBn: "প্রোডাক্ট পরামর্শ",
    icon: Sparkles,
    desc: "Specs, compatibility & bundles",
    descBn: "স্পেসিফিকেশন ও কমপ্যাটিবিলিটি"
  },
  {
    id: "order",
    label: "Place New Order",
    labelBn: "নতুন অর্ডার দিন",
    icon: Package,
    desc: "Instant checkout & reservation",
    descBn: "দ্রুত বুকিং ও রিজার্ভেশন"
  },
  {
    id: "delivery",
    label: "Delivery & Tracking",
    labelBn: "ডেলিভারি ও ট্র্যাকিং",
    icon: Truck,
    desc: "Dhaka (৳70) & nationwide (৳130)",
    descBn: "ঢাকা (৳৭০) ও সারাদেশে (৳১৩০)"
  },
  {
    id: "general",
    label: "General Inquiry",
    labelBn: "সাধারণ তথ্য ও সহায়তা",
    icon: HelpCircle,
    desc: "Pricing, availability & assistance",
    descBn: "দাম, স্টক ও সাধারণ তথ্য"
  }
];

const initialState: ContactFormState = {
  name: "",
  phone: "",
  type: "Product Advice",
  productSlug: "",
  message: ""
};

export function ContactForm({ products = [] }: ContactFormProps) {
  const { language, formatNumber } = useLanguage();
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submittedData, setSubmittedData] = useState<ContactFormState | null>(null);

  const selectedProduct = products.find((p) => p.slug === form.productSlug);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      setError(
        language === "bn"
          ? "অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং বার্তা পূরণ করুন।"
          : "Please fill in your name, phone number, and message."
      );
      return;
    }

    if (form.phone.trim().length < 8) {
      setError(
        language === "bn"
          ? "অনুগ্রহ করে একটি সঠিক মোবাইল নম্বর প্রদান করুন।"
          : "Please provide a valid phone number."
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    window.setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedData({ ...form });
      setSubmitted(true);
    }, 600);
  };

  const isMessengerValid = !isEditablePlaceholder(siteConfig.order.messengerUrl);

  if (submitted && submittedData) {
    return (
      <div className="contact-form-card panel submitted-card" role="status">
        <div className="success-header">
          <div className="success-icon-badge" aria-hidden="true">
            <CheckCircle2 size={36} />
          </div>
          <span className="bento-tag text-emerald">
            {language === "bn" ? "বার্তা প্রস্তুত" : "Inquiry Ready"}
          </span>
          <h2 className="success-title">
            {language === "bn" ? "বার্তা সফলভাবে প্রস্তুত হয়েছে" : "Message Successfully Prepared"}
          </h2>
          <p className="page-lede flush-lede">
            {language === "bn" ? (
              <>
                ধন্যবাদ, <strong className="text-primary">{submittedData.name}</strong>! আপনার{" "}
                <strong>{submittedData.type}</strong> সম্পর্কিত বার্তা Xtream UTD সাপোর্ট ডেস্কের জন্য প্রস্তুত করা হয়েছে।
              </>
            ) : (
              <>
                Thank you, <strong className="text-primary">{submittedData.name}</strong>! Your inquiry for{" "}
                <strong>{submittedData.type}</strong> has been prepared for the Xtream UTD desk.
              </>
            )}
          </p>
        </div>

        <div className="inquiry-receipt">
          <div className="receipt-row">
            <span className="receipt-label">
              {language === "bn" ? "গ্রাহকের নাম:" : "Customer:"}
            </span>
            <span className="receipt-value">{submittedData.name}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">
              {language === "bn" ? "মোবাইল:" : "Contact:"}
            </span>
            <span className="receipt-value">{submittedData.phone}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">
              {language === "bn" ? "বিষয়:" : "Inquiry:"}
            </span>
            <span className="receipt-value">{submittedData.type}</span>
          </div>
          {submittedData.productSlug ? (
            <div className="receipt-row">
              <span className="receipt-label">
                {language === "bn" ? "প্রোডাক্ট:" : "Product:"}
              </span>
              <span className="receipt-value text-accent">
                {selectedProduct?.title ?? submittedData.productSlug}
              </span>
            </div>
          ) : null}
          <div className="receipt-msg">
            <span className="receipt-label">
              {language === "bn" ? "আপনার বার্তা:" : "Your message:"}
            </span>
            <p className="receipt-quote">&ldquo;{submittedData.message}&rdquo;</p>
          </div>
        </div>

        <div className="receipt-actions">
          <a
            href={isMessengerValid ? siteConfig.order.messengerUrl : "https://m.me/xtreamutd"}
            target="_blank"
            rel="noopener noreferrer"
            className="button primary receipt-chat-btn"
          >
            <Send size={18} aria-hidden="true" />
            <span>{language === "bn" ? "মেসেঞ্জার চ্যাট খুলুন" : "Open Messenger Chat"}</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="pill-button"
            onClick={() => {
              setSubmitted(false);
              setForm(initialState);
            }}
          >
            {language === "bn" ? "নতুন বার্তা পাঠান" : "Submit another message"}
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
          <span>{language === "bn" ? "অগ্রাধিকার সাপোর্ট ফর্ম" : "Priority Desk Form"}</span>
        </div>
        <h2 className="form-main-heading">
          {language === "bn" ? "বার্তা বা জিজ্ঞাসা পাঠান" : "Send Customer Inquiry"}
        </h2>
        <p className="form-sub-heading">
          {language === "bn"
            ? "নিচে আপনার তথ্য দিন, আমাদের টিম দ্রুত স্টক নিশ্চিত করবে এবং প্রয়োজনীয় তথ্য দিয়ে সাহায্য করবে।"
            : "Fill in your details below and our gadget specialists will confirm availability or guide your purchase."}
        </p>
      </div>

      {/* Inquiry Type Chips */}
      <div className="form-section">
        <label className="field-section-label" id="inquiry-type-label">
          {language === "bn" ? "জিজ্ঞাসার বিষয় নির্বাচন করুন" : "Choose Inquiry Topic"}
        </label>
        <div
          className="inquiry-chip-grid"
          role="radiogroup"
          aria-labelledby="inquiry-type-label"
        >
          {inquiryTypes.map((item) => {
            const labelText = language === "bn" ? item.labelBn : item.label;
            const descText = language === "bn" ? item.descBn : item.desc;
            const isSelected = form.type === item.label || form.type === item.labelBn;
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.id}
                role="radio"
                aria-checked={isSelected}
                className={`inquiry-chip ${isSelected ? "is-active" : ""}`}
                onClick={() => setForm({ ...form, type: language === "bn" ? item.labelBn : item.label })}
              >
                <div className="chip-icon-wrap" aria-hidden="true">
                  <Icon size={16} />
                </div>
                <div className="chip-text-wrap">
                  <span className="chip-title">{labelText}</span>
                  <span className="chip-desc">{descText}</span>
                </div>
                {isSelected ? (
                  <Check size={16} className="chip-check" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contact Info Grid */}
      <div className="form-fields-grid">
        <div className="modern-field-group">
          <label className="field-label" htmlFor="contact-name">
            {language === "bn" ? "পূর্ণ নাম" : "Full Name"} <span className="field-required">*</span>
          </label>
          <input
            id="contact-name"
            className="field modern-field"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder={language === "bn" ? "যেমন: তানভীর আহমেদ" : "e.g. Tanvir Ahmed"}
            autoComplete="name"
            required
          />
        </div>

        <div className="modern-field-group">
          <label className="field-label" htmlFor="contact-phone">
            {language === "bn" ? "মোবাইল নম্বর" : "Phone Number"} <span className="field-required">*</span>
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


      {/* Message Textarea */}
      <div className="modern-field-group">
        <div className="field-header-row">
          <label className="field-label" htmlFor="contact-message">
            {language === "bn" ? "বার্তা ও বিস্তারিত" : "Message & Questions"} <span className="field-required">*</span>
          </label>
          <span className="char-count">{formatNumber(form.message.length)} / {formatNumber(500)}</span>
        </div>
        <textarea
          id="contact-message"
          className="textarea modern-textarea"
          rows={4}
          maxLength={500}
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          placeholder={
            language === "bn"
              ? "আপনি কী খুঁজছেন, পণ্যের বিস্তারিত জানতে চান বা ডেলিভারি সংক্রান্ত কোনো তথ্য থাকলে লিখুন..."
              : `Describe what you're looking for, question about ${form.type.toLowerCase()}, or delivery requirements...`
          }
          required
        />
      </div>

      {error ? (
        <div className="field-error-banner" role="alert">
          <HelpCircle size={16} aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <button
        className={`button primary form-submit-btn ${isSubmitting ? "is-loading" : ""}`}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="submit-spinner" aria-hidden="true" />
            <span>{language === "bn" ? "বার্তা প্রস্তুত করা হচ্ছে..." : "Preparing Message..."}</span>
          </>
        ) : (
          <>
            <Send size={18} aria-hidden="true" />
            <span>{language === "bn" ? "বার্তা বা জিজ্ঞাসা পাঠান" : "Send Customer Inquiry"}</span>
          </>
        )}
      </button>

      <p className="form-privacy-note">
        <Sparkles size={13} aria-hidden="true" />
        <span>
          {language === "bn"
            ? "আপনার বার্তা সরাসরি আমাদের সেলস ও টেকনিক্যাল টিমের কাছে পৌঁছাবে। কোনো স্প্যাম নেই।"
            : "Your inquiry is transmitted directly to our sales and technical support team. No spam, ever."}
        </span>
      </p>
    </form>
  );
}
