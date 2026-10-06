"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2, X } from "lucide-react";
import { commerceConfig } from "@/config/commerce";
import { formatPrice } from "@/domain/commerce/money";
import { ProductImage } from "@/features/product/components/ProductImage";
import { useI18n } from "@/i18n/LanguageProvider";
import { useDialog } from "@/shared/hooks/useDialog";
import { useCart, useCartPanel } from "../state/CartProvider";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, totalCount, totalPrice } = useCart();
  const { isCartOpen, closeCart, openCheckout } = useCartPanel();
  const { t, formatNumber } = useI18n();
  const dialogRef = useDialog({ open: isCartOpen, onClose: closeCart });

  if (!isCartOpen) return null;

  const { districtsCovered, nationwideDeliveryDays } = commerceConfig;

  return (
    <div ref={dialogRef} className="cart-drawer-backdrop" role="dialog" aria-modal="true" aria-label={t("label.cart")}>
      <div className="cart-drawer-scrim" onClick={closeCart} aria-hidden="true" />
      <aside className="cart-drawer-panel">
        <div className="cart-drawer-header">
          <div className="cart-header-title-row">
            <h2>{t("cart.drawer.title")}</h2>
            <span className="cart-count-badge">{formatNumber(totalCount)}</span>
          </div>
          <button className="cart-close-btn" type="button" onClick={closeCart} aria-label={t("cart.drawer.close")}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {items.length > 0 ? (
          <>
            <div className="cart-drawer-body">
              {items.map((item) => (
                <div className="cart-item-card" key={`${item.product.slug}-${item.variant}`}>
                  <div className="cart-item-media">
                    <ProductImage product={item.product} compact />
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-header">
                      <h3 className="cart-item-title">{item.product.title}</h3>
                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => removeItem(item.product.slug, item.variant)}
                        aria-label={t("cart.drawer.removeAria", { title: item.product.title })}
                        title={t("cart.drawer.remove")}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>

                    <div className="cart-item-meta">
                      <span className="cart-item-variant">{item.variant}</span>
                      <span className="cart-item-unit-price">
                        {formatPrice(item.product.price)}
                        <span className="cart-unit-label">{t("cart.drawer.perItem")}</span>
                      </span>
                    </div>

                    <div className="cart-item-actions">
                      <div className="quantity-row-sm" role="group" aria-label={t("cart.quantity.group")}>
                        <button
                          type="button"
                          className="quantity-btn-sm"
                          onClick={() => updateQuantity(item.product.slug, item.variant, item.quantity - 1)}
                          aria-label={t("cart.quantity.decrease")}
                        >
                          <Minus size={13} aria-hidden="true" />
                        </button>
                        <span className="quantity-val-sm">{formatNumber(item.quantity)}</span>
                        <button
                          type="button"
                          className="quantity-btn-sm"
                          onClick={() => updateQuantity(item.product.slug, item.variant, item.quantity + 1)}
                          aria-label={t("cart.quantity.increase")}
                        >
                          <Plus size={13} aria-hidden="true" />
                        </button>
                      </div>

                      <div className="cart-item-total-block">
                        <span className="cart-item-total-label">{t("cart.drawer.lineTotal")}</span>
                        <strong className="cart-item-total-val">{formatPrice(item.product.price * item.quantity)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-drawer-footer">
              <div className="cart-summary-row">
                <span className="summary-label">{t("cart.drawer.subtotal")}</span>
                <span className="summary-val">{formatPrice(totalPrice)}</span>
              </div>
              <p className="cart-delivery-note">
                {t("cart.drawer.note", {
                  districts: districtsCovered,
                  min: nationwideDeliveryDays.min,
                  max: nationwideDeliveryDays.max
                })}
              </p>
              <div className="cart-footer-actions">
                <button type="button" onClick={openCheckout} className="button primary cart-checkout-btn">
                  <ShoppingCart size={18} aria-hidden="true" />
                  <span>{t("cart.drawer.checkout")}</span>
                </button>
                <button type="button" className="button light clear-cart-btn" onClick={clearCart}>
                  <Trash2 size={15} aria-hidden="true" />
                  <span>{t("cart.drawer.clear")}</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="cart-empty-state">
            <ShoppingBag size={48} className="empty-cart-icon" aria-hidden="true" />
            <h3>{t("cart.drawer.emptyTitle")}</h3>
            <p>{t("cart.drawer.emptyDesc")}</p>
            <Link href="/products" className="button primary" onClick={closeCart}>
              {t("action.browseProducts")}
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
