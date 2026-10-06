/** Bangladeshi mobile numbers: 01[3-9] followed by 8 digits (operator prefixes 013–019). */
const BD_MOBILE_PATTERN = /^01[3-9]\d{8}$/;

/** Strips spaces/dashes and a +88 / 88 country prefix. */
export function normalizeBdPhone(value: string): string {
  const compact = value.replace(/[\s-]+/g, "");
  return compact.replace(/^\+?88(?=01)/, "");
}

export function isValidBdMobile(value: string): boolean {
  return BD_MOBILE_PATTERN.test(normalizeBdPhone(value));
}
