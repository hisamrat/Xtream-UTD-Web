import type { Metadata } from "next";
import { CatalogueView } from "@/features/catalogue/components/CatalogueView";
import { parseCatalogueQuery, type SearchParamsRecord } from "@/features/catalogue/lib/catalogue-query";
import { getProductSummaries } from "@/server/catalog/get-catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Products",
  description: "Browse Xtream UTD products by category, price, availability, and features."
};

type ProductsPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [params, products] = await Promise.all([searchParams, getProductSummaries()]);

  return (
    <main className="page-main products-page-main catalogue-page-main">
      <CatalogueView products={products} initialFilters={parseCatalogueQuery(params)} />
    </main>
  );
}
