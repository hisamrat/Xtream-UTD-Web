import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailsClient } from "@/components/details/ProductDetailsClient";
import { getAllProducts, getProductBySlug, getRelatedProducts } from "@/lib/products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found"
    };
  }

  return {
    title: product.title,
    description: product.short,
    openGraph: {
      title: `${product.title} | Xtream UTD`,
      description: product.short,
      type: "website"
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const products = getAllProducts();
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="page-main details-page-main">
      <ProductDetailsClient product={product} relatedProducts={getRelatedProducts(product)} allProducts={products} />
    </main>
  );
}
