"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, X, ExternalLink, ArrowUpRight, Sparkles, Film, Camera, Headphones, Layout } from "lucide-react";
import { useLanguage } from "@/components/site/LanguageProvider";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/product-schema";

export type MediaItem = {
  id: string;
  type: "video" | "image";
  title: {
    en: string;
    bn: string;
  };
  subtitle: {
    en: string;
    bn: string;
  };
  tag: string;
  category: "camera" | "audio" | "studio" | "lighting";
  aspectRatio: "portrait" | "tall" | "landscape" | "square";
  imageUrl: string;
  youtubeId?: string;
  productSlug?: string;
  price?: number;
};

const MEDIA_SHOWCASE_ITEMS: MediaItem[] = [
  {
    id: "media-1",
    type: "video",
    title: {
      en: "Sony A7 IV Hybrid Cinema Rig Setup",
      bn: "সোনি এ৭ ৪ হাইব্রিড সিনেমা রিগ সেটআপ"
    },
    subtitle: {
      en: "4K 60p 10-bit S-Cinetone hands-on camera test",
      bn: "৪কে ৬০পি ১০-বিট এস-সিনেটোন ক্যামেরা টেস্ট"
    },
    tag: "4K CINEMATIC",
    category: "camera",
    aspectRatio: "tall",
    imageUrl: "/products/sony-a7-iv/cover.jpg",
    youtubeId: "aL5qS3E4Lq8",
    productSlug: "sony-a7-iv",
    price: 235000
  },
  {
    id: "media-2",
    type: "video",
    title: {
      en: "DJI RS 3 Pro Gimbal Balancing & Tracking",
      bn: "ডিজেআই আরএস ৩ প্রো গিম্বল ব্যালেন্সিং"
    },
    subtitle: {
      en: "Automated axis locks & LiDAR focusing in action",
      bn: "অটোমেটেড এক্সিস লক ও লাইডার ফোকাসিং ডেমো"
    },
    tag: "PRO STABILIZER",
    category: "studio",
    aspectRatio: "portrait",
    imageUrl: "/products/dji-rs-3-pro/cover.jpg",
    youtubeId: "FzG4uDgje3M",
    productSlug: "dji-rs-3-pro",
    price: 89000
  },
  {
    id: "media-3",
    type: "image",
    title: {
      en: "Sennheiser HD 660S Acoustic Craft",
      bn: "সেনহাইজার এইচডি ৬৬০এস অ্যাকোস্টিক ক্রাফট"
    },
    subtitle: {
      en: "Open-back reference transducers with wooden stand",
      bn: "উডেন স্ট্যান্ড সহ ওপেন-ব্যাক রেফারেন্স ট্রান্সডিউসার"
    },
    tag: "HI-RES AUDIO",
    category: "audio",
    aspectRatio: "tall",
    imageUrl: "/products/sennheiser-hd-660s/cover.jpg",
    productSlug: "sennheiser-hd-660s",
    price: 46000
  },
  {
    id: "media-4",
    type: "video",
    title: {
      en: "Blackmagic Pocket 6K Pro Color Grading",
      bn: "ব্ল্যাকম্যাজিক পকেট ৬কে প্রো কালার গ্রেডিং"
    },
    subtitle: {
      en: "Super 35 sensor with internal ND filters",
      bn: "ইন্টারনাল এনডি ফিল্টার সহ সুপার ৩৫ সেন্সর"
    },
    tag: "RAW CINEMA",
    category: "camera",
    aspectRatio: "landscape",
    imageUrl: "/products/blackmagic-pocket-cinema-6k/cover.jpg",
    youtubeId: "xqyUdNXb4tU",
    productSlug: "blackmagic-pocket-cinema-6k",
    price: 320000
  },
  {
    id: "media-5",
    type: "image",
    title: {
      en: "Modern Creator Desk Setup & Ambient Glow",
      bn: "মডার্ন ক্রিয়েটর ডেস্ক সেটআপ ও অ্যাম্বিয়েন্ট লাইটিং"
    },
    subtitle: {
      en: "Curated minimalist workspace with studio monitor sound",
      bn: "মিনিমালিস্ট ওয়ার্কস্পেস ও স্টুডিও মনিটর সাউন্ড"
    },
    tag: "STUDIO DESK",
    category: "studio",
    aspectRatio: "square",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
    productSlug: "sony-a7-iv"
  },
  {
    id: "media-6",
    type: "video",
    title: {
      en: "Rode Wireless PRO 32-bit Float Audio Test",
      bn: "রোড ওয়্যারলেস প্রো ৩২-বিট অডিও টেস্ট"
    },
    subtitle: {
      en: "Zero-clipping dual-channel wireless recording",
      bn: "জিরো-ক্লিপিং ডুয়েল চ্যানেল ওয়্যারলেস রেকর্ডিং"
    },
    tag: "STUDIO AUDIO",
    category: "audio",
    aspectRatio: "portrait",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80",
    youtubeId: "YykjpeVGbiA",
    productSlug: "sennheiser-hd-660s"
  },
  {
    id: "media-7",
    type: "image",
    title: {
      en: "Continuous Studio Lighting & Softbox Diffuser",
      bn: "স্টুডিও কন্টিনিউয়াস লাইটিং ও সফটবক্স ডিফিউজার"
    },
    subtitle: {
      en: "High CRI 96+ bi-color key light with silent fan cooling",
      bn: "হাই সিআরআই ৯৬+ বাই-কালার কি-লাইট ও সাইলেন্ট কুলিং"
    },
    tag: "LIGHTING LAB",
    category: "lighting",
    aspectRatio: "landscape",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80",
    productSlug: "dji-rs-3-pro"
  },
  {
    id: "media-8",
    type: "video",
    title: {
      en: "Sigma 24-70mm f/2.8 DG DN Art Cinematic B-Roll",
      bn: "সিগমা ২৪-৭০মিমি এফ/২.৮ আর্ট সিনেমাটিক বি-রোল"
    },
    subtitle: {
      en: "Corner-to-corner sharpness in extreme low light",
      bn: "লো-লাইটে তীক্ষ্ণ শার্পনেস ও স্মুথ বোকেহ ইফেক্ট"
    },
    tag: "PRO OPTICS",
    category: "camera",
    aspectRatio: "tall",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80",
    youtubeId: "kJQP7kiw5Fk",
    productSlug: "sony-a7-iv"
  }
];

type FilterCategory = "all" | "video" | "camera" | "audio" | "studio";

type ExploreMediaMasonrySectionProps = {
  products?: Product[];
};

export function ExploreMediaMasonrySection({ products: _products = [] }: ExploreMediaMasonrySectionProps) {
  const { language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [activeVideo, setActiveVideo] = useState<MediaItem | null>(null);

  const filterTabs: { id: FilterCategory; label: { en: string; bn: string }; icon: typeof Film }[] = [
    { id: "all", label: { en: "All Media", bn: "সব মিডিয়া" }, icon: Layout },
    { id: "video", label: { en: "Hands-On Videos", bn: "ভিডিও রিভিউ" }, icon: Film },
    { id: "camera", label: { en: "Cameras & Rigs", bn: "ক্যামেরা ও রিগস" }, icon: Camera },
    { id: "audio", label: { en: "Studio Audio", bn: "অডিও গিয়ার" }, icon: Headphones },
    { id: "studio", label: { en: "Desk & Setups", bn: "স্টুডিও ও ডেস্ক" }, icon: Sparkles }
  ];

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return MEDIA_SHOWCASE_ITEMS;
    if (activeFilter === "video") return MEDIA_SHOWCASE_ITEMS.filter((item) => item.type === "video");
    return MEDIA_SHOWCASE_ITEMS.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  const openVideoModal = useCallback((item: MediaItem) => {
    if (item.type === "video" && item.youtubeId) {
      setActiveVideo(item);
      document.body.classList.add("modal-open");
    }
  }, []);

  const closeVideoModal = useCallback(() => {
    setActiveVideo(null);
    document.body.classList.remove("modal-open");
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeVideo) {
        closeVideoModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeVideo, closeVideoModal]);

  return (
    <section className="explore-section-block explore-media-masonry-section" aria-labelledby="media-masonry-heading">
      {/* Section Header */}
      <div className="explore-section-header media-masonry-header">
        <div className="explore-section-header-left">
          <span className="explore-section-kicker">
            {language === "bn" ? "ক্রিয়েটর গিয়ার ও মিডিয়া শোকেস" : "FEATURED GEAR & CREATOR SHOWCASE"}
          </span>
          <h2 id="media-masonry-heading" className="explore-section-title">
            {language === "bn"
              ? "বাস্তব অভিজ্ঞতা: সেরা গ্যাজেট, স্টুডিও সেটআপ ও হ্যান্ডস-অন ভিডিও"
              : "Curated in Action: Rigs, Studio Setups & Hands-On Reviews"}
          </h2>
          <p className="explore-section-subtitle">
            {language === "bn"
              ? "সরাসরি ইউটিউব ভিডিও রিভিউ, স্টুডিও গিয়ার ডেমনস্ট্রেশন এবং ক্রিয়েটরদের পছন্দের টপ গ্যাজেট সমূহ।"
              : "Explore hands-on YouTube video demonstrations, camera rig configurations, and studio tech curated for high-performance creators."}
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="media-masonry-filters" role="tablist" aria-label="Filter media showcase">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`media-filter-pill ${isActive ? "is-active" : ""}`}
              onClick={() => setActiveFilter(tab.id)}
            >
              <Icon size={14} aria-hidden="true" />
              <span>{tab.label[language] ?? tab.label.en}</span>
            </button>
          );
        })}
      </div>

      {/* Masonry Columns Grid */}
      <div className="media-masonry-grid" aria-live="polite">
        {filteredItems.map((item) => {
          const isVideo = item.type === "video";
          const title = item.title[language] ?? item.title.en;
          const subtitle = item.subtitle[language] ?? item.subtitle.en;

          return (
            <article
              key={item.id}
              className={`media-masonry-card aspect-${item.aspectRatio} ${isVideo ? "is-video-card" : "is-image-card"}`}
            >
              <div className="media-card-inner">
                {/* Media Image / Video Poster */}
                <div className="media-card-visual">
                  <Image
                    src={item.imageUrl}
                    alt={title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="media-card-img"
                    loading="lazy"
                  />
                  <div className="media-card-scrim" aria-hidden="true" />
                </div>

                {/* Top Badge: Tag or Video Badge */}
                <div className="media-card-top-badges">
                  <span className="media-chip-tag">{item.tag}</span>
                  {isVideo ? (
                    <span className="media-chip-video">
                      <Play size={10} fill="currentColor" aria-hidden="true" />
                      <span>YouTube</span>
                    </span>
                  ) : null}
                </div>

                {/* Center Play Button Overlay for Videos */}
                {isVideo ? (
                  <button
                    type="button"
                    className="media-play-button-overlay"
                    onClick={() => openVideoModal(item)}
                    aria-label={`Watch video: ${title}`}
                  >
                    <div className="play-icon-circle">
                      <Play size={22} fill="currentColor" className="play-triangle" aria-hidden="true" />
                    </div>
                  </button>
                ) : null}

                {/* Bottom Overlay with Title, Subtitle, Price & Action Link */}
                <div className="media-card-overlay">
                  <div className="media-card-info">
                    <h3 className="media-card-title">{title}</h3>
                    <p className="media-card-subtitle">{subtitle}</p>
                  </div>

                  <div className="media-card-action-row">
                    {item.price ? (
                      <span className="media-card-price">
                        {formatPrice(item.price)}
                      </span>
                    ) : (
                      <span className="media-card-category-badge">{item.category.toUpperCase()}</span>
                    )}

                    {isVideo ? (
                      <button
                        type="button"
                        className="media-card-action-btn"
                        onClick={() => openVideoModal(item)}
                      >
                        <Play size={13} fill="currentColor" aria-hidden="true" />
                        <span>{language === "bn" ? "ভিডিও দেখুন" : "Watch Video"}</span>
                      </button>
                    ) : item.productSlug ? (
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="media-card-action-btn"
                      >
                        <span>{language === "bn" ? "প্রোডাক্ট দেখুন" : "View Gear"}</span>
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Interactive YouTube Video Modal */}
      {activeVideo && activeVideo.youtubeId ? (
        <div
          className="media-video-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-modal-title"
          onClick={closeVideoModal}
        >
          <div
            className="media-video-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="media-video-modal-header">
              <div className="modal-header-text">
                <span className="modal-kicker-tag">{activeVideo.tag}</span>
                <h3 id="video-modal-title" className="modal-video-title">
                  {activeVideo.title[language] ?? activeVideo.title.en}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeVideoModal}
                aria-label="Close video player"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Embedded Responsive YouTube Player */}
            <div className="media-video-frame-container">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={activeVideo.title[language] ?? activeVideo.title.en}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="media-video-iframe"
              />
            </div>

            {/* Modal Footer / Direct Product Link */}
            <div className="media-video-modal-footer">
              <p className="modal-desc">
                {activeVideo.subtitle[language] ?? activeVideo.subtitle.en}
              </p>
              {activeVideo.productSlug ? (
                <div className="modal-footer-actions">
                  <Link
                    href={`/products/${activeVideo.productSlug}`}
                    className="modal-product-btn"
                    onClick={closeVideoModal}
                  >
                    <span>{language === "bn" ? "প্রোডাক্টের বিবরণ ও অর্ডার" : "View Product & Order"}</span>
                    <ExternalLink size={15} aria-hidden="true" />
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
