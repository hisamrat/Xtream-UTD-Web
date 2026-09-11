import type { Metadata } from "next";
import { ProductWorld } from "@/components/world/ProductWorld";
import { siteConfig } from "@/config/site";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Xtream UTD",
  description: siteConfig.description
};

export default function HomePage() {
  return (
    <main className="home-main">
      <ProductWorld products={getAllProducts()} />
    </main>
  );
}
