const takaNumberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Bangladeshi taka, e.g. `৳1,290`. */
export function formatPrice(value: number): string {
  return `৳${takaNumberFormat.format(value)}`;
}
