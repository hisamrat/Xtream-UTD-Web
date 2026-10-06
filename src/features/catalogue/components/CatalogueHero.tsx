"use client";

import { useI18n } from "@/i18n/LanguageProvider";

type CatalogueHeroProps = {
  query?: string;
  category: string | null;
};

export function CatalogueHero({ query, category }: CatalogueHeroProps) {
  const { t, tCategory } = useI18n();

  const [line1, line2] = query
    ? [t("catalogue.hero.searchLine1", { query }), t("catalogue.hero.searchLine2", { query })]
    : category
      ? [tCategory(category), t("catalogue.hero.categoryLine2")]
      : [t("catalogue.hero.defaultLine1"), t("catalogue.hero.defaultLine2")];

  const lede = query
    ? t("catalogue.lede.search", { query })
    : category
      ? t("catalogue.lede.category", { category: tCategory(category) })
      : t("catalogue.lede.default");

  return (
    <div className="catalogue-hero">
      <h1 className="page-title catalogue-title">
        {line1} <br />
        <span className="text-accent">{line2}</span>
      </h1>
      <p className="page-lede">{lede}</p>
    </div>
  );
}
