import type { Metadata } from "next";
import { ProductWorld } from "@/components/world/ProductWorld";
import { siteConfig } from "@/config/site";
import { fetchAllProducts } from "@/lib/products-server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Xtream UTD",
  description: siteConfig.description
};

export default async function HomePage() {
  const products = await fetchAllProducts();
  return (
    <main className="home-main">
      <ProductWorld products={products} />
    </main>
  );
}
