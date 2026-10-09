"use client";

import { useCallback, useRef, useState, type MouseEvent } from "react";
import { ZoomIn } from "lucide-react";
import type { Product } from "@/domain/product/product-schema";
import { ProductImage } from "@/features/product/components/ProductImage";
import type { TranslationKey } from "@/i18n/dictionary";
import { useI18n } from "@/i18n/LanguageProvider";

const thumbnailLabels: TranslationKey[] = [
  "product.details.viewFront",
  "product.details.viewAngle",
  "product.details.viewSide",
  "product.details.viewDetail"
];

export function ProductGallery({ product }: { product: Product }) {
  const { t } = useI18n();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHoverZoomed, setIsHoverZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const galleryMainRef = useRef<HTMLDivElement>(null);

  // Gallery images in sheet order, falling back to the cover image.
  const galleryItems = product.gallery_images.length > 0 ? product.gallery_images : [product.cover_image];

  const handleMouseEnter = useCallback(() => {
    setIsHoverZoomed(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = galleryMainRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomOrigin({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHoverZoomed(false);
    setZoomOrigin({ x: 50, y: 50 });
  }, []);

  return (
    <div className="details-gallery">
      <div
        ref={galleryMainRef}
        className={`gallery-main ${isHoverZoomed ? "is-hover-zoomed" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-label={t("product.details.previewAria", { title: product.title })}
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          minHeight: "unset",
          height: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          cursor: "zoom-in"
        }}
      >
        <div
          className={`gallery-rotator ${isHoverZoomed ? "is-zoomed" : ""}`}
          role="img"
          aria-label={t("product.details.previewAria", { title: product.title })}
          style={{
            width: "100%",
            height: "100%",
            aspectRatio: "1 / 1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
            transform: isHoverZoomed ? "scale(2.2)" : "scale(1)",
            transition: isHoverZoomed
              ? "transform 0.08s ease-out"
              : "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: "none"
          }}
        >
          <ProductImage
            product={product}
            viewIndex={selectedIndex}
            imageRole={selectedIndex === 0 ? "main" : "gallery"}
            imageSrc={galleryItems[selectedIndex]}
            targetWidth={1200}
            priority
          />
        </div>

        {/* Bottom-right Zoom Indicator (standalone icon) */}
        <div className="gallery-zoom-badge" aria-hidden="true" title={t("product.details.zoomImage")}>
          <ZoomIn size={22} className="zoom-icon" />
        </div>
      </div>

      {galleryItems.length > 1 ? (
        <div className="thumbnail-strip" aria-label={t("product.details.galleryAria")}>
          {galleryItems.map((thumbnailSrc, index) => {
            const viewLabel = thumbnailLabels[index];
            return (
              <button
                key={`${thumbnailSrc}-${index}`}
                className={`thumbnail-button ${selectedIndex === index ? "is-selected" : ""}`}
                type="button"
                aria-pressed={selectedIndex === index}
                onClick={() => setSelectedIndex(index)}
                aria-label={`${product.title} ${
                  viewLabel ? t(viewLabel) : t("product.details.galleryImage", { number: index + 1 })
                }`}
              >
                <ProductImage
                  product={product}
                  viewIndex={index}
                  isThumbnail
                  imageRole={index === 0 ? "main" : "thumbnail"}
                  imageSrc={thumbnailSrc}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
