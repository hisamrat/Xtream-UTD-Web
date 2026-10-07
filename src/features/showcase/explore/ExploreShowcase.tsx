"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { GalleryShowcaseItem } from "@/domain/gallery/gallery-schema";
import type { ProductSummary } from "@/domain/product/product-summary";
import { TrustFeatures } from "@/features/brand/TrustPerks";
import { useI18n } from "@/i18n/LanguageProvider";
import { useScrollThreshold } from "@/shared/hooks/useScrollThreshold";
import { ScrollHint } from "../ScrollHint";
import { ExploreCarousel } from "./ExploreCarousel";
import { ExploreReviews } from "./ExploreReviews";
import { MediaMasonry } from "./MediaMasonry";
import { TopSelling } from "./TopSelling";

type ExploreShowcaseProps = {
  products: ProductSummary[];
  showcaseItems: GalleryShowcaseItem[];
};

export function ExploreShowcase({ products, showcaseItems }: ExploreShowcaseProps) {
  const router = useRouter();
  const { t } = useI18n();
  const isScrolledDown = useScrollThreshold(50);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    router.prefetch("/");
    router.prefetch("/products");
  }, [router]);

  const scrollToContent = () => {
    const target = document.querySelector(".explore-extra-sections");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
    }
  };

  return (
    <main className="explore-main">
      <ExploreCarousel products={products} />

      {/* Floating "scroll to explore" pill (small screens only, via CSS). */}
      <div className={`explore-mobile-scroll-controls ${isScrolledDown ? "is-hidden" : ""}`} aria-label={t("showcase.explore.scrollControlsAria")}>
        <button
          type="button"
          className="world-set-count explore-mobile-scroll-btn"
          onClick={scrollToContent}
          aria-label={t("showcase.explore.scrollButtonAria")}
          title={t("showcase.scrollToExplore")}
        >
          <ScrollHint label={t("showcase.scrollToExplore")} />
        </button>
      </div>

      <div className="explore-extra-sections">
        <TrustFeatures ids={["authentic", "dispatch", "cod", "supportChat"]} />
        <TopSelling products={products} />
        <MediaMasonry products={products} showcaseItems={showcaseItems} />
        <ExploreReviews />
      </div>
    </main>
  );
}
