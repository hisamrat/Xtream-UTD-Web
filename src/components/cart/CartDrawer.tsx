"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2, X } from "lucide-react";
import { ProductArtwork } from "@/components/products/ProductArtwork";
import { formatPrice } from "@/lib/format";
import { useLanguage } from "@/components/site/LanguageProvider";
import { useCart } from "./CartProvider";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, totalCount, totalPrice, openCheckout } = useCart();
  const { language, formatNumber } = useLanguage();

  useEffect(() => {
    document.body.classList.toggle("modal-open", isOpen);
    return () => document.body.classList.remove("modal-open");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-backdrop" role="dialog" aria-modal="true" aria-label="Shopping Cart">
      <div className="cart-drawer-scrim" onClick={closeCart} aria-hidden="true" />
      <aside className="cart-drawer-panel">
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-header-title-row">
            <h2>{language === "bn" ? "শপিং কার্ট" : "Your Shopping Cart"}</h2>
            <span className="cart-count-badge">{formatNumber(totalCount)}</span>
          </div>
          <button
            className="cart-close-btn"
            type="button"
            onClick={closeCart}
            aria-label={language === "bn" ? "কার্ট বন্ধ করুন" : "Close cart"}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        {items.length > 0 ? (
          <>
            <div className="cart-drawer-body">
              {items.map((item) => (
                <div className="cart-item-card" key={`${item.product.id}-${item.variant}`}>
                  <div className="cart-item-media">
                    <ProductArtwork product={item.product} compact />
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-header">
                      <h3 className="cart-item-title">{item.product.title}</h3>
                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => removeItem(item.product.id, item.variant)}
                        aria-label={`Remove ${item.product.title} from cart`}
                        title={language === "bn" ? "প্রোডাক্ট মুছুন" : "Remove item"}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>

                    <div className="cart-item-meta">
                      <span className="cart-item-variant">{item.variant}</span>
                      <span className="cart-item-unit-price">
                        {formatPrice(item.product.price)}
                        <span className="cart-unit-label">
                          {language === "bn" ? " / প্রতি" : " / item"}
                        </span>
                      </span>
                    </div>

                    <div className="cart-item-actions">
                      <div className="quantity-row-sm" role="group" aria-label="Quantity">
                        <button
                          type="button"
                          className="quantity-btn-sm"
                          onClick={() => updateQuantity(item.product.id, item.variant, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} aria-hidden="true" />
                        </button>
                        <span className="quantity-val-sm">{formatNumber(item.quantity)}</span>
                        <button
                          type="button"
                          className="quantity-btn-sm"
                          onClick={() => updateQuantity(item.product.id, item.variant, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} aria-hidden="true" />
                        </button>
                      </div>

                      <div className="cart-item-total-block">
                        <span className="cart-item-total-label">
                          {language === "bn" ? "মোট:" : "Total:"}
                        </span>
                        <strong className="cart-item-total-val">
                          {formatPrice(item.product.price * item.quantity)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="cart-drawer-footer">
              <div className="cart-summary-row">
                <span className="summary-label">{language === "bn" ? "সর্বমোট মূল্য:" : "Subtotal:"}</span>
                <span className="summary-val">{formatPrice(totalPrice)}</span>
              </div>
              <p className="cart-delivery-note">
                {language === "bn"
                  ? "১০০% অথেনটিক প্রোডাক্ট গ্যারান্টি • সারাদেশে ক্যাশ অন ডেলিভারি • ৬৪টি জেলায় ২–৩ দিনের মধ্যে হোম ডেলিভারি।"
                  : "100% Authentic Product Guarantee • Cash on Delivery Available Nationwide • Home Delivery Available Across All 64 Districts Within 2–3 Days."}
              </p>
              <div className="cart-footer-actions">
                <button
                  type="button"
                  onClick={openCheckout}
                  className="button primary cart-checkout-btn"
                >
                  <ShoppingCart size={18} aria-hidden="true" />
                  <span>{language === "bn" ? "চেকআউট করুন" : "Proceed to Checkout"}</span>
                </button>
                <button type="button" className="pill-button clear-cart-btn" onClick={clearCart}>
                  {language === "bn" ? "কার্ট মুছুন" : "Clear Cart"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="cart-empty-state">
            <ShoppingBag size={48} className="empty-cart-icon" aria-hidden="true" />
            <h3>{language === "bn" ? "আপনার কার্ট খালি" : "Your cart is empty"}</h3>
            <p>
              {language === "bn"
                ? "আমাদের কালেকশন থেকে আপনার পছন্দের গ্যাজেট ও এক্সেসরিজ নির্বাচন করুন।"
                : "Explore our collection and add creator gear and gadgets to your cart."}
            </p>
            <Link href="/products" className="button primary" onClick={closeCart}>
              {language === "bn" ? "সব প্রোডাক্ট দেখুন" : "Browse Products"}
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}

