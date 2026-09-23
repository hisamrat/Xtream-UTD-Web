"use client";

import { Star } from "lucide-react";
import { useLanguage } from "@/components/site/LanguageProvider";

type ReviewItem = {
  id: string;
  rating: number;
  quote: {
    en: string;
    bn: string;
  };
  author: string;
  location: {
    en: string;
    bn: string;
  };
};

const customerReviews: ReviewItem[] = [
  {
    id: "review-1",
    rating: 5,
    quote: {
      en: "Three years using the audio & camera gear from Xtream UTD and not a single hitch. Original authentic quality and swift delivery to Chittagong.",
      bn: "এক্সট্রিম ইউটিডি থেকে অডিও ও ক্যামেরা গিয়ার ব্যবহার করছি ৩ বছর ধরে, কোয়ালিটি সত্যিই অসাধারণ। একদম অথেনটিক পণ্য এবং চট্টগ্রামে দ্রুত ডেলিভারি পেয়েছি।"
    },
    author: "Tanvir Ahmed",
    location: {
      en: "CHITTAGONG",
      bn: "চট্টগ্রাম"
    }
  },
  {
    id: "review-2",
    rating: 5,
    quote: {
      en: "Ordered the creator desk accessories and lighting kit for our studio. Everything arrived pristine in heavy-duty packaging within 48 hours. Exceptional support!",
      bn: "আমাদের স্টুডিওর জন্য ক্রিয়েটর এক্সেসরিজ ও লাইটিং কিট অর্ডার করেছিলাম। ৪৮ ঘণ্টার মধ্যে ইনট্যাক্ট প্যাকেজিংয়ে পেয়েছি। কাস্টমার সার্ভিস দারুণ!"
    },
    author: "Nafis Rahman",
    location: {
      en: "SYLHET",
      bn: "সিলেট"
    }
  },
  {
    id: "review-3",
    rating: 5,
    quote: {
      en: "Upgraded my complete video podcast setup with Xtream UTD. Transparent pricing, cash on delivery across Bangladesh, and 100% genuine warranty coverage.",
      bn: "ভিডিও পডকাস্টের সম্পূর্ণ সেটআপ এক্সট্রিম ইউটিডি থেকে নেওয়া। সঠিক দাম, সারাদেশে ক্যাশ অন ডেলিভারি এবং জেনুইন অফিসিয়াল ওয়ারেন্টি।"
    },
    author: "Ayesha Siddiqua",
    location: {
      en: "DHAKA",
      bn: "ঢাকা"
    }
  }
];

export function ExploreReviewsSection() {
  const { t, language } = useLanguage();

  return (
    <section className="explore-section-block explore-reviews-section" aria-labelledby="reviews-heading">
      <div className="explore-section-header">
        <div className="explore-section-header-left">
          <span className="explore-section-kicker reviews-kicker">{t("reviews_kicker")}</span>
          <h2 id="reviews-heading" className="explore-section-title">
            {t("reviews_title")}
          </h2>
        </div>
      </div>

      <div className="explore-reviews-grid">
        {customerReviews.map((item) => (
          <div key={item.id} className="explore-review-card">
            <div className="review-stars" aria-label={`${item.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={`star-${item.id}-${i}`}
                  size={14}
                  className="review-star-icon"
                  fill={i < item.rating ? "#f97316" : "none"}
                  color={i < item.rating ? "#f97316" : "#64748b"}
                  aria-hidden="true"
                />
              ))}
            </div>

            <blockquote className="review-quote">
              <p>"{item.quote[language] ?? item.quote.en}"</p>
            </blockquote>

            <div className="review-author-info">
              <span className="review-author-name">{item.author}</span>
              <span className="review-author-location">{item.location[language] ?? item.location.en}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

