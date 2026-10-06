"use client";

import { useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { hasErrors } from "@/domain/commerce/customer-validation";
import { getDeliveryFee } from "@/domain/commerce/delivery";
import { buildMessengerUrl, buildOrderMessage } from "@/domain/commerce/order-message";
import { useI18n } from "@/i18n/LanguageProvider";
import { useDialog } from "@/shared/hooks/useDialog";
import { useCart, useCartPanel } from "../../state/CartProvider";
import { type CheckoutErrors, type CheckoutFormValues, initialCheckoutForm, toOrderCustomer, validateCheckout } from "./checkout-form";
import { CheckoutCustomerFields } from "./CheckoutCustomerFields";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";
import { CheckoutSuccess } from "./CheckoutSuccess";

export function CheckoutDialog() {
  const { isCheckoutOpen, closeCheckout } = useCartPanel();
  const { orderLines, totalPrice, clearCart, items } = useCart();
  const { t } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useDialog({ open: isCheckoutOpen, onClose: closeCheckout, initialFocusRef: closeRef });

  const [form, setForm] = useState<CheckoutFormValues>(initialCheckoutForm);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  /** Snapshot of the message that was sent to Messenger (the cart is cleared afterwards). */
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const deliveryFee = getDeliveryFee(form.deliveryZone);
  const orderMessage = useMemo(
    () => buildOrderMessage({ lines: orderLines, customer: toOrderCustomer(form), deliveryZone: form.deliveryZone }),
    [form, orderLines]
  );

  if (!isCheckoutOpen) return null;

  const handleClose = () => {
    if (sentMessage !== null) {
      setSentMessage(null);
      setForm(initialCheckoutForm);
      setErrors({});
    }
    closeCheckout();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateCheckout(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors) || items.length === 0) {
      return;
    }

    setSentMessage(orderMessage);
    window.open(buildMessengerUrl(siteConfig.order.messengerUrl, orderMessage), "_blank", "noopener,noreferrer");
    clearCart();
  };

  return (
    <div ref={dialogRef} className="checkout-modal-backdrop" role="dialog" aria-modal="true" aria-label={t("cart.checkout.dialogAria")}>
      <div className="checkout-modal-scrim" onClick={handleClose} aria-hidden="true" />
      <div className="checkout-modal-panel">
        <div className="checkout-modal-header">
          <div className="checkout-title-group">
            <h2>{t("cart.checkout.title")}</h2>
          </div>
          <button
            ref={closeRef}
            className="checkout-modal-close-btn"
            type="button"
            onClick={handleClose}
            aria-label={t("cart.checkout.close")}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {sentMessage !== null ? (
          <CheckoutSuccess message={sentMessage} />
        ) : (
          <form className="checkout-grid-layout" onSubmit={handleSubmit} noValidate>
            <CheckoutCustomerFields form={form} errors={errors} onChange={setForm} />
            <CheckoutOrderSummary
              deliveryZone={form.deliveryZone}
              deliveryFee={deliveryFee}
              subtotal={totalPrice}
              orderMessage={orderMessage}
            />
          </form>
        )}
      </div>
    </div>
  );
}
