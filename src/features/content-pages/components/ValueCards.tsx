"use client";

import { Clock, MapPin, PackageCheck, RotateCcw, ShieldCheck, Sparkles, Truck } from "lucide-react";
import type { ValueCard, ValueCardIcon } from "@/content/about";
import { useI18n } from "@/i18n/LanguageProvider";
import type { MessageParams } from "@/shared/i18n/format";

const icons: Record<ValueCardIcon, typeof Truck> = {
  sparkles: Sparkles,
  shield: ShieldCheck,
  truck: Truck,
  clock: Clock,
  package: PackageCheck,
  map: MapPin,
  rotate: RotateCcw
};

/** Bento grid of policy/value cards (About and Terms pages). */
export function ValueCards({ cards, params }: { cards: readonly ValueCard[]; params: MessageParams }) {
  const { localize } = useI18n();

  return (
    <section className="stack-section" style={{ marginTop: "16px" }}>
      <div className="contact-bento-grid">
        {cards.map((card) => {
          const Icon = icons[card.icon];
          const MetaIcon = icons[card.metaIcon];
          return (
            <div className="bento-card" key={card.id}>
              <div className="bento-card-top">
                <div className={`channel-icon-badge ${card.badge}-badge`}>
                  <Icon size={20} aria-hidden="true" />
                </div>
                <span className="bento-tag">{localize(card.tag, params)}</span>
              </div>
              <div className="bento-card-content">
                <h3 className="bento-title">{localize(card.title, params)}</h3>
                <p className="bento-desc">{localize(card.description, params)}</p>
              </div>
              <div className="bento-meta-badge">
                <MetaIcon size={13} aria-hidden="true" />
                <span>{localize(card.meta, params)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
