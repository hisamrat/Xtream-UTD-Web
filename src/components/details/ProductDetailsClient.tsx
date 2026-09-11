"use client";

import Link from "next/link";
import {
  Check,
  CheckCircle2,
  FileText,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ProductArtwork } from "@/components/products/ProductArtwork";
import { ProductCard } from "@/components/products/ProductCard";
import { PriceDisplay } from "@/components/products/PriceDisplay";
import { StockStatus } from "@/components/products/StockStatus";
import type { Product } from "@/lib/product-schema";
import { useLanguage } from "@/components/site/LanguageProvider";
import { useCart } from "@/components/cart/CartProvider";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { OrderInquiryModal } from "./OrderInquiryModal";

type ProductDetailsClientProps = {
  product: Product;
  relatedProducts: Product[];
  allProducts: Product[];
};

type GalleryDragState = {
  active: boolean;
  x: number;
};

export function ProductDetailsClient({ product, relatedProducts, allProducts }: ProductDetailsClientProps) {
  const { t, language, tCategory, formatNumber } = useLanguage();
  const { addItem, openCheckout } = useCart();
  const availableVariants = useMemo(
    () => (product.colours.length ? product.colours : product.sizes_or_variants),
    [product]
  );
  const [selectedVariant, setSelectedVariant] = useState(
    availableVariants[0] ?? "Standard"
  );
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [galleryRotation, setGalleryRotation] = useState(0);
  const [galleryRotating, setGalleryRotating] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [recentProductSlugs, setRecentProductSlugs] = useState<string[]>([]);
  const [cartAdded, setCartAdded] = useState(false);
  const galleryDragRef = useRef<GalleryDragState>({ active: false, x: 0 });

  const thumbnailLabels = useMemo(
    () => [
      language === "bn" ? "সামনের দৃশ্য" : "Front View",
      language === "bn" ? "৩৬০° এঙ্গেল দৃশ্য" : "360° Angle View",
      language === "bn" ? "পার্শ্ব দৃশ্য" : "Side View",
      language === "bn" ? "ডিটেইল ভিউ" : "Detail View"
    ],
    [language]
  );

  const thumbnails = useMemo(() => {
    const base = [product.main_image, ...product.gallery_images];
    const list: string[] = [...base];
    let i = 0;
    while (list.length < 4) {
      list.push(base[i % base.length] || product.main_image);
      i++;
    }
    return list.slice(0, 4);
  }, [product]);

  const handleSelectThumbnail = (index: number) => {
    setSelectedGalleryIndex(index);
    const angles = [0, 90, 180, 270];
    setGalleryRotation(angles[index % 4] ?? 0);
  };

  const recentlyViewedProducts = useMemo(
    () =>
      recentProductSlugs
        .map((slug) => allProducts.find((item) => item.slug === slug))
        .filter((item): item is Product => Boolean(item))
        .slice(0, 4),
    [allProducts, recentProductSlugs]
  );

  useEffect(() => {
    const stored = window.localStorage.getItem("xtream-recent-products");
    let current: string[] = [];
    if (stored) {
      try {
        current = JSON.parse(stored) as string[];
      } catch {
        window.localStorage.removeItem("xtream-recent-products");
      }
    }
    setRecentProductSlugs(current.filter((slug) => slug !== product.slug).slice(0, 4));
    const next = [product.slug, ...current.filter((slug) => slug !== product.slug)].slice(0, 8);
    window.localStorage.setItem("xtream-recent-products", JSON.stringify(next));
  }, [product.slug]);

  useEffect(() => {
    setSelectedGalleryIndex(0);
    setGalleryRotation(0);
  }, [product.slug]);

  const rotateGallery = (amount: number) => {
    setGalleryRotation((rotation) => normalizeRotation(rotation + amount));
  };

  const startGalleryRotation = (event: ReactPointerEvent<HTMLDivElement>) => {
    galleryDragRef.current = { active: true, x: event.clientX };
    setGalleryRotating(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveGalleryRotation = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!galleryDragRef.current.active) {
      return;
    }

    const delta = event.clientX - galleryDragRef.current.x;
    galleryDragRef.current.x = event.clientX;
    rotateGallery(delta * 1.15);
  };

  const endGalleryRotation = (event: ReactPointerEvent<HTMLDivElement>) => {
    galleryDragRef.current.active = false;
    setGalleryRotating(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleAddToCart = () => {
    if (product.stock === "Out of stock") return;
    addItem(product, selectedVariant, quantity);
    setCartAdded(true);
    window.setTimeout(() => setCartAdded(false), 1400);
  };

  const handleBuyNow = () => {
    if (product.stock === "Out of stock") return;
    addItem(product, selectedVariant, quantity);
    openCheckout();
  };

  const shareProduct = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.title, text: product.short, url });
      return;
    }

    await navigator.clipboard.writeText(url);
  };

  return (
    <>
      <section className="details-page">
        <Breadcrumb
          items={[
            { label: language === "bn" ? "প্রোডাক্টস" : "Products", href: "/products" },
            { label: tCategory(product.category), href: `/products?category=${encodeURIComponent(product.category)}` },
            { label: product.title }
          ]}
        />

        <div className="details-layout">
          {/* Left Column: Interactive 3D Showcase */}
          <div className="details-gallery">
            <div className={`gallery-main ${galleryRotating ? "is-rotating" : ""}`}>
              <div className="gallery-badge-360">
                <Sparkles size={13} className="text-accent" aria-hidden="true" />
                <span>{language === "bn" ? "৩৬০° ড্র্যাগ ভিউ" : "360° Drag to Rotate"}</span>
              </div>

              <div
                className="gallery-rotator"
                onPointerDown={startGalleryRotation}
                onPointerMove={moveGalleryRotation}
                onPointerUp={endGalleryRotation}
                onPointerCancel={endGalleryRotation}
                style={{ transform: `rotateY(${galleryRotation}deg)` }}
                role="img"
                aria-label={`${product.title} rotatable product preview`}
              >
                <ProductArtwork product={product} />
              </div>

              <div className="gallery-caption">
                <span>{thumbnailLabels[selectedGalleryIndex] || `Gallery image ${selectedGalleryIndex + 1}`}</span>
                <strong>{selectedGalleryIndex + 1} / 4</strong>
              </div>

              <div className="gallery-rotate-actions" aria-label="Rotate product preview">
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => rotateGallery(-45)}
                  aria-label="Rotate product left"
                  title="Rotate Left"
                >
                  <RotateCcw size={16} aria-hidden="true" />
                </button>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => rotateGallery(45)}
                  aria-label="Rotate product right"
                  title="Rotate Right"
                >
                  <RotateCw size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Thumbnail Navigation Row */}
            <div className="thumbnail-row" aria-label="Product gallery previews">
              {thumbnails.map((thumbnail, index) => (
                <button
                  key={`${thumbnail}-${index}`}
                  className="thumbnail-button"
                  type="button"
                  aria-pressed={selectedGalleryIndex === index}
                  onClick={() => handleSelectThumbnail(index)}
                  aria-label={`${product.title} ${thumbnailLabels[index] || `gallery image ${index + 1}`}`}
                >
                  <ProductArtwork product={product} compact />
                  <span className="thumbnail-index">{index + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: High-Converting Buy Box */}
          <aside className="details-panel panel">
            <div className="details-meta-top">
              <div className="details-category-pill">
                <Link href={`/products?category=${encodeURIComponent(product.category)}`}>
                  {tCategory(product.category)}
                </Link>
              </div>
              <StockStatus stock={product.stock} />
            </div>

            <h1 className="details-title">{product.title}</h1>

            <PriceDisplay product={product} showDiscount size="lg" />

            {/* Variant Selector */}
            {availableVariants.length > 0 ? (
              <div className="filter-section">
                <span className="filter-heading">
                  {language === "bn" ? "ভেরিয়েন্ট নির্বাচন করুন" : "SELECT VARIANT"}
                </span>
                <div className="variant-row" role="radiogroup" aria-label="Select variant">
                  {availableVariants.map((variant) => {
                    const isSelected = selectedVariant === variant;
                    return (
                      <button
                        key={variant}
                        className={`variant-chip ${isSelected ? "is-selected" : ""}`}
                        type="button"
                        aria-checked={isSelected}
                        aria-pressed={isSelected}
                        onClick={() => setSelectedVariant(variant)}
                      >
                        <span>{variant}</span>
                        {isSelected ? <Check size={14} className="variant-check-icon" aria-hidden="true" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Quantity Stepper */}
            <div className="filter-section">
              <span className="filter-heading">{language === "bn" ? "পরিমাণ" : "QUANTITY"}</span>
              <div className="quantity-row">
                <button
                  className="quantity-button"
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} aria-hidden="true" />
                </button>
                <span className="quantity-value">{formatNumber(quantity)}</span>
                <button
                  className="quantity-button"
                  type="button"
                  onClick={() => setQuantity((value) => value + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* High-Converting Action Buttons */}
            <div className="details-main-actions">
              <button
                className={`button primary add-to-cart-btn-main ${cartAdded ? "is-added" : ""}`}
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock === "Out of stock"}
              >
                {cartAdded ? (
                  <>
                    <Check size={18} aria-hidden="true" />
                    <span>{language === "bn" ? "কার্টে যোগ হয়েছে!" : "Added to Cart!"}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} aria-hidden="true" />
                    <span>{language === "bn" ? "কার্টে যোগ করুন" : "Add to Cart"}</span>
                  </>
                )}
              </button>

              <button
                className="button buy-now-btn-main"
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock === "Out of stock"}
              >
                <span>{language === "bn" ? "এখনই অর্ডার করুন" : "Order Now"}</span>
              </button>
            </div>

            <div className="details-secondary-actions">
              <button
                className="pill-button light details-inquiry-btn"
                type="button"
                onClick={() => setModalOpen(true)}
              >
                <MessageCircle size={16} aria-hidden="true" />
                <span>{language === "bn" ? "মেসেঞ্জারে ইনকোয়ারি" : "Messenger Inquiry"}</span>
              </button>

              <button
                className="pill-button light details-share-btn"
                type="button"
                onClick={shareProduct}
                title="Share Product"
              >
                <Share2 size={16} aria-hidden="true" />
                <span>{t("share")}</span>
              </button>
            </div>

            <div className="details-divider" aria-hidden="true" />

            {/* 2026 Reassurance & Guarantee Cards */}
            <div className="trust-guarantee-list">
              <div className="trust-guarantee-item">
                <Truck size={20} className="trust-icon" aria-hidden="true" />
                <div>
                  <strong>{language === "bn" ? "সারাদেশে ক্যাশ অন ডেলিভারি" : "Cash on Delivery Nationwide"}</strong>
                  <p>{language === "bn" ? "২-৩ দিনের মধ্যে সারাদেশে হোম ডেলিভারি।" : "Home delivery available nationwide within 2–3 days."}</p>
                </div>
              </div>
              <div className="trust-guarantee-item">
                <ShieldCheck size={20} className="trust-icon" aria-hidden="true" />
                <div>
                  <strong>{language === "bn" ? "১০০% অথেনটিক গ্যাজেট" : "100% Authentic Product Guarantee"}</strong>
                  <p>{language === "bn" ? "সেলার বা বিক্রেতার পক্ষ থেকে অর্ডার প্রসেসিং মেসেজ পাওয়ার পর অর্ডার চূড়ান্তভাবে কনফার্ম হবে।" : "Order will be confirmed after the order processing message from seller."}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Full-width Product Overview Paragraph Section */}
        <div className="details-overview-card">
          <h2 className="section-title-sm">
            <FileText size={17} className="text-accent" aria-hidden="true" />
            <span>{language === "bn" ? "প্রোডাক্ট বিবরণী" : "Product Overview"}</span>
          </h2>
          <p className="overview-paragraph">{product.short}</p>
        </div>

        {/* Features & Technical Specifications */}
        <div className="details-sections">
          <div className="details-card features-card">
            <h2 className="section-title-sm">
              <CheckCircle2 size={17} className="text-accent" aria-hidden="true" />
              <span>{t("product_features")}</span>
            </h2>
            <ul className="feature-list">
              {product.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
              <li>
                {language === "bn"
                  ? "ডেস্ক, বাসা এবং দৈনন্দিন ব্যবহারের জন্য আদর্শ"
                  : "Suitable for desks, studios and everyday routines"}
              </li>
            </ul>
          </div>

          <div className="details-card specs-card">
            <h2 className="section-title-sm">
              <ShieldCheck size={17} className="text-accent" aria-hidden="true" />
              <span>{language === "bn" ? "টেকনিক্যাল স্পেসিফিকেশন" : "Technical Specifications"}</span>
            </h2>
            <dl className="spec-list">
              <div>
                <dt>{language === "bn" ? "ক্যাটাগরি" : "Category"}</dt>
                <dd>{product.category}</dd>
              </div>
              <div>
                <dt>{language === "bn" ? "স্টক স্ট্যাটাস" : "Availability"}</dt>
                <dd>{product.stock}</dd>
              </div>
              <div>
                <dt>{language === "bn" ? "উপলব্ধ ভেরিয়েন্ট" : "Available Options"}</dt>
                <dd>{availableVariants.join(", ")}</dd>
              </div>
              <div>
                <dt>{language === "bn" ? "ডেলিভারি মেথড" : "Delivery"}</dt>
                <dd>Cash on Delivery Nationwide (2–3 Days)</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Related Products */}
        <section className="related-section">
          <div className="related-header">
            <p className="section-kicker">{t("related_products")}</p>
          </div>
          <div className="product-grid related-grid">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>

        {/* Recently Viewed Products */}
        {recentlyViewedProducts.length ? (
          <section className="related-section">
            <div className="related-header">
              <p className="section-kicker">{t("recently_viewed")}</p>
            </div>
            <div className="product-grid related-grid">
              {recentlyViewedProducts.map((recentProduct) => (
                <ProductCard key={recentProduct.id} product={recentProduct} />
              ))}
            </div>
          </section>
        ) : null}
      </section>

      <OrderInquiryModal
        product={product}
        variant={selectedVariant}
        quantity={quantity}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

function normalizeRotation(rotation: number): number {
  return ((rotation % 360) + 360) % 360;
}
