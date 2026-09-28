import type { Metadata } from "next";
import { ExploreClient } from "@/components/explore/ExploreClient";
import { siteConfig } from "@/config/site";
import { fetchAllProducts } from "@/lib/products-server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Explore Products",
  description: siteConfig.description
};

export default async function ExplorePage() {
  const products = await fetchAllProducts();
  return <ExploreClient products={products} />;
}
