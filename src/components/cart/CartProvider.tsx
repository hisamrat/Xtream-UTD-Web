"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/product-schema";
import { CheckoutModal } from "./CheckoutModal";

export type CartItem = {
  product: Product;
  variant: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  isCheckoutOpen: boolean;
  addItem: (product: Product, variant?: string, quantity?: number) => void;
  removeItem: (productId: string, variant: string) => void;
  updateQuantity: (productId: string, variant: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  totalCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "xtream-shopping-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, mounted]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const openCheckout = useCallback(() => {
    setIsOpen(false);
    setIsCheckoutOpen(true);
  }, []);
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);

  const addItem = useCallback(
    (product: Product, variant?: string, quantity: number = 1) => {
      const itemVariant = variant || product.colours[0] || product.sizes_or_variants[0] || "Standard";
      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (item) => item.product.id === product.id && item.variant === itemVariant
        );
        if (existingIndex > -1) {
          const next = [...prevItems];
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: next[existingIndex].quantity + quantity
          };
          return next;
        }
        return [...prevItems, { product, variant: itemVariant, quantity }];
      });
      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback((productId: string, variant: string) => {
    setItems((prev) => prev.filter((item) => !(item.product.id === productId && item.variant === variant)));
  }, []);

  const updateQuantity = useCallback((productId: string, variant: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => !(item.product.id === productId && item.variant === variant)));
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.variant === variant) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      isOpen,
      isCheckoutOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
      openCheckout,
      closeCheckout,
      totalCount,
      totalPrice
    }),
    [
      items,
      isOpen,
      isCheckoutOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
      openCheckout,
      closeCheckout,
      totalCount,
      totalPrice
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CheckoutModal open={isCheckoutOpen} onClose={closeCheckout} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

