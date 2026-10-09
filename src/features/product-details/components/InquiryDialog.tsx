"use client";

import { Check, Copy, ExternalLink, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { type CustomerFieldErrors, hasErrors, validateCustomerFields } from "@/domain/commerce/customer-validation";
import { formatPrice } from "@/domain/commerce/money";
import { buildMessengerUrl, buildOrderMessage } from "@/domain/commerce/order-message";
import { hasValidOldPrice } from "@/domain/product/pricing";
import type { Product } from "@/domain/product/product-schema";
import type { TranslationKey } from "@/i18n/dictionary";
import { useI18n } from "@/i18n/LanguageProvider";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import { useDialog } from "@/shared/hooks/useDialog";

export type InquiryLine = {
  variant: string;
  quantity: number;
};

type InquiryDialogProps = {
  product: Product;
  variant?: string;
  quantity?: number;
  lines?: InquiryLine[];
  open: boolean;
  onClose: () => void;
};

type InquiryField = "name" | "phone" | "address" | "note";
type InquiryForm = Record<InquiryField, string>;

const initialForm: InquiryForm = { name: "", phone: "", address: "", note: "" };
const requiredFields = ["name", "phone", "address"] as const;

const errorKeys: Record<(typeof requiredFields)[number], { required: TranslationKey; invalidPhone: TranslationKey }> = {
  name: { required: "product.inquiry.errorName", invalidPhone: "product.inquiry.errorName" },
  phone: { required: "product.inquiry.errorPhone", invalidPhone: "product.inquiry.errorPhoneInvalid" },
  address: { required: "product.inquiry.errorAddress", invalidPhone: "product.inquiry.errorAddress" }
};

/** Product inquiry. Prepares a Messenger message; nothing is sent by this website. */
export function InquiryDialog({ product, variant = "", quantity = 1, lines, open, onClose }: InquiryDialogProps) {
  const { t, formatNumber } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);
  const { copy, isCopied } = useCopyToClipboard();
  const [form, setForm] = useState<InquiryForm>(initialForm);
  const [errors, setErrors] = useState<CustomerFieldErrors<InquiryField>>({});
  const [ready, setReady] = useState(false);

  const selectedLines = useMemo<InquiryLine[]>(() => {
    if (lines && lines.length > 0) return lines;
    return [{ variant, quantity }];
  }, [lines, variant, quantity]);

  const totalQuantity = useMemo(() => selectedLines.reduce((sum, line) => sum + line.quantity, 0), [selectedLines]);
  const totalPrice = totalQuantity * product.price;

  const close = () => {
    setReady(false);
    onClose();
  };
  const dialogRef = useDialog({ open, onClose: close, initialFocusRef: closeRef });

  const message = useMemo(
    () =>
      buildOrderMessage({
        lines: selectedLines.map((line) => ({
          title: product.title,
          variant: line.variant,
          quantity: line.quantity,
          unitPrice: product.price
        })),
        customer: form
      }),
    [form, product, selectedLines]
  );

  if (!open) {
    return null;
  }

  const update = (field: InquiryField) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: event.target.value });

  const errorFor = (field: (typeof requiredFields)[number]) => {
    const code = errors[field];
    return code ? <span className="field-error">{t(errorKeys[field][code])}</span> : null;
  };

  const submit = () => {
    const nextErrors = validateCustomerFields(form, requiredFields);
    setErrors(nextErrors);
    if (!hasErrors(nextErrors)) {
      setReady(true);
    }
  };

  const messengerHref = buildMessengerUrl(siteConfig.order.messengerUrl, message);

  return (
    <div ref={dialogRef} className="modal-backdrop" role="dialog" aria-modal="true" aria-label={t("product.inquiry.dialogAria")}>
      <div className="modal-panel">
        {ready ? (
          <div className="success-state" role="status">
            <div className="success-mark">
              <Check size={72} aria-hidden="true" />
            </div>
            <h2>{t("product.inquiry.readyTitle")}</h2>
            <p className="page-lede">{t("product.inquiry.readyLede")}</p>
            <div className="order-summary">
              <p className="section-kicker">{t("product.inquiry.product")}</p>
              <strong>{product.title}</strong>
              <div className="order-summary-variant-breakdown">
                {selectedLines.map((line) => (
                  <div key={line.variant} className="order-summary-var-row">
                    <span>{line.variant ? `${line.variant} (×${formatNumber(line.quantity)})` : `Qty: ${formatNumber(line.quantity)}`}</span>
                    <span>{formatPrice(product.price * line.quantity)}</span>
                  </div>
                ))}
              </div>
              <strong className="order-summary-total-price">{formatPrice(totalPrice)}</strong>
            </div>
            <div className="action-row success-actions">
              <button ref={closeRef} className="button light" type="button" onClick={close}>
                {t("product.inquiry.continue")}
              </button>
              <button className="button" type="button" onClick={() => void copy(message)}>
                <Copy size={16} aria-hidden="true" />
                {isCopied() ? t("product.inquiry.copied") : t("product.inquiry.copy")}
              </button>
              <a className="button primary" href={messengerHref} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} aria-hidden="true" />
                {t("product.inquiry.openMessenger")}
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div>
                <p className="section-kicker">{t("product.inquiry.kicker")}</p>
                <h2 className="modal-title">{product.title}</h2>
                <p className="modal-price-line">
                  <strong>{formatPrice(product.price)}</strong>
                  {hasValidOldPrice(product) ? <span className="old-price">{formatPrice(product.old_price)}</span> : null}
                </p>
              </div>
              <button ref={closeRef} className="icon-button" type="button" onClick={close} aria-label={t("product.inquiry.close")}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <form
              className="modal-form"
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              {selectedLines.length > 1 ? (
                <div className="inquiry-multi-variant-card">
                  <span className="field-label">{t("product.inquiry.selectedVariants")}</span>
                  <div className="inquiry-variant-pill-list">
                    {selectedLines.map((line) => (
                      <div key={line.variant} className="inquiry-variant-pill-item">
                        <span className="pill-name">{line.variant}</span>
                        <span className="pill-qty">×{formatNumber(line.quantity)}</span>
                        <span className="pill-price">{formatPrice(product.price * line.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="inquiry-variant-total-row">
                    <span>{t("product.inquiry.totalQuantity")}: <strong>{formatNumber(totalQuantity)}</strong></span>
                    <strong>{formatPrice(totalPrice)}</strong>
                  </div>
                </div>
              ) : (
                <div className="form-grid">
                  <label className="field-label">
                    {t("product.inquiry.selectedVariant")}
                    <input className="field" value={selectedLines[0].variant || "Standard"} readOnly />
                  </label>
                  <label className="field-label">
                    {t("product.inquiry.quantity")}
                    <input className="field" value={formatNumber(selectedLines[0].quantity)} readOnly />
                  </label>
                </div>
              )}
              <div className="form-grid">
                <label className="field-label">
                  {t("product.inquiry.name")}
                  <input
                    className="field"
                    value={form.name}
                    onChange={update("name")}
                    placeholder={t("product.inquiry.namePlaceholder")}
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errorFor("name")}
                </label>
                <label className="field-label">
                  {t("product.inquiry.phone")}
                  <input
                    className="field"
                    type="tel"
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="01XXXXXXXXX"
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errorFor("phone")}
                </label>
              </div>
              <label className="field-label">
                {t("product.inquiry.address")}
                <input
                  className="field"
                  value={form.address}
                  onChange={update("address")}
                  placeholder={t("product.inquiry.addressPlaceholder")}
                  autoComplete="street-address"
                  aria-invalid={Boolean(errors.address)}
                />
                {errorFor("address")}
              </label>
              <label className="field-label">
                {t("product.inquiry.note")}
                <textarea className="textarea" value={form.note} onChange={update("note")} placeholder={t("product.inquiry.notePlaceholder")} />
              </label>
              <button className="button primary" type="submit">
                {t("product.inquiry.submit")}
              </button>
              <p className="page-lede modal-helper">{t("product.inquiry.helper")}</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
