import type { DeliveryZoneId } from "@/config/commerce";
import { DEFAULT_DELIVERY_ZONE } from "@/domain/commerce/delivery";
import { type CustomerFieldErrors, validateCustomerFields } from "@/domain/commerce/customer-validation";
import type { OrderCustomer } from "@/domain/commerce/order-message";

export type CheckoutTextField = "firstName" | "lastName" | "phone" | "address" | "thana" | "district" | "note";

export type CheckoutFormValues = Record<CheckoutTextField, string> & { deliveryZone: DeliveryZoneId };

export const initialCheckoutForm: CheckoutFormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  deliveryZone: DEFAULT_DELIVERY_ZONE,
  address: "",
  thana: "",
  district: "",
  note: ""
};

const requiredFields = ["firstName", "lastName", "phone", "address", "thana", "district"] as const;

export type CheckoutErrors = CustomerFieldErrors<CheckoutTextField>;

export function validateCheckout(values: CheckoutFormValues): CheckoutErrors {
  return validateCustomerFields(values, requiredFields);
}

export function toOrderCustomer(values: CheckoutFormValues): OrderCustomer {
  return {
    name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
    phone: values.phone,
    address: values.address,
    thana: values.thana,
    district: values.district,
    note: values.note
  };
}
