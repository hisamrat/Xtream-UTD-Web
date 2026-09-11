import type { Product } from "@/lib/product-schema";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  compact?: boolean;
};

export function ProductGrid({ products, compact = false }: ProductGridProps) {
  return (
    <div className="product-grid" aria-live="polite">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} compact={compact} />
      ))}
    </div>
  );
}
