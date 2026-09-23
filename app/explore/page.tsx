import type { Metadata } from "next";
import { ExploreClient } from "@/components/explore/ExploreClient";
import { siteConfig } from "@/config/site";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Explore Products",
  description: siteConfig.description
};

export default function ExplorePage() {
  return <ExploreClient products={getAllProducts()} />;
}

