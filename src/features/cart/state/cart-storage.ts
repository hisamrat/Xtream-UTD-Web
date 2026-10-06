import { z } from "zod";

export const CART_STORAGE_KEY = "xtream-shopping-cart";

export type CartLine = {
  slug: string;
  variant: string;
  quantity: number;
};

const cartLineSchema = z.object({
  slug: z.string().min(1),
  variant: z.string(),
  quantity: z.number().int().positive()
});

/** Earlier versions stored the whole product object in each line. */
const legacyCartLineSchema = z.object({
  product: z.object({ slug: z.string().min(1) }),
  variant: z.string(),
  quantity: z.number().int().positive()
});

export const storedCartSchema = z
  .array(z.union([cartLineSchema, legacyCartLineSchema]))
  .transform((lines): CartLine[] =>
    lines.map((line) =>
      "product" in line ? { slug: line.product.slug, variant: line.variant, quantity: line.quantity } : line
    )
  );

/** Parses the stored cart JSON; anything invalid yields an empty cart. */
export function parseStoredCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const result = storedCartSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function isSameLine(line: CartLine, slug: string, variant: string): boolean {
  return line.slug === slug && line.variant === variant;
}

export function addLine(lines: readonly CartLine[], slug: string, variant: string, quantity: number): CartLine[] {
  const existing = lines.find((line) => isSameLine(line, slug, variant));
  if (existing) {
    return lines.map((line) =>
      isSameLine(line, slug, variant) ? { ...line, quantity: line.quantity + quantity } : line
    );
  }
  return [...lines, { slug, variant, quantity }];
}

export function setLineQuantity(lines: readonly CartLine[], slug: string, variant: string, quantity: number): CartLine[] {
  if (quantity <= 0) {
    return lines.filter((line) => !isSameLine(line, slug, variant));
  }
  return lines.map((line) => (isSameLine(line, slug, variant) ? { ...line, quantity } : line));
}
