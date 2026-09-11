"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Info,
  MapPin,
  Minus,
  Plus,
  Send,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  X
} from "lucide-react";
import { ProductArtwork } from "@/components/products/ProductArtwork";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/config/site";
import { isEditablePlaceholder } from "@/lib/order";
import { useLanguage } from "@/components/site/LanguageProvider";
import { useCart } from "./CartProvider";

type DeliveryZone = "dhaka" | "outside";

type CheckoutForm = {
  firstName: string;
  lastName: string;
  phone: string;
  deliveryZone: DeliveryZone;
  address: string;
  thana: string;
  district: string;
  note: string;
};

type FormErrors = Partial<Record<keyof CheckoutForm, string>>;

const initialForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  phone: "",
  deliveryZone: "dhaka",
  address: "",
  thana: "",
  district: "",
  note: ""
};

type CheckoutModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { items, totalPrice, totalCount, clearCart, updateQuantity, removeItem } = useCart();
  const { language, formatNumber } = useLanguage();
  const closeRef = useRef<HTMLButtonElement>(null);

  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const deliveryFee = form.deliveryZone === "dhaka" ? 70 : 130;
  const grandTotal = totalPrice + deliveryFee;

  useEffect(() => {
    document.body.classList.toggle("modal-open", open);
    if (open) {
      window.setTimeout(() => closeRef.current?.focus(), 20);
    }
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  const compiledOrderMessage = useMemo(() => {
    const zoneName = form.deliveryZone === "dhaka" ? "Inside Dhaka" : "Outside Dhaka";

    const productLines = items
      .map(
        (item, index) =>
          `${index + 1}. Product Name: ${item.product.title}\n   Variant: ${item.variant}\n   Quantity: ${item.quantity}\n   Price: ${formatPrice(
            item.product.price * item.quantity
          )}`
      )
      .join("\n\n");

    const noteLine = form.note.trim() ? `\nAdditional Note: ${form.note.trim()}` : "";
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();

    return `HELLO XTREAM UTD!

CUSTOMER DETAILS:

Name: ${fullName}
Phone: ${form.phone.trim()}
Delivery Location: ${zoneName}
Address: ${form.address.trim()}
Police Station (Thana): ${form.thana.trim()}
District: ${form.district.trim()}${noteLine}

ORDERED PRODUCTS:

${productLines}

PAYMENT SUMMARY:

Subtotal: ${formatPrice(totalPrice)}
Delivery Fee: ${formatPrice(deliveryFee)}
Grand Total: ${formatPrice(grandTotal)}

PLEASE CONFIRM MY ORDER!`;
  }, [deliveryFee, form, grandTotal, items, totalPrice]);

  const handleCopyOrder = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(compiledOrderMessage);
      } else {
        throw new Error("Clipboard API unavailable");
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = compiledOrderMessage;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      } catch {
        // Fallback
      }
    }
  };

  const isMessengerValid = !isEditablePlaceholder(siteConfig.order.messengerUrl);
  const messengerUrl = isMessengerValid
    ? `${siteConfig.order.messengerUrl}?text=${encodeURIComponent(compiledOrderMessage)}`
    : `https://m.me/xtreamutd`;

  if (!open) return null;

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (!form.firstName.trim()) {
      nextErrors.firstName = language === "bn" ? "ফার্স্ট নেম প্রয়োজন" : "First name is required.";
    }
    if (!form.lastName.trim()) {
      nextErrors.lastName = language === "bn" ? "লাস্ট নেম প্রয়োজন" : "Last name is required.";
    }
    if (!form.phone.trim()) {
      nextErrors.phone = language === "bn" ? "ফোন নম্বর প্রয়োজন" : "Phone number is required.";
    } else if (!/^01[3-9]\d{8}$/.test(form.phone.trim().replace(/\s+/g, ""))) {
      nextErrors.phone =
        language === "bn"
          ? "সঠিক ১১ ডিজিটের ফোন নম্বর দিন (যেমন: 01712345678)"
          : "Please enter a valid 11-digit mobile number (e.g., 01712345678).";
    }
    if (!form.address.trim()) {
      nextErrors.address = language === "bn" ? "ফুল এড্রেস প্রয়োজন" : "Full address is required.";
    }
    if (!form.thana.trim()) {
      nextErrors.thana = language === "bn" ? "থানা প্রয়োজন" : "Police station (Thana) is required.";
    }
    if (!form.district.trim()) {
      nextErrors.district = language === "bn" ? "জেলা প্রয়োজন" : "District is required.";
    }
    return nextErrors;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitted(true);
    window.open(messengerUrl, "_blank", "noopener,noreferrer");
    clearCart();
  };

  return (
    <div className="checkout-modal-backdrop" role="dialog" aria-modal="true" aria-label="Checkout">
      <div className="checkout-modal-scrim" onClick={onClose} aria-hidden="true" />
      <div className="checkout-modal-panel">
        <div className="checkout-modal-header">
          <div className="checkout-title-group">
            <ShoppingBag size={20} className="text-accent" aria-hidden="true" />
            <h2>{language === "bn" ? "অর্ডার চেকআউট" : "Complete Your Order"}</h2>
          </div>
          <button
            ref={closeRef}
            className="checkout-modal-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {submitted ? (
          <div className="checkout-success-state">
            <CheckCircle2 size={64} className="text-accent success-icon" aria-hidden="true" />
            <h3>{language === "bn" ? "অর্ডার সম্পন্ন হয়েছে!" : "Order Submitted Successfully!"}</h3>
            <p className="checkout-success-desc">
              {language === "bn"
                ? "আপনার অর্ডারের বিবরণ নিয়ে মেসেঞ্জার ওপেন হয়েছে। অনুগ্রহ করে মেসেঞ্জারে অর্ডার কনফার্ম করুন!!"
                : "Your order details have been formatted and opened in Messenger. Please Confirm Order on Messenger!!"}
            </p>
            <div className="checkout-success-note">
              <Info size={18} className="checkout-note-icon" aria-hidden="true" />
              <span>
                {language === "bn"
                  ? "সেলার থেকে অর্ডার কনফার্মেশন মেসেজ পাওয়ার পর আপনার অর্ডারটি কনফার্ম হবে।"
                  : "Your Order Will Be Confirmed Once You Receive The Order Confirmation Message From The Seller."}
              </span>
            </div>
            <div className="checkout-success-actions">
              <a
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button primary"
              >
                <Send size={16} aria-hidden="true" />
                <span>{language === "bn" ? "মেসেঞ্জারে মেসেজ পাঠান" : "Open Messenger Again"}</span>
              </a>
              <button
                type="button"
                className={`pill-button light checkout-success-copy-btn ${copied ? "is-copied" : ""}`}
                onClick={handleCopyOrder}
              >
                {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                <span>
                  {copied
                    ? (language === "bn" ? "মেসেজ কপি হয়েছে!" : "Message Copied!")
                    : (language === "bn" ? "মেসেজ কপি করুন" : "Copy Order Message")}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <form className="checkout-grid-layout" onSubmit={handleSubmit}>
            {/* Left Column: Customer Details Form */}
            <div className="checkout-form-column">
              <h3 className="checkout-section-title">
                <span>{language === "bn" ? "গ্রাহকের তথ্য" : "Customer Details"}</span>
              </h3>

              <div className="form-grid-2">
                <div className="field-group">
                  <label htmlFor="checkout-firstName" className="field-label">
                    {language === "bn" ? "ফার্স্ট নেম *" : "FIRST NAME *"}
                  </label>
                  <input
                    id="checkout-firstName"
                    className="field"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder={language === "bn" ? "যেমন: মোহাম্মদ" : "e.g. Tanvir"}
                    aria-invalid={Boolean(errors.firstName)}
                  />
                  {errors.firstName ? <span className="field-error">{errors.firstName}</span> : null}
                </div>

                <div className="field-group">
                  <label htmlFor="checkout-lastName" className="field-label">
                    {language === "bn" ? "লাস্ট নেম *" : "LAST NAME *"}
                  </label>
                  <input
                    id="checkout-lastName"
                    className="field"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder={language === "bn" ? "যেমন: রহমান" : "e.g. Ahmed"}
                    aria-invalid={Boolean(errors.lastName)}
                  />
                  {errors.lastName ? <span className="field-error">{errors.lastName}</span> : null}
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="checkout-phone" className="field-label">
                  {language === "bn" ? "মোবাইল নম্বর *" : "PHONE NUMBER *"}
                </label>
                <input
                  id="checkout-phone"
                  className="field"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="01712345678"
                  aria-invalid={Boolean(errors.phone)}
                />
                {errors.phone ? <span className="field-error">{errors.phone}</span> : null}
              </div>

              {/* Delivery Zone Options */}
              <div className="field-group">
                <span className="field-label">
                  {language === "bn" ? "ডেলিভারি লোকেশন *" : "DELIVERY LOCATION *"}
                </span>
                <div className="delivery-zone-options">
                  <label className={`zone-card ${form.deliveryZone === "dhaka" ? "is-selected" : ""}`}>
                    <input
                      type="radio"
                      name="deliveryZone"
                      value="dhaka"
                      checked={form.deliveryZone === "dhaka"}
                      onChange={() => setForm({ ...form, deliveryZone: "dhaka" })}
                    />
                    <div className="zone-card-content">
                      <div className="zone-header">
                        <MapPin size={16} aria-hidden="true" />
                        <strong>{language === "bn" ? "ইনসাইড ঢাকা" : "INSIDE DHAKA"}</strong>
                      </div>
                      <span className="zone-fee">৳70</span>
                    </div>
                  </label>

                  <label className={`zone-card ${form.deliveryZone === "outside" ? "is-selected" : ""}`}>
                    <input
                      type="radio"
                      name="deliveryZone"
                      value="outside"
                      checked={form.deliveryZone === "outside"}
                      onChange={() => setForm({ ...form, deliveryZone: "outside" })}
                    />
                    <div className="zone-card-content">
                      <div className="zone-header">
                        <Truck size={16} aria-hidden="true" />
                        <strong>{language === "bn" ? "ঢাকার বাইরে" : "OUTSIDE DHAKA"}</strong>
                      </div>
                      <span className="zone-fee">৳130</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Address, Thana & District */}
              <div className="field-group">
                <label htmlFor="checkout-address" className="field-label">
                  {language === "bn" ? "সম্পূর্ণ ঠিকানা (রোড, বাসা নং) *" : "FULL ADDRESS *"}
                </label>
                <input
                  id="checkout-address"
                  className="field"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder={
                    language === "bn"
                      ? "যেমন: বাসা ১২, রোড ৪, ব্লক সি"
                      : "House/Holding #, Road #, Area details"
                  }
                  aria-invalid={Boolean(errors.address)}
                />
                {errors.address ? <span className="field-error">{errors.address}</span> : null}
              </div>

              <div className="form-grid-2">
                <div className="field-group">
                  <label htmlFor="checkout-thana" className="field-label">
                    {language === "bn" ? "থানা *" : "POLICE STATION (THANA) *"}
                  </label>
                  <input
                    id="checkout-thana"
                    className="field"
                    value={form.thana}
                    onChange={(e) => setForm({ ...form, thana: e.target.value })}
                    placeholder={language === "bn" ? "যেমন: ধানমন্ডি" : "e.g. Mirpur / Gulshan"}
                    aria-invalid={Boolean(errors.thana)}
                  />
                  {errors.thana ? <span className="field-error">{errors.thana}</span> : null}
                </div>

                <div className="field-group">
                  <label htmlFor="checkout-district" className="field-label">
                    {language === "bn" ? "জেলা *" : "DISTRICT *"}
                  </label>
                  <input
                    id="checkout-district"
                    className="field"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    placeholder={language === "bn" ? "যেমন: ঢাকা" : "e.g. Dhaka / Chittagong"}
                    aria-invalid={Boolean(errors.district)}
                  />
                  {errors.district ? <span className="field-error">{errors.district}</span> : null}
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="checkout-note" className="field-label">
                  {language === "bn" ? "অতিরিক্ত নোট (ঐচ্ছিক)" : "ADDITIONAL NOTE (OPTIONAL)"}
                </label>
                <textarea
                  id="checkout-note"
                  className="textarea"
                  rows={2}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder={
                    language === "bn"
                      ? "কালার প্রেফারেন্স বা ডেলিভারি নির্দেশিকা"
                      : "Special delivery instructions"
                  }
                />
              </div>
            </div>

            {/* Right Column: Ordered Items & Financial Summary */}
            <div className="checkout-summary-column">
              <h3 className="checkout-section-title">
                <span>
                  {language === "bn"
                    ? `অর্ডারকৃত প্রোডাক্ট (${formatNumber(totalCount)})`
                    : `Order Summary (${totalCount} Items)`}
                </span>
              </h3>

              <div className="checkout-items-list">
                {items.map((item) => (
                  <div
                    className="checkout-item-card"
                    key={`${item.product.id}-${item.variant}`}
                  >
                    <div className="checkout-item-art">
                      <ProductArtwork product={item.product} compact />
                    </div>
                    <div className="checkout-item-details">
                      <div className="checkout-item-top">
                        <h4 className="checkout-item-title">{item.product.title}</h4>
                        <button
                          type="button"
                          className="checkout-item-remove-btn"
                          onClick={() => removeItem(item.product.id, item.variant)}
                          aria-label={`Remove ${item.product.title} from order`}
                          title={language === "bn" ? "প্রোডাক্ট মুছুন" : "Remove item"}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>

                      <div className="checkout-item-meta">
                        <span className="checkout-item-variant">{item.variant}</span>
                        <span className="checkout-item-unit-price">
                          {formatPrice(item.product.price)}
                          <span className="checkout-unit-label">
                            {language === "bn" ? " / প্রতি" : " / item"}
                          </span>
                        </span>
                      </div>

                      <div className="checkout-item-bottom">
                        <div className="quantity-stepper-mini" role="group" aria-label="Quantity">
                          <button
                            type="button"
                            className="quantity-btn-mini"
                            onClick={() => updateQuantity(item.product.id, item.variant, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={11} aria-hidden="true" />
                          </button>
                          <span className="quantity-val-mini">{formatNumber(item.quantity)}</span>
                          <button
                            type="button"
                            className="quantity-btn-mini"
                            onClick={() => updateQuantity(item.product.id, item.variant, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={11} aria-hidden="true" />
                          </button>
                        </div>

                        <div className="checkout-item-total-block">
                          <span className="checkout-item-total-label">
                            {language === "bn" ? "মোট:" : "Total:"}
                          </span>
                          <strong className="checkout-item-total-val">
                            {formatPrice(item.product.price * item.quantity)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown */}
              <div className="checkout-financial-card">
                <div className="financial-row">
                  <span>{language === "bn" ? "প্রোডাক্ট সাবটোটাল" : "Subtotal"}</span>
                  <strong>{formatPrice(totalPrice)}</strong>
                </div>
                <div className="financial-row">
                  <span>
                    {language === "bn" ? "ডেলিভারি চার্জ" : "Delivery Fee"} (
                    {form.deliveryZone === "dhaka" ? "Inside Dhaka" : "Outside Dhaka"})
                  </span>
                  <strong>{formatPrice(deliveryFee)}</strong>
                </div>
                <div className="financial-divider" />
                <div className="financial-row grand-total-row">
                  <span>{language === "bn" ? "সর্বমোট টাকা" : "Grand Total"}</span>
                  <strong className="grand-total-val">{formatPrice(grandTotal)}</strong>
                </div>
              </div>

              {/* Highlighted Important Order Information */}
              <div className="checkout-highlight-card" role="region" aria-label="Important Order Information">
                <div className="checkout-highlight-header">
                  <ShieldCheck size={16} className="highlight-header-icon" aria-hidden="true" />
                  <strong>
                    {language === "bn" ? "জরুরি অর্ডার সংক্রান্ত তথ্য" : "Important Order Information"}
                  </strong>
                </div>
                <ul className="checkout-highlight-list">
                  <li className="checkout-highlight-item">
                    <CheckCircle2 size={14} className="highlight-bullet-icon" aria-hidden="true" />
                    <span>
                      {language === "bn"
                        ? "সারাদেশে ২–৩ দিনের মধ্যে হোম ডেলিভারি।"
                        : "Home Delivery Available Nationwide Within 2–3 Days."}
                    </span>
                  </li>
                  <li className="checkout-highlight-item">
                    <CheckCircle2 size={14} className="highlight-bullet-icon" aria-hidden="true" />
                    <span>
                      {language === "bn"
                        ? "১০০% অথেনটিক প্রোডাক্ট গ্যারান্টি।"
                        : "100% Authentic Product Guarantee."}
                    </span>
                  </li>
                  <li className="checkout-highlight-item highlight-confirmation-item">
                    <CheckCircle2 size={14} className="highlight-bullet-icon highlight-accent-icon" aria-hidden="true" />
                    <span>
                      {language === "bn"
                        ? "সেলার থেকে অর্ডার কনফার্মেশন মেসেজ পাওয়ার পর আপনার অর্ডার কনফার্ম হবে।"
                        : "Your Order Will Be Confirmed Once You Receive The Order Confirmation Message From The Seller."}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons: Confirm & Copy Message */}
              <div className="checkout-action-stack">
                <button type="submit" className="button primary checkout-submit-btn" disabled={items.length === 0}>
                  <Send size={18} aria-hidden="true" />
                  <span>{language === "bn" ? "মেসেঞ্জারে অর্ডার সম্পন্ন করুন" : "Confirm Order on Messenger"}</span>
                </button>
                <button
                  type="button"
                  className={`checkout-copy-btn ${copied ? "is-copied" : ""}`}
                  onClick={handleCopyOrder}
                  disabled={items.length === 0}
                  aria-label="Copy formatted order message"
                  title={language === "bn" ? "অর্ডার মেসেজ কপি করুন" : "Copy Order Message"}
                >
                  {copied ? <Check size={16} aria-hidden="true" className="copy-icon-success" /> : <Copy size={16} aria-hidden="true" />}
                  <span>
                    {copied
                      ? (language === "bn" ? "অর্ডার মেসেজ কপি হয়েছে!" : "Order Message Copied!")
                      : (language === "bn" ? "অর্ডার মেসেজ কপি করুন" : "Copy Order Message")}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
