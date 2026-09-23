"use client";

import { Sparkles, Truck, ShieldCheck, MessageCircle } from "lucide-react";
import { useLanguage } from "@/components/site/LanguageProvider";

export function HomeFeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      id: "authentic",
      icon: Sparkles,
      title: t("feature_authentic_title"),
      desc: t("feature_authentic_desc")
    },
    {
      id: "dispatch",
      icon: Truck,
      title: t("feature_dispatch_title"),
      desc: t("feature_dispatch_desc")
    },
    {
      id: "cod",
      icon: ShieldCheck,
      title: t("feature_cod_title"),
      desc: t("feature_cod_desc")
    },
    {
      id: "support",
      icon: MessageCircle,
      title: t("feature_support_title"),
      desc: t("feature_support_desc")
    }
  ];

  return (
    <section className="home-features-section" aria-label="Store Benefits & Guarantees">
      <div className="home-features-container">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.id} className="home-feature-card">
              <div className="feature-card-icon-wrap" aria-hidden="true">
                <Icon size={20} className="feature-card-icon" />
              </div>
              <div className="feature-card-content">
                <h3 className="feature-card-title">{feature.title}</h3>
                <p className="feature-card-desc">{feature.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

