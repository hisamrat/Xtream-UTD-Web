"use client";

import { useI18n } from "@/i18n/LanguageProvider";
import { deliveryParams, getTrustPoints, type TrustPoint, type TrustPointId } from "./trust-points";

function useTrustPointText() {
  const { t, localize } = useI18n();
  return (point: TrustPoint) => ({
    label: t(point.label, deliveryParams),
    description: "text" in point.description ? localize(point.description.text) : t(point.description.key, point.description.params)
  });
}

/** Compact chips row used in page heroes (about, contact, terms). */
export function TrustPerks({ ids, ariaLabel }: { ids: readonly TrustPointId[]; ariaLabel: string }) {
  const text = useTrustPointText();

  return (
    <div className="contact-perks-row" aria-label={ariaLabel}>
      {getTrustPoints(ids).map((point) => {
        const { label, description } = text(point);
        return (
          <div className="perk-chip" key={point.id}>
            <div className="perk-chip-icon" aria-hidden="true">
              <point.Icon size={16} />
            </div>
            <div className="perk-chip-text">
              <span className="perk-label">{label}</span>
              <span className="perk-desc">{description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Four-card benefits strip used on the explore page. */
export function TrustFeatures({ ids }: { ids: readonly TrustPointId[] }) {
  const { t } = useI18n();
  const text = useTrustPointText();

  return (
    <section className="home-features-section" aria-label={t("brand.features.aria")}>
      <div className="home-features-container">
        {getTrustPoints(ids).map((point) => {
          const { label, description } = text(point);
          return (
            <div key={point.id} className="home-feature-card">
              <div className="feature-card-icon-wrap" aria-hidden="true">
                <point.Icon size={20} className="feature-card-icon" />
              </div>
              <div className="feature-card-content">
                <h3 className="feature-card-title">{label}</h3>
                <p className="feature-card-desc">{description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
