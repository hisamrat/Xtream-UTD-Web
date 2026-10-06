"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Compass, FileText, Home, Info, LayoutGrid, MessageCircle, RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { emitShowcase, useShowcaseReady } from "@/features/showcase/lib/showcase-events";
import type { TranslationKey } from "@/i18n/dictionary";
import { useI18n } from "@/i18n/LanguageProvider";
import { useScrollThreshold } from "@/shared/hooks/useScrollThreshold";

type DockLink = { href: string; label: TranslationKey; Icon: typeof Home };

const links = {
  home: { href: "/", label: "nav.home", Icon: Home },
  explore: { href: "/explore", label: "nav.explore", Icon: Compass },
  products: { href: "/products", label: "nav.products", Icon: LayoutGrid },
  contact: { href: "/contact", label: "nav.contact", Icon: MessageCircle },
  about: { href: "/about", label: "nav.about", Icon: Info },
  terms: { href: "/terms", label: "nav.termsShort", Icon: FileText }
} satisfies Record<string, DockLink>;

/** The dock's centre "current page" slot for a pathname. */
function currentLink(pathname: string): DockLink {
  if (pathname === "/") return links.home;
  if (pathname === "/explore") return links.explore;
  if (pathname.startsWith("/contact")) return links.contact;
  if (pathname.startsWith("/about")) return links.about;
  if (pathname.startsWith("/terms")) return links.terms;
  return links.products;
}

/**
 * Floating three-slot navigation dock: [left link] [current page] [right action].
 * Home: Products · Home · Reload. Products: Home · Products · Contact. Elsewhere: Home · Current · Products.
 */
export function BottomDock() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [reloading, setReloading] = useState(false);
  const reloadTimerRef = useRef<number | null>(null);
  const isScrolledDown = useScrollThreshold(40);

  const onHome = pathname === "/";
  const onExplore = pathname === "/explore";
  const onProducts = pathname.startsWith("/products");
  const homeUIReady = useShowcaseReady(onHome);

  useEffect(
    () => () => {
      if (reloadTimerRef.current !== null) window.clearTimeout(reloadTimerRef.current);
    },
    []
  );

  const handleReload = () => {
    setReloading(true);
    emitShowcase("world-reload");
    if (reloadTimerRef.current !== null) window.clearTimeout(reloadTimerRef.current);
    reloadTimerRef.current = window.setTimeout(() => setReloading(false), 500);
  };

  const handleHomeClick = () => {
    if (onHome) emitShowcase("world-home");
  };

  const renderLink = ({ href, label, Icon }: DockLink, current = false) => (
    <Link href={href} onClick={href === "/" ? handleHomeClick : undefined} aria-current={current ? "page" : undefined}>
      <Icon size={16} aria-hidden="true" />
      <span>{t(label)}</span>
    </Link>
  );

  const isShowcase = onHome || onExplore;

  return (
    <div
      className={`bottom-dock-container ${isShowcase ? "is-home-dock" : "is-subpage-dock"} ${
        !onExplore || isScrolledDown ? "is-arrows-hidden" : ""
      }`}
      style={
        onHome
          ? {
              opacity: homeUIReady ? 1 : 0,
              pointerEvents: homeUIReady ? "auto" : "none",
              transition: homeUIReady ? "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)" : "none"
            }
          : undefined
      }
    >
      {onExplore ? (
        <button
          type="button"
          className={`bottom-dock-arrow bottom-dock-arrow-prev ${isScrolledDown ? "is-scrolled-hidden" : ""}`}
          onClick={() => emitShowcase("explore-prev")}
          aria-label={t("shell.dock.prev")}
          title={t("shell.dock.prev")}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
      ) : null}

      <nav className={`bottom-switch ${isShowcase ? "is-home" : "is-subpage"}`} aria-label={t("nav.dock")}>
        {renderLink(onHome ? links.products : links.home)}
        {renderLink(currentLink(pathname), true)}
        {onHome ? (
          <button
            type="button"
            className="bottom-switch-reload"
            onClick={handleReload}
            aria-label={t("shell.dock.reloadAria")}
            title={t("nav.reload")}
          >
            <RotateCw size={15} className={reloading ? "is-spinning" : ""} aria-hidden="true" />
            <span>{t("nav.reload")}</span>
          </button>
        ) : (
          renderLink(onProducts ? links.contact : links.products)
        )}
      </nav>

      {onExplore ? (
        <button
          type="button"
          className={`bottom-dock-arrow bottom-dock-arrow-next ${isScrolledDown ? "is-scrolled-hidden" : ""}`}
          onClick={() => emitShowcase("explore-next")}
          aria-label={t("shell.dock.next")}
          title={t("shell.dock.next")}
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
