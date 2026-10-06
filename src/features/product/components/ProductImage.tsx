"use client";

import { useMemo, useState } from "react";
import { Package } from "lucide-react";
import type { Product } from "@/domain/product/product-schema";
import { collectImageCandidates } from "@/shared/media/google-drive";

export type ProductImageSource = Pick<Product, "title" | "cover_image" | "main_image"> & {
  gallery_images?: readonly string[];
};

type ProductImageProps = {
  product: ProductImageSource;
  compact?: boolean;
  viewIndex?: number;
  isThumbnail?: boolean;
  imageRole?: "cover" | "main" | "gallery" | "thumbnail";
  imageSrc?: string;
  className?: string;
  /** Load eagerly with high priority (above-the-fold images). */
  priority?: boolean;
};

function resolveSources(
  product: ProductImageSource,
  imageRole: NonNullable<ProductImageProps["imageRole"]>,
  viewIndex: number,
  imageSrc?: string
): string[] {
  if (imageSrc) {
    return collectImageCandidates([imageSrc]);
  }

  if (imageRole === "gallery" || imageRole === "thumbnail") {
    const galleryImage = product.gallery_images?.[viewIndex];
    return collectImageCandidates([galleryImage || product.cover_image || product.main_image]);
  }

  return collectImageCandidates([product.cover_image || product.main_image || product.gallery_images?.[0]]);
}

/**
 * Product photo with a mirror-URL fallback chain and a neutral placeholder when no image loads.
 * Decorative by design (`aria-hidden`): the surrounding control carries the accessible name.
 */
export function ProductImage({
  product,
  compact = false,
  viewIndex = 0,
  isThumbnail = false,
  imageRole = "cover",
  imageSrc,
  className = "",
  priority = false
}: ProductImageProps) {
  const candidateUrls = useMemo(
    () => resolveSources(product, imageRole, viewIndex, imageSrc),
    [product, imageRole, viewIndex, imageSrc]
  );
  const candidateKey = candidateUrls.join("|");
  const [failure, setFailure] = useState({ key: candidateKey, failedCount: 0 });
  const failedCount = failure.key === candidateKey ? failure.failedCount : 0;

  const activeSrc = candidateUrls[failedCount];
  const iconSize = compact ? 20 : isThumbnail ? 22 : 36;

  if (!activeSrc) {
    return (
      <div className={`product-placeholder-wrap ${compact ? "is-compact" : ""} ${className}`} aria-hidden="true">
        <div className="product-placeholder-content">
          <Package size={iconSize} className="product-placeholder-icon" strokeWidth={1.25} />
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`product-art ${compact ? "product-art-compact" : "product-art-full"} ${
        isThumbnail ? "product-art-thumb" : ""
      } ${className}`}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <div className={`product-real-image-wrap ${compact ? "is-compact" : ""} role-${imageRole}`}>
        <div className="product-placeholder-underlay" aria-hidden="true">
          <div className="product-placeholder-content">
            <Package size={iconSize} className="product-placeholder-icon" strokeWidth={1.25} />
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element -- remote Drive URLs need the manual fallback chain */}
        <img
          key={activeSrc}
          src={activeSrc}
          alt={product.title}
          className={`product-real-image ${isThumbnail ? "is-thumb" : ""}`}
          style={{
            objectFit: imageRole === "gallery" ? "contain" : "cover",
            objectPosition: "center",
            width: "100%",
            height: "100%",
            display: "block",
            position: "relative",
            zIndex: 2
          }}
          referrerPolicy="no-referrer"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onError={() => setFailure({ key: candidateKey, failedCount: failedCount + 1 })}
        />
      </div>
    </div>
  );
}
