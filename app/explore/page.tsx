import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { ExploreShowcase } from "@/features/showcase/explore/ExploreShowcase";
import { getGalleryItems, getProductSummaries } from "@/server/catalog/get-catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Explore Products",
  description: siteConfig.description
};

export default async function ExplorePage() {
  const [products, showcaseItems] = await Promise.all([getProductSummaries(), getGalleryItems()]);
  return <ExploreShowcase products={products} showcaseItems={showcaseItems} />;
}
