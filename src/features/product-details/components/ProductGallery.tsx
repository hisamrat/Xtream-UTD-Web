"use client";

import { useState } from "react";
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

  // Gallery images in sheet order, falling back to the cover image.
  const galleryItems = product.gallery_images.length > 0 ? product.gallery_images : [product.cover_image];

  return (
    <div className="details-gallery">
      <div
        className="gallery-main"
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          minHeight: "unset",
          height: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden"
        }}
      >
        <div
          className="gallery-rotator"
          role="img"
          aria-label={t("product.details.previewAria", { title: product.title })}
          style={{
            width: "100%",
            height: "100%",
            aspectRatio: "1 / 1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <ProductImage
            product={product}
            viewIndex={selectedIndex}
            imageRole={selectedIndex === 0 ? "main" : "gallery"}
            imageSrc={galleryItems[selectedIndex]}
            priority
          />
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
                aria-label={`${product.title} ${viewLabel ? t(viewLabel) : t("product.details.galleryImage", { number: index + 1 })}`}
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
