import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasProductionUrl, siteConfig } from "@/config/site";
import { getRelatedProducts } from "@/domain/product/related-products";
import { toProductJsonLd } from "@/domain/product/structured-data";
import { ProductDetailsView } from "@/features/product-details/components/ProductDetailsView";
import { getProductBySlug, getProducts, getProductSummaries } from "@/server/catalog/get-catalog";

export const revalidate = 60;

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.title,
    description: product.short || undefined,
    ...(hasProductionUrl ? { alternates: { canonical: `/products/${product.slug}` } } : {}),
    openGraph: {
      title: `${product.title} | Xtream UTD`,
      description: product.short || undefined,
      type: "website",
      ...(product.cover_image ? { images: [{ url: product.cover_image, alt: product.title }] } : {})
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, summaries] = await Promise.all([getProductBySlug(slug), getProductSummaries()]);

  if (!product) {
    notFound();
  }

  const jsonLd = toProductJsonLd(product, hasProductionUrl ? `${siteConfig.url}/products/${product.slug}` : undefined);

  return (
    <main className="page-main details-page-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductDetailsView key={product.slug} product={product} relatedProducts={getRelatedProducts(product, summaries)} />
    </main>
  );
}
