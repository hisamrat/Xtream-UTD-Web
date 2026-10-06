import type { Metadata } from "next";
import { getCategories } from "@/domain/product/categories";
import { AboutView } from "@/features/content-pages/components/AboutView";
import { getProductSummaries } from "@/server/catalog/get-catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Xtream UTD products, categories, support, and business details."
};

export default async function AboutPage() {
  const categories = getCategories(await getProductSummaries());
  return <AboutView categories={categories} />;
}
