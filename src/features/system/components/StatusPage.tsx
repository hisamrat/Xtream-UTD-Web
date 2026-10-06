"use client";

import Link from "next/link";
import type { TranslationKey } from "@/i18n/dictionary";
import { useI18n } from "@/i18n/LanguageProvider";

type StatusPageProps = {
  code?: string;
  title: TranslationKey;
  lede: TranslationKey;
  icon?: React.ReactNode;
  action?: { label: TranslationKey; onClick: () => void };
  showLinks?: boolean;
};

/** Full-page status message (404, errors, offline) in the site's empty-state style. */
export function StatusPage({ code, title, lede, icon, action, showLinks = true }: StatusPageProps) {
  const { t } = useI18n();

  return (
    <main className="page-main">
      <section className="no-results">
        <div className="no-results-inner">
          {icon ? (
            <div className="no-results-icon" aria-hidden="true">
              {icon}
            </div>
          ) : null}
          {code ? (
            <>
              <h1 className="page-title text-accent">{code}</h1>
              <h2>{t(title)}</h2>
            </>
          ) : (
            <h1>{t(title)}</h1>
          )}
          <p className="page-lede">{t(lede)}</p>
          <div className="inline-action-row">
            {action ? (
              <button className="button primary" type="button" onClick={action.onClick}>
                {t(action.label)}
              </button>
            ) : null}
            {showLinks ? (
              <>
                <Link className="pill-button light" href="/">
                  {t("system.notFound.home")}
                </Link>
                <Link className="pill-button primary" href="/products">
                  {t("system.notFound.products")}
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
