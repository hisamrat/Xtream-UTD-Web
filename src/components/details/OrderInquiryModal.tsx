"use client";

import { Check, Copy, ExternalLink, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { createOrderMessage, isEditablePlaceholder } from "@/lib/order";
import type { Product } from "@/lib/product-schema";

type OrderInquiryModalProps = {
  product: Product;
  variant: string;
  quantity: number;
  open: boolean;
  onClose: () => void;
};

type FormState = {
  name: string;
  phone: string;
  address: string;
  note: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState: FormState = {
  name: "",
  phone: "",
  address: "",
  note: ""
};

export function OrderInquiryModal({
  product,
  variant,
  quantity,
  open,
  onClose
}: OrderInquiryModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const message = useMemo(
    () =>
      createOrderMessage({
        product,
        variant,
        quantity,
        customerName: form.name || "Editable customer name",
        phone: form.phone || "01XXXXXXXXX",
        address: form.address || "Editable delivery address",
        note: form.note
      }),
    [form, product, quantity, variant]
  );

  useEffect(() => {
    document.body.classList.toggle("modal-open", open);
    if (open) {
      window.setTimeout(() => closeRef.current?.focus(), 20);
    }

    return () => document.body.classList.remove("modal-open");
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const submit = () => {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSent(true);
  };

  const openMessenger = () => {
    if (isEditablePlaceholder(siteConfig.order.messengerUrl)) {
      return;
    }

    window.open(siteConfig.order.messengerUrl, "_blank", "noopener,noreferrer");
  };

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Order inquiry">
      <div className="modal-panel">
        {sent ? (
          <div className="success-state">
            <div className="success-mark">
              <Check size={72} aria-hidden="true" />
            </div>
            <h2>Your inquiry has been sent.</h2>
            <p className="page-lede">
              Xtream UTD will contact you using the phone number provided.
            </p>
            <div className="order-summary">
              <p className="section-kicker">Product</p>
              <strong>{product.title}</strong>
              <br />
              <span>{formatPrice(product.price)}</span>
            </div>
            <div className="action-row success-actions">
              <button className="pill-button light" type="button" onClick={onClose}>
                Continue Shopping
              </button>
              <button className="pill-button" type="button" onClick={copyMessage}>
                <Copy size={16} aria-hidden="true" />
                {copied ? "Copied Summary" : "Copy Summary"}
              </button>
              <button
                className="pill-button primary"
                type="button"
                onClick={openMessenger}
                disabled={isEditablePlaceholder(siteConfig.order.messengerUrl)}
              >
                <ExternalLink size={16} aria-hidden="true" />
                Open Messenger
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div>
                <p className="section-kicker">Order inquiry</p>
                <h2 className="modal-title">{product.title}</h2>
                <PriceDisplayText product={product} />
              </div>
              <button ref={closeRef} className="icon-button" type="button" onClick={onClose} aria-label="Close order inquiry">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <form
              className="modal-form"
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              <div className="form-grid">
                <label className="field-label">
                  Selected variant
                  <input className="field" value={variant} readOnly />
                </label>
                <label className="field-label">
                  Quantity
                  <input className="field" value={quantity} readOnly />
                </label>
              </div>
              <div className="form-grid">
                <label className="field-label">
                  Customer name
                  <input
                    className="field"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Enter your name"
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name ? <span className="field-error">{errors.name}</span> : null}
                </label>
                <label className="field-label">
                  Phone number
                  <input
                    className="field"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    placeholder="01XXXXXXXXX"
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone ? <span className="field-error">{errors.phone}</span> : null}
                </label>
              </div>
              <label className="field-label">
                Delivery address
                <input
                  className="field"
                  value={form.address}
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                  placeholder="House, road, area, district"
                  aria-invalid={Boolean(errors.address)}
                />
                {errors.address ? <span className="field-error">{errors.address}</span> : null}
              </label>
              <label className="field-label">
                Additional note
                <textarea
                  className="textarea"
                  value={form.note}
                  onChange={(event) => setForm({ ...form, note: event.target.value })}
                  placeholder="Colour preference or delivery note"
                />
              </label>
              <button className="button primary" type="submit">
                Submit inquiry
              </button>
              <p className="page-lede modal-helper">
                You can also continue directly in Facebook Messenger after a verified Messenger URL is configured.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) {
    errors.name = "Customer name is required.";
  }
  if (!form.phone.trim()) {
    errors.phone = "Phone number is required.";
  }
  if (!form.address.trim()) {
    errors.address = "Delivery address is required.";
  }
  return errors;
}

function PriceDisplayText({ product }: { product: Product }) {
  return (
    <p className="modal-price-line">
      <strong>{formatPrice(product.price)}</strong>
      {product.old_price > product.price ? (
        <span className="old-price">
          {formatPrice(product.old_price)}
        </span>
      ) : null}
    </p>
  );
}
