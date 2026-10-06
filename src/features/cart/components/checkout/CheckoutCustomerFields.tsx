"use client";

import { MapPin, Truck } from "lucide-react";
import type { DeliveryZoneId } from "@/config/commerce";
import { formatPrice } from "@/domain/commerce/money";
import { deliveryZones } from "@/domain/commerce/delivery";
import type { CustomerFieldError } from "@/domain/commerce/customer-validation";
import type { TranslationKey } from "@/i18n/dictionary";
import { useI18n } from "@/i18n/LanguageProvider";
import type { CheckoutErrors, CheckoutFormValues, CheckoutTextField } from "./checkout-form";

type CheckoutCustomerFieldsProps = {
  form: CheckoutFormValues;
  errors: CheckoutErrors;
  onChange: (next: CheckoutFormValues) => void;
};

const errorKeys: Record<Exclude<CheckoutTextField, "note">, Record<CustomerFieldError, TranslationKey>> = {
  firstName: { required: "cart.checkout.error.firstName", invalidPhone: "cart.checkout.error.firstName" },
  lastName: { required: "cart.checkout.error.lastName", invalidPhone: "cart.checkout.error.lastName" },
  phone: { required: "cart.checkout.error.phone", invalidPhone: "cart.checkout.error.phoneInvalid" },
  address: { required: "cart.checkout.error.address", invalidPhone: "cart.checkout.error.address" },
  thana: { required: "cart.checkout.error.thana", invalidPhone: "cart.checkout.error.thana" },
  district: { required: "cart.checkout.error.district", invalidPhone: "cart.checkout.error.district" }
};

const zoneIcons: Record<DeliveryZoneId, typeof MapPin> = { dhaka: MapPin, outside: Truck };

type TextFieldConfig = {
  field: Exclude<CheckoutTextField, "note">;
  label: TranslationKey;
  placeholder?: TranslationKey;
  type?: "tel";
};

export function CheckoutCustomerFields({ form, errors, onChange }: CheckoutCustomerFieldsProps) {
  const { t } = useI18n();

  const renderField = ({ field, label, placeholder, type }: TextFieldConfig) => {
    const error = errors[field];
    return (
      <div className="field-group">
        <label htmlFor={`checkout-${field}`} className="field-label">
          {t(label)}
        </label>
        <input
          id={`checkout-${field}`}
          className="field"
          type={type}
          value={form[field]}
          onChange={(event) => onChange({ ...form, [field]: event.target.value })}
          placeholder={placeholder ? t(placeholder) : "01712345678"}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `checkout-${field}-error` : undefined}
          autoComplete={field === "phone" ? "tel" : undefined}
        />
        {error ? (
          <span id={`checkout-${field}-error`} className="field-error">
            {t(errorKeys[field][error])}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <div className="checkout-form-column">
      <h3 className="checkout-section-title">
        <span>{t("cart.checkout.customerDetails")}</span>
      </h3>

      <div className="form-grid-2">
        {renderField({ field: "firstName", label: "cart.checkout.firstName", placeholder: "cart.checkout.firstNamePlaceholder" })}
        {renderField({ field: "lastName", label: "cart.checkout.lastName", placeholder: "cart.checkout.lastNamePlaceholder" })}
      </div>

      {renderField({ field: "phone", label: "cart.checkout.phone", type: "tel" })}

      <div className="field-group">
        <span className="field-label">{t("cart.checkout.deliveryLocation")}</span>
        <div className="delivery-zone-options">
          {deliveryZones.map((zone) => {
            const Icon = zoneIcons[zone.id];
            const selected = form.deliveryZone === zone.id;
            return (
              <label key={zone.id} className={`zone-card ${selected ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="deliveryZone"
                  value={zone.id}
                  checked={selected}
                  onChange={() => onChange({ ...form, deliveryZone: zone.id })}
                />
                <div className="zone-card-content">
                  <div className="zone-header">
                    <Icon size={16} aria-hidden="true" />
                    <strong>{t(`cart.checkout.zone.${zone.id}`)}</strong>
                  </div>
                  <span className="zone-fee">{formatPrice(zone.fee)}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {renderField({ field: "address", label: "cart.checkout.address", placeholder: "cart.checkout.addressPlaceholder" })}

      <div className="form-grid-2">
        {renderField({ field: "thana", label: "cart.checkout.thana", placeholder: "cart.checkout.thanaPlaceholder" })}
        {renderField({ field: "district", label: "cart.checkout.district", placeholder: "cart.checkout.districtPlaceholder" })}
      </div>

      <div className="field-group">
        <label htmlFor="checkout-note" className="field-label">
          {t("cart.checkout.note")}
        </label>
        <textarea
          id="checkout-note"
          className="textarea"
          rows={2}
          value={form.note}
          onChange={(event) => onChange({ ...form, note: event.target.value })}
          placeholder={t("cart.checkout.notePlaceholder")}
        />
      </div>
    </div>
  );
}
