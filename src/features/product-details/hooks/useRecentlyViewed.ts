"use client";

import { useEffect, useMemo } from "react";
import { z } from "zod";
import type { ProductSummary } from "@/domain/product/product-summary";
import { useCatalogue } from "@/features/product/state/CatalogueProvider";
import { useStoredString } from "@/shared/lib/stored-value";

const STORAGE_KEY = "xtream-recent-products";
const STORED_LIMIT = 8;
const SHOWN_LIMIT = 4;

const recentSlugsSchema = z.array(z.string());

function parseSlugs(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const result = recentSlugsSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

/** Records `currentSlug` as viewed and returns other recently viewed products (most recent first). */
export function useRecentlyViewed(currentSlug: string): ProductSummary[] {
  const catalogue = useCatalogue();
  const [stored, setStored] = useStoredString("local", STORAGE_KEY);
  const storedSlugs = useMemo(() => parseSlugs(stored), [stored]);

  useEffect(() => {
    if (storedSlugs[0] === currentSlug) return;
    const next = [currentSlug, ...storedSlugs.filter((slug) => slug !== currentSlug)].slice(0, STORED_LIMIT);
    setStored(JSON.stringify(next));
  }, [currentSlug, setStored, storedSlugs]);

  return useMemo(() => {
    const bySlug = new Map(catalogue.map((product) => [product.slug, product]));
    return storedSlugs
      .filter((slug) => slug !== currentSlug)
      .map((slug) => bySlug.get(slug))
      .filter((product): product is ProductSummary => product !== undefined)
      .slice(0, SHOWN_LIMIT);
  }, [catalogue, currentSlug, storedSlugs]);
}
