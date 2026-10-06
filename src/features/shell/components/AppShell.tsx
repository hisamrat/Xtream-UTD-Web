import type { ProductSummary } from "@/domain/product/product-summary";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { CheckoutDialog } from "@/features/cart/components/checkout/CheckoutDialog";
import { CartProvider } from "@/features/cart/state/CartProvider";
import { CatalogueProvider } from "@/features/product/state/CatalogueProvider";
import { BottomDock } from "./BottomDock";
import { Footer } from "./Footer";
import { Header } from "./Header";

type AppShellProps = {
  catalogue: ProductSummary[];
  children: React.ReactNode;
};

/** Site chrome shared by every page: header, footer, bottom dock, cart and checkout. */
export function AppShell({ catalogue, children }: AppShellProps) {
  return (
    <CatalogueProvider products={catalogue}>
      <CartProvider>
        <div className="site-shell">
          <Header />
          {children}
          <Footer />
          <BottomDock />
          <CartDrawer />
        </div>
        <CheckoutDialog />
      </CartProvider>
    </CatalogueProvider>
  );
}
