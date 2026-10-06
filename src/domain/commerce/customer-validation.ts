import { isValidBdMobile } from "./phone";

export type CustomerFieldError = "required" | "invalidPhone";

export type CustomerFieldErrors<Field extends string> = Partial<Record<Field, CustomerFieldError>>;

/**
 * Validates customer form values. `required` lists fields that must be non-empty;
 * a field named `phone` is additionally checked as a Bangladeshi mobile number.
 */
export function validateCustomerFields<Values extends Record<string, unknown>, Field extends keyof Values & string>(
  values: Values,
  required: readonly Field[]
): CustomerFieldErrors<Field> {
  const errors: CustomerFieldErrors<Field> = {};

  for (const field of required) {
    const raw = values[field];
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      errors[field] = "required";
    } else if (field === "phone" && !isValidBdMobile(value)) {
      errors[field] = "invalidPhone";
    }
  }

  return errors;
}

export function hasErrors(errors: Partial<Record<string, CustomerFieldError>>): boolean {
  return Object.keys(errors).length > 0;
}
