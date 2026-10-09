"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { OrderLine } from "@/domain/commerce/order-message";
import { getDefaultVariant, type ProductSummary } from "@/domain/product/product-summary";
import { useCatalogue } from "@/features/product/state/CatalogueProvider";
import { readStored, useStoredString, writeStored } from "@/shared/lib/stored-value";
import { addLine, CART_STORAGE_KEY, type CartLine, parseStoredCart, setLineQuantity } from "./cart-storage";

export type CartItem = {
  product: ProductSummary;
  variant: string;
  quantity: number;
};

type CartContextValue = {
  /** Lines resolved against the current catalogue (unknown products are hidden, not deleted). */
  items: CartItem[];
  addItem: (product: Pick<ProductSummary, "slug" | "colours" | "sizes_or_variants">, variant?: string, quantity?: number) => void;
  addItems: (items: Array<{ product: Pick<ProductSummary, "slug" | "colours" | "sizes_or_variants">; variant?: string; quantity?: number }>) => void;
  removeItem: (slug: string, variant: string) => void;
  updateQuantity: (slug: string, variant: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  orderLines: OrderLine[];
};

type CartPanelContextValue = {
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/** Applies `update` to the stored cart lines (localStorage is the source of truth). */
function setLines(update: (current: CartLine[]) => CartLine[]): void {
  const current = parseStoredCart(readStored("local", CART_STORAGE_KEY));
  writeStored("local", CART_STORAGE_KEY, JSON.stringify(update(current)));
}
const CartPanelContext = createContext<CartPanelContextValue | null>(null);

/** Cart state. Stored lines are resolved against the current catalogue for prices and titles. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const catalogue = useCatalogue();
  const [storedCart] = useStoredString("local", CART_STORAGE_KEY);
  const lines = useMemo(() => parseStoredCart(storedCart), [storedCart]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const addItems = useCallback<CartContextValue["addItems"]>((itemsToAdd) => {
    setLines((current) => {
      let next = current;
      for (const item of itemsToAdd) {
        next = addLine(next, item.product.slug, item.variant || getDefaultVariant(item.product), item.quantity ?? 1);
      }
      return next;
    });
    setIsCartOpen(true);
  }, []);

  const addItem = useCallback<CartContextValue["addItem"]>(
    (product, variant, quantity = 1) => {
      addItems([{ product, variant, quantity }]);
    },
    [addItems]
  );

  const removeItem = useCallback((slug: string, variant: string) => {
    setLines((current) => setLineQuantity(current, slug, variant, 0));
  }, []);

  const updateQuantity = useCallback((slug: string, variant: string, quantity: number) => {
    setLines((current) => setLineQuantity(current, slug, variant, quantity));
  }, []);

  const clearCart = useCallback(() => setLines(() => []), []);

  const cart = useMemo<CartContextValue>(() => {
    const bySlug = new Map(catalogue.map((product) => [product.slug, product]));
    const items = lines.flatMap((line) => {
      const product = bySlug.get(line.slug);
      return product ? [{ product, variant: line.variant, quantity: line.quantity }] : [];
    });

    return {
      items,
      addItem,
      addItems,
      removeItem,
      updateQuantity,
      clearCart,
      totalCount: items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      orderLines: items.map((item) => ({
        title: item.product.title,
        variant: item.variant,
        quantity: item.quantity,
        unitPrice: item.product.price
      }))
    };
  }, [catalogue, lines, addItem, addItems, removeItem, updateQuantity, clearCart]);

  const panel = useMemo<CartPanelContextValue>(
    () => ({
      isCartOpen,
      isCheckoutOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      openCheckout: () => {
        setIsCartOpen(false);
        setIsCheckoutOpen(true);
      },
      closeCheckout: () => setIsCheckoutOpen(false)
    }),
    [isCartOpen, isCheckoutOpen]
  );

  return (
    <CartContext.Provider value={cart}>
      <CartPanelContext.Provider value={panel}>{children}</CartPanelContext.Provider>
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function useCartPanel(): CartPanelContextValue {
  const context = useContext(CartPanelContext);
  if (!context) {
    throw new Error("useCartPanel must be used within a CartProvider");
  }
  return context;
}
