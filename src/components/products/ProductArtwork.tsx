"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/product-schema";
import type { CSSProperties } from "react";
import { getGoogleDriveImageCandidates } from "@/lib/image-utils";
import { Package } from "lucide-react";

type ProductArtworkProps = {
  product: Product;
  compact?: boolean;
  viewIndex?: number;
  isThumbnail?: boolean;
  imageRole?: "cover" | "main" | "gallery" | "thumbnail";
  imageSrc?: string;
  className?: string;
};

export function ProductArtwork({
  product,
  compact = false,
  viewIndex = 0,
  isThumbnail = false,
  imageRole = "cover",
  imageSrc,
  className = ""
}: ProductArtworkProps) {
  const accent = product.accent || "#3385FF";
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Resolve list of possible image URLs for Google Drive or direct links
  const candidateUrls = useMemo(() => {
    const list: string[] = [];

    const addUrl = (url?: string | null) => {
      if (!url) return;
      const trimmed = url.trim();
      if (!trimmed || trimmed.includes("/folders/")) return;

      const candidates = getGoogleDriveImageCandidates(trimmed);
      if (candidates.length > 0) {
        list.push(...candidates);
      } else {
        list.push(trimmed);
      }
    };

    if (imageSrc) {
      addUrl(imageSrc);
    } else if (imageRole === "gallery" || imageRole === "thumbnail") {
      if (product.gallery_images_url && product.gallery_images_url[viewIndex]) {
        addUrl(product.gallery_images_url[viewIndex]);
      } else if (product.poster_image_url) {
        addUrl(product.poster_image_url);
      }
    } else {
      // Default / cover: prioritize poster_image_url, fallback to first gallery image
      if (product.poster_image_url) {
        addUrl(product.poster_image_url);
      } else if (product.gallery_images_url && product.gallery_images_url.length > 0) {
        addUrl(product.gallery_images_url[0]);
      }
    }

    return Array.from(new Set(list));
  }, [product, imageRole, viewIndex, imageSrc]);

  useEffect(() => {
    setCandidateIndex(0);
    setHasError(false);
  }, [candidateUrls]);

  const activeSrc = candidateUrls[candidateIndex];

  const handleImageError = () => {
    if (candidateIndex < candidateUrls.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  const showPlaceholder = hasError || !activeSrc;

  if (showPlaceholder) {
    return (
      <div
        className={`product-placeholder-wrap ${compact ? "is-compact" : ""} ${className}`}
        style={{ "--art-accent": accent } as CSSProperties}
        aria-hidden="true"
      >
        <div className="product-placeholder-content">
          <Package
            size={compact ? 22 : isThumbnail ? 24 : 40}
            className="product-placeholder-icon"
            strokeWidth={1.5}
          />
        </div>
      </div>
    );
  }

  // Cards and thumbnails use "cover" for edge-to-edge full bleed.
  // Main gallery viewer in details page uses "contain" to prevent cropping detailed product shots.
  const fitMode = imageRole === "gallery" ? "contain" : "cover";

  return (
    <div
      aria-hidden="true"
      className={`product-art ${compact ? "product-art-compact" : "product-art-full"} ${
        isThumbnail ? "product-art-thumb" : ""
      } ${className}`}
      style={{ "--art-accent": accent } as CSSProperties}
    >
      <div className={`product-real-image-wrap ${compact ? "is-compact" : ""} role-${imageRole}`}>
        <img
          key={activeSrc}
          src={activeSrc}
          alt={product.title}
          className={`product-real-image ${isThumbnail ? "is-thumb" : ""}`}
          style={{
            objectFit: fitMode,
            objectPosition: "center",
            width: "100%",
            height: "100%",
            display: "block"
          }}
          referrerPolicy="no-referrer"
          loading={isThumbnail ? "eager" : "lazy"}
          decoding="async"
          onError={handleImageError}
        />
      </div>
    </div>
  );
}

