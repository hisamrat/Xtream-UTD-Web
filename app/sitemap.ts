import type { MetadataRoute } from "next";
import { hasProductionUrl, siteConfig } from "@/config/site";
import { getProducts } from "@/server/catalog/get-catalog";

export const revalidate = 3600;

/** Empty until `siteConfig.url` is set to the real domain (sitemaps need absolute URLs). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!hasProductionUrl) {
    return [];
  }

  const pages = ["", "/products", "/explore", "/about", "/contact", "/terms"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: "weekly" as const
  }));
  const products = (await getProducts()).map((product) => ({
    url: `${siteConfig.url}/products/${product.slug}`,
    changeFrequency: "daily" as const
  }));

  return [...pages, ...products];
}
