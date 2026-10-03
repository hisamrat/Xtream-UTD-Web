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
      if (product.gallery_images && product.gallery_images[viewIndex]) {
        addUrl(product.gallery_images[viewIndex]);
      } else if (product.cover_image) {
        addUrl(product.cover_image);
      } else if (product.main_image) {
        addUrl(product.main_image);
      }
    } else {
      // Default / cover: prioritize cover_image, fallback to main_image, gallery
      if (product.cover_image) {
        addUrl(product.cover_image);
      } else if (product.main_image) {
        addUrl(product.main_image);
      } else if (product.gallery_images && product.gallery_images.length > 0) {
        addUrl(product.gallery_images[0]);
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
  const fitMode = imageRole === "gallery" ? "contain" : "cover";

  // Solid clean dark placeholder when no valid image or all candidate URLs failed
  if (showPlaceholder) {
    return (
      <div
        className={`product-placeholder-wrap ${compact ? "is-compact" : ""} ${className}`}
        aria-hidden="true"
      >
        <div className="product-placeholder-content">
          <Package
            size={compact ? 20 : isThumbnail ? 22 : 36}
            className="product-placeholder-icon"
            strokeWidth={1.25}
          />
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
      style={{ width: "100%", height: "100%", position: "relative" } as CSSProperties}
    >
      <div className={`product-real-image-wrap ${compact ? "is-compact" : ""} role-${imageRole}`}>
        {/* Solid dark underlay visible while image loads */}
        <div className="product-placeholder-underlay" aria-hidden="true">
          <div className="product-placeholder-content">
            <Package
              size={compact ? 20 : isThumbnail ? 22 : 36}
              className="product-placeholder-icon"
              strokeWidth={1.25}
            />
          </div>
        </div>

        {/* Real Product Image */}
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
            display: "block",
            position: "relative",
            zIndex: 2,
          }}
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="async"
          onError={handleImageError}
        />
      </div>
    </div>
  );
}

