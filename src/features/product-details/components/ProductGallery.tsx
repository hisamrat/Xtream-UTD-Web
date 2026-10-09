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

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const updateZoomPosition = useCallback((clientX: number, clientY: number) => {
    const el = galleryMainRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setZoomOrigin({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHoverZoomed(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      updateZoomPosition(e.clientX, e.clientY);
    },
    [updateZoomPosition]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHoverZoomed(false);
    setZoomOrigin({ x: 50, y: 50 });
  }, []);

  const handleClick = useCallback(() => {
    setIsHoverZoomed((prev) => {
      if (prev) {
        setZoomOrigin({ x: 50, y: 50 });
        return false;
      }
      return true;
    });
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0];
      if (!touch) return;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      updateZoomPosition(touch.clientX, touch.clientY);
      setIsHoverZoomed(true);
    },
    [updateZoomPosition]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0];
      if (!touch) return;
      updateZoomPosition(touch.clientX, touch.clientY);
      if (!isHoverZoomed) {
        setIsHoverZoomed(true);
      }
    },
    [isHoverZoomed, updateZoomPosition]
  );

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches[0];
    const start = touchStartRef.current;
    if (touch && start) {
      const dx = Math.abs(touch.clientX - start.x);
      const dy = Math.abs(touch.clientY - start.y);
      const dt = Date.now() - start.time;
      // Quick stationary tap: toggle zoom
      if (dx < 8 && dy < 8 && dt < 300) {
        setIsHoverZoomed((prev) => {
          if (prev) {
            setZoomOrigin({ x: 50, y: 50 });
            return false;
          }
          return true;
        });
      } else {
        // Drag-to-zoom loupe gesture: reset smoothly upon lifting finger
        setIsHoverZoomed(false);
        setZoomOrigin({ x: 50, y: 50 });
      }
    } else {
      setIsHoverZoomed(false);
      setZoomOrigin({ x: 50, y: 50 });
    }
  }, []);

  const handleTouchCancel = useCallback(() => {
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
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
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
          cursor: isHoverZoomed ? "zoom-out" : "zoom-in",
          touchAction: isHoverZoomed ? "none" : "pan-y"
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
