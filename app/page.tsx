import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { HomeWorld } from "@/features/showcase/world/HomeWorld";
import { getProductSummaries } from "@/server/catalog/get-catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Xtream UTD",
  description: siteConfig.description
};

export default async function HomePage() {
  const products = await getProductSummaries();
  return (
    <main className="home-main">
      <HomeWorld products={products} />
    </main>
  );
}
