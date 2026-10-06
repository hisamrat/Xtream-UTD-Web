# Xtream UTD Web — Architecture Analysis & Target Blueprint

| | |
|---|---|
| **Status** | Research / assessment only. No application code was changed while producing this document. |
| **Date** | 2026-10-05 |
| **Codebase snapshot** | `main` @ `dd754aa` (plus uncommitted changes to `next-env.d.ts`, `package-lock.json`, `tsconfig.tsbuildinfo`) |
| **Stack observed** | Next.js 16.3.0 (App Router), React 19.2.8, TypeScript (strict), Zod, lucide-react, googleapis, plain global CSS |
| **Scope** | `app/`, `src/`, config files, `design-reference/data/`, `.cache/`, `.env.local.example`, tooling |

> How to read this document: Sections 1–14 describe the code **as it is**. Sections 15–27 are the **blueprint** for the future implementation. Every recommendation cites the file(s) it is based on. Line numbers refer to the snapshot above.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Architecture](#2-current-architecture)
3. [Current Folder Structure Analysis](#3-current-folder-structure-analysis)
4. [Current Module/Feature Analysis](#4-current-modulefeature-analysis)
5. [Strengths](#5-strengths)
6. [Problems and Technical Debt](#6-problems-and-technical-debt)
7. [Dependency and Coupling Analysis](#7-dependency-and-coupling-analysis)
8. [Next.js / React Analysis](#8-nextjs--react-analysis)
9. [State Management Analysis](#9-state-management-analysis)
10. [API / Service Analysis](#10-api--service-analysis)
11. [TypeScript / Code Organization Analysis](#11-typescript--code-organization-analysis)
12. [Performance Analysis](#12-performance-analysis)
13. [Security Analysis](#13-security-analysis)
14. [Scalability Analysis](#14-scalability-analysis)
15. [Recommended Architecture](#15-recommended-architecture)
16. [Proposed Folder Structure](#16-proposed-folder-structure)
17. [Layer Responsibilities](#17-layer-responsibilities)
18. [Dependency Rules](#18-dependency-rules)
19. [Refactoring Recommendations](#19-refactoring-recommendations)
20. [Files/Modules to Move](#20-filesmodules-to-move)
21. [Files/Modules to Split](#21-filesmodules-to-split)
22. [Files/Modules to Consolidate](#22-filesmodules-to-consolidate)
23. [Things That Should NOT Be Changed](#23-things-that-should-not-be-changed)
24. [Implementation Strategy](#24-implementation-strategy)
25. [Implementation Order](#25-implementation-order)
26. [Risks and Migration Considerations](#26-risks-and-migration-considerations)
27. [Final Architecture Decision](#27-final-architecture-decision)
28. [Implementation Record](#28-implementation-record-2026-10-06)

---

## 1. Executive Summary

Xtream UTD Web is a ~9,000-line TSX + ~12,600-line CSS Next.js App Router storefront/catalogue. It has a clean, thin route layer, a Zod-validated product model, strict TypeScript with no `any`, and a polished interactive home "product world" and explore carousel. The **organization is "by technical type at the top, by page underneath"** (`src/components/<page>/`, `src/lib/`), which was adequate for a prototype but has started to fail in specific, measurable ways.

### The five findings that matter most

| # | Finding | Severity | Evidence |
|---|---|---|---|
| 1 | **Admin credentials are hard-coded in client JavaScript, and the admin API routes are unauthenticated filesystem writers** (including a path-traversal-capable upload). | **Critical** | `src/components/admin/AdminLoginClient.tsx:23`, `app/api/admin/upload-image/route.ts:9,17`, `app/api/admin/save-settings/route.ts:8-9`, `app/api/admin/save-products/route.ts:32-35` |
| 2 | **Two sources of product truth.** Pages fetch from Google Sheets (25 products), but several helpers silently read the bundled JSON (18 products) via a module-level import. Category lists, related products and "newest" sorting are wrong whenever Sheets is configured. | **High** (correctness) | `src/lib/products.ts:1,53,67,198`, `src/components/catalogue/CatalogueClient.tsx:104`, `app/products/[slug]/page.tsx` (`getRelatedProducts`) |
| 3 | **Every component is a Client Component** (33/33 files carry `"use client"`) and the **entire catalogue is serialized into every page** via the root layout → `Header` → `SearchOverlay`. The JSON catalogue is also bundled into client JS wherever `@/lib/products` is imported from a client file. | **High** (performance/scalability) | `app/layout.tsx:36,49`, `src/components/site/Header.tsx:15`, `src/components/site/SearchOverlay.tsx:8` |
| 4 | **Business rules and copy are scattered and duplicated.** Delivery fees (`৳70/৳130`) appear in 10+ places; three different phone validators; three order-message builders; 266 inline `language === "bn" ? … : …` ternaries bypass the translation dictionary; three unrelated category taxonomies. | **High** (maintainability) | see §6.4, §22 |
| 5 | **Content that violates the repo's own rules** ("do not invent ratings/claims"): hard-coded 5-star customer reviews with names, an invented product feature appended to every product, and success screens claiming an inquiry was "sent" when nothing is sent. | **High** (trust/compliance) | `src/components/explore/ExploreReviewsSection.tsx:20-60`, `src/components/details/ProductDetailsClient.tsx:363-367`, `src/components/details/OrderInquiryModal.tsx:120`, `src/components/contact/ContactForm.tsx:108-112` |

### Recommended architecture (one line)

**A pragmatic Feature-based architecture with a thin shared layer and an explicit server-only data-access layer** — `app/` stays a thin routing shell; product rules live in a pure, isomorphic `domain/` module; data fetching (Sheets/JSON) lives in `server/`; UI is grouped by feature (`features/catalogue`, `features/product-details`, `features/cart`, `features/showcase`, …); generic UI, i18n and utilities live in `shared/`. No new state library, no repository/DI abstractions, no Tailwind migration.

### Recommended first moves (before any restructuring)

1. **Remove or quarantine `/xadmin` and `app/api/admin/*`**, and rotate the exposed password and the Google API key in `.env.local.example`.
2. **Make the data layer single-source** (all helpers take the product list as a parameter; only the server data source imports JSON).
3. **Stand up a safety net**: fix the broken Vitest run, add Playwright smoke + screenshot tests at 3 viewports. Only then move files.

---

## 2. Current Architecture

### 2.1 Runtime picture

```text
                        ┌─────────────────────────────────────────┐
 Request ──► app/layout.tsx (Server, async)                       │
             │  await fetchAllProducts()  ◄── src/lib/products-server.ts
             │                                   ├─ Sheets configured? ─► src/lib/sheets.ts (googleapis,
             │                                   │                         memory + .cache/ disk cache)
             │                                   └─ else ─► src/lib/products.ts (imports JSON at module load)
             │
             ├─ ThemeProvider (client, localStorage)
             ├─ LanguageProvider (client, localStorage, all EN/BN strings)
             ├─ CartProvider (client, localStorage; also renders CheckoutModal)
             │    ├─ Header(products = FULL CATALOGUE) ─► SearchOverlay (client-side filter)
             │    ├─ {page}
             │    ├─ Footer, BottomSwitch, CartDrawer
             │
 Page (Server, async) ─► await fetchAllProducts() again ─► <XxxClient products=… />  (everything below is client)
```

* **Rendering model:** Server Components exist **only** as route entry points (`app/**/page.tsx`, `app/layout.tsx`). Each page fetches data and immediately hands it to a single large `*Client` component. All UI logic runs on the client.
* **Data flow:** one-way props from page → client tree. Cross-tree communication uses three React contexts (theme, language, cart) and a **`window` CustomEvent bus** (`xtream-utd:world-home`, `world-reload`, `world-ui-ready`, `explore-prev`, `explore-next`).
* **Persistence:** `localStorage` (theme, language, cart, recently viewed), `sessionStorage` (home shuffle offset), server-side disk cache under `.cache/` and, for admin routes, writes into `design-reference/` and `public/`.
* **Ordering:** no backend. Checkout composes a text message and opens Facebook Messenger (`m.me/...?text=`). Contact and inquiry forms do not send anything.
* **Caching:** route segment `export const revalidate = 60` on pages, plus a hand-rolled in-memory + disk cache in `sheets.ts` (TTL 60 s), plus an on-demand `/api/revalidate` route.

### 2.2 Route inventory

| Route | File | Rendering | Data | Notes |
|---|---|---|---|---|
| `/` | `app/page.tsx` | ISR 60 s → `ProductWorld` (client) | all products | CSS-3D world (not WebGL) |
| `/explore` | `app/explore/page.tsx` | ISR 60 s → `ExploreClient` | products + gallery | Not in `AGENTS.md` route list |
| `/products` | `app/products/page.tsx` | **dynamic** (reads `searchParams`) → `CatalogueClient` | all products | Filter parsing done in the page file |
| `/products/[slug]` | `app/products/[slug]/page.tsx` | SSG via `generateStaticParams` + ISR | all products (fetched 3×: params, metadata, page) | Related products from JSON (bug) |
| `/about` | `app/about/page.tsx` | static → `AboutClient` | `siteConfig` | Whole page is client-only |
| `/contact` | `app/contact/page.tsx` | ISR 60 s → `ContactClient` | all products | Form does not submit anywhere |
| `/terms` | `app/terms/page.tsx` | static → `TermsClient` | none | Whole page is client-only |
| `/offline` | `app/offline/page.tsx` | static | none | "Retry" button has no handler |
| `/xadmin` | `app/xadmin/page.tsx` | static → `AdminLoginClient` | bundled JSON | Fake client-side auth |
| `/api/revalidate` | route handler | dynamic | — | Fails open without secret; GET mutates |
| `/api/image-proxy` | route handler | dynamic | Google Drive | **Not used by the app** |
| `/api/admin/*` (3) | route handlers | dynamic | filesystem | **Unauthenticated**, not called by the UI |
| 404 | `app/not-found.tsx` | static | — | Copy is product-specific for every 404 |

There is **no** `error.tsx`, `global-error.tsx`, or `loading.tsx` anywhere.

---

## 3. Current Folder Structure Analysis

### 3.1 Current tree (source only)

```text
app/
  layout.tsx            # fetches catalogue, mounts 3 providers + shell
  globals.css           # 12,590 lines, the entire design system + every page
  page.tsx  not-found.tsx
  about/ contact/ explore/ offline/ terms/ xadmin/   page.tsx
  products/page.tsx  products/[slug]/page.tsx
  api/admin/{save-products,save-settings,upload-image}/route.ts
  api/image-proxy/route.ts  api/revalidate/route.ts
src/
  config/site.ts        # business details (good idea, partially used)
  lib/
    format.ts  order.ts  image-utils.ts
    product-schema.ts  gallery-schema.ts
    products.ts         # imports JSON at module scope + all catalogue helpers
    products-server.ts  # env detection + Sheets/JSON switch
    sheets.ts           # 474 lines: client, caches, parsers for 2 tabs
    products.test.ts    # the only test file
  components/
    about/ admin/ cart/ catalogue/ contact/ details/ explore/ home/
    products/ site/ terms/ world/
design-reference/data/sample_products.json   # runtime data source AND admin write target
.cache/sheets-*.json                         # runtime cache, committed to git
public/images/placeholder-product.svg
```

### 3.2 Assessment

| Aspect | Observation | Consequence |
|---|---|---|
| Top-level split `app/` vs `src/` | Routes in `app/`, everything else in `src/` with `@/*` → `src/*`. | **Good** — keep. |
| `src/components/<page>/` | Components grouped by the page that first used them (`details/`, `catalogue/`, `explore/`, `world/`). | Cross-page components end up in arbitrary homes: `home/HomeFeaturesSection.tsx` is only used by `explore/ExploreClient.tsx`; `products/` holds shared product UI but `ProductArtwork` is used by cart, world, explore, details. |
| `src/components/site/` | Mixes layout chrome (Header, Footer, BottomSwitch), **global providers** (LanguageProvider with 350 lines of dictionaries, ThemeProvider) and generic UI (Breadcrumb). | Providers and i18n are "hidden" inside a UI folder; any component importing `useLanguage` depends on `site/`. |
| `src/lib/` | Flat bag of pure helpers, schemas, **and** server-only modules (`sheets.ts`, `products-server.ts`) side by side. | Nothing prevents a client component importing `sheets.ts` (googleapis + `node:fs`). Server/client boundary is by convention only. |
| `design-reference/` | Declared as the design source of truth, but `design-reference/data/sample_products.json` is also the **runtime fallback data source** and the **write target** of `api/admin/save-products`. | Design assets and production data are coupled; a design refresh can change the live catalogue. |
| `app/globals.css` | One file for tokens, base, every component, every page, light-theme overrides (404 `[data-theme=light]` selectors), admin styles, and "second pass" override layers (`/* Second pass: … */` at line ~6938). 416 `!important`. | Cascade-order fragility; no dead-CSS detection; every page downloads all CSS. |
| Tracked build/runtime artifacts | `tsconfig.tsbuildinfo`, `.cache/*.json`, `next-env.d.ts` drift. | Noisy diffs, stale data committed. |
| `.antigravity/`, `.vscode/` | Tool config. | Harmless. |

---

## 4. Current Module/Feature Analysis

Below, "feature" means a user-facing capability. Size is lines of TSX.

| Feature | Files | Size | State & side effects | Assessment |
|---|---|---|---|---|
| **App shell** | `site/Header`, `Footer`, `BottomSwitch`, `SearchOverlay`, `Breadcrumb` | ~800 | scroll listeners (3 separate ones), body-class toggles, CustomEvent listeners, path-based branching | Header owns search state and needs the full catalogue; BottomSwitch has page-specific slot logic for 6 routes; both hide themselves on `/xadmin` (admin leaking into shell). |
| **i18n** | `site/LanguageProvider.tsx` | 351 | localStorage, `<html lang>` mutation | Dictionary of ~80 keys is fine, but **266 inline ternaries** across 17 files bypass it. `categoryTranslations` (lines 250-260) lists creator-gear categories that do not exist in the data, so Bengali category names never render. |
| **Theme** | `site/ThemeProvider.tsx` + inline script in `layout.tsx:41-44` | 46 | localStorage | Works; inline pre-hydration script duplicates provider logic (acceptable trade-off for no-flash). |
| **Product model** | `lib/product-schema.ts`, `format.ts`, `products.ts` | ~210 | module-level JSON parse | Good Zod schema; helpers mix pure functions with hidden global data (see §6.2). Duplicate image fields (`cover_image`/`poster_image_url`, `gallery_images`/`gallery_images_url`). |
| **Data access** | `lib/products-server.ts`, `lib/sheets.ts` | 520 | env reads, network, disk writes | Sheets parser **bypasses Zod** (`sheets.ts:371` pushes raw objects). Header detection and caching duplicated for products vs gallery. Config detection duplicated in both functions of `products-server.ts`. |
| **Home world** | `world/ProductWorld.tsx` | 987 | 14 `useState`, 7 refs, timers, window listeners, MutationObserver, sessionStorage | One component owns layout geometry tables, pointer physics, hover timers, pagination, shuffle, keyboard, wheel navigation, and the UI-ready event. Hard to test, hard to change safely. |
| **Explore** | `explore/ExploreClient.tsx` + 3 sections | ~980 | rAF loop, interval autoplay, window listeners | Carousel math is solid but embedded in the component; rAF loop never stops (see §12). Reviews are fabricated. |
| **Catalogue** | `catalogue/CatalogueClient.tsx` | 670 | URL sync via `router.replace`, transitions, deferred value | Good URL-as-state approach. But filter parsing lives in `app/products/page.tsx` while serialization lives in `CatalogueClient.tsx:688` — the two halves of one contract are in different layers. Uses JSON-only `getCategories()`. |
| **Product details** | `details/ProductDetailsClient.tsx`, `OrderInquiryModal.tsx` | 665 | localStorage (recently viewed) | Receives the whole catalogue just to resolve recently-viewed slugs. Never renders `product.specifications`. Appends an invented feature to every product. |
| **Cart & checkout** | `cart/CartProvider.tsx`, `CartDrawer.tsx`, `CheckoutModal.tsx` | 843 | localStorage (full `Product` objects) | Provider renders `CheckoutModal` (UI inside state module). Fees hard-coded. Stored cart is parsed without validation and carries stale prices. |
| **Contact** | `contact/*` (4 files) | 742 | fake submit timer | Business data partly from `siteConfig`, partly hard-coded (phone in FAQ copy). |
| **About / Terms** | `about/AboutClient`, `terms/TermsClient` | 526 | none (just `useLanguage`) | Entire static pages are client components only because translation is client-only. |
| **Admin** | `admin/*`, `app/xadmin`, `app/api/admin/*` | 516 + 84 | local state only | Non-functional (save is a no-op), insecure, and contrary to `AGENTS.md` ("no authentication unless requested"). |

---

## 5. Strengths

These are real assets. The target architecture is designed to **preserve** them.

1. **Thin route files.** Every `app/**/page.tsx` is ≤ 60 lines: metadata + data fetch + one component. This is exactly the shape the target architecture wants.
2. **Zod-backed product model** (`src/lib/product-schema.ts`) with defaults and `.catch()` for stock; types derived via `z.infer` — single type source.
3. **Strict TypeScript, no `any`.** `strict: true`; grep finds zero `: any` / `as any`. Only one unsafe double cast (`products.ts:32`).
4. **Pure, tested catalogue helpers.** `filterProducts`, `sortProducts`, `formatPrice`, `calculateDiscountPercentage`, `createOrderMessage` are pure functions with unit tests (`products.test.ts`).
5. **URL as catalogue state.** `/products?q=&category=&stock=&min=&max=&sort=` is shareable and SSR-parsed; `useDeferredValue` + `useTransition` keep typing responsive.
6. **Graceful data fallback.** Sheets failure falls back to bundled JSON instead of a broken page (`products-server.ts:19-25`).
7. **Centralized business config exists** (`src/config/site.ts`, `as const`, typed). The pattern is right; it just isn't used consistently.
8. **Click vs drag is distinguished** in both the world (`dragThreshold = 7`, `ProductWorld.tsx:68,605`) and explore (`ExploreClient.tsx:28,288`) — an `AGENTS.md` requirement.
9. **Reduced-motion awareness** exists in CSS (4 `prefers-reduced-motion` blocks) and in the FLIP grid (`ProductGrid.tsx:34`).
10. **Bangladeshi taka formatting** is centralized in `formatPrice` (`format.ts`).
11. **Accessible intent is visible**: `aria-*` on dialogs, `sr-only` product links in the world, keyboard handlers on carousel cards, `aria-live` on search status.
12. **Performance-conscious animation code** in explore: direct DOM style writes inside rAF instead of React re-renders per frame.
13. **Product images degrade gracefully** through a candidate-URL chain and a placeholder (`ProductArtwork.tsx`).

---

## 6. Problems and Technical Debt

Each problem lists **what**, **why it exists**, and **what happens as the project grows**.

### 6.1 Security (details in §13)

Hard-coded admin password in the client bundle; unauthenticated write APIs; path traversal in upload; open image proxy; fail-open revalidation; real-looking credentials in `.env.local.example`.

* **Why:** the admin was built as a UI mock-up and the API routes were added for local-development convenience, without a threat model.
* **Growth risk:** once deployed, anyone can deface or plant files; credentials are already public in git history.

### 6.2 Two sources of product truth

* **What:** `src/lib/products.ts:1` imports `sample_products.json` at module scope. `getCategories()` (line 53), `getRelatedProducts()` (line 67), `getSuggestedCategories()` (line 189) and the "newest"/"featured" tie-break `datasetOrder()` (line 198) all read that module-level JSON, **not** the products passed in.
  * `CatalogueClient.tsx:104` → `getCategories()` → category dropdown shows only JSON categories. The current Sheets cache has 25 products incl. categories `General` and `Placemats Coasters` that **cannot be selected**.
  * `app/products/[slug]/page.tsx` → `getRelatedProducts(product)` → related cards come from JSON; 7 Sheets-only products get JSON-based fallbacks, and JSON-only slugs could link to 404s once the sheet diverges.
  * `datasetOrder()` returns `MAX_SAFE_INTEGER` for any slug not in the JSON → "newest" sort is effectively unordered for Sheets-only products.
  * `AdminDashboard.tsx:17` shows the JSON list, not live data.
* **Why:** the JSON was the original data source; Sheets was added later behind `fetchAllProducts()` without refactoring the helpers' hidden dependency.
* **Growth risk:** every new helper written in the same style silently uses stale data. Bugs only appear in production (Sheets configured) and never locally (`.env.local` absent → JSON) — **the tests cannot catch them**.

### 6.3 Client-everything rendering and payload bloat

* **What:** all 33 component files are `"use client"`. Root layout awaits the catalogue and passes the **full product array** to `Header` (for search), so every route's RSC payload contains the whole catalogue. `/products/[slug]` sends it **twice** (Header + `allProducts` for recently-viewed). Client imports of `@/lib/products` (`CatalogueClient`, `SearchOverlay`, `AdminDashboard`) also pull `sample_products.json` into client JS.
* **Why:** translations and theme are client-only contexts, so any component that shows text "needs" the client; search was implemented as in-memory filtering.
* **Growth risk:** payload grows linearly with catalogue size × number of pages. At a few hundred products with long descriptions, every navigation ships hundreds of KB of JSON; hydration cost grows likewise.

### 6.4 Scattered business rules and duplicated logic

| Rule | Locations (non-exhaustive) |
|---|---|
| Delivery fee ৳70 / ৳130 | `CheckoutModal.tsx:66,338,355`, `TermsClient.tsx:39,116`, `ContactClient.tsx:27`, `ContactChannels.tsx:159`, `ContactForm.tsx:53`, `ContactFAQ.tsx:35`, `AboutClient.tsx:38,166,171`, `LanguageProvider.tsx:153,233`, `site.ts:25-27` (as prose strings) |
| Phone number | `site.ts:13`, `ContactFAQ.tsx:24`, `AboutClient.tsx:199` (hard-coded in copy) |
| Phone validation | Checkout `/^01[3-9]\d{8}$/` (`CheckoutModal.tsx:172`); Contact `length >= 8` (`ContactForm.tsx:96`); Inquiry: non-empty only (`OrderInquiryModal.tsx:241`) |
| Order message | `lib/order.ts:createOrderMessage`; inline template in `CheckoutModal.tsx:88-125`; contact form builds its own |
| Messenger fallback URL | `CheckoutModal.tsx:158`, `ContactForm.tsx:184` (hard-coded `https://m.me/xtreamutd` duplicating `site.ts:11`) |
| "Is placeholder" check | `isEditablePlaceholder` used in 5 files although no config value is a placeholder any more |
| Categories | `site.ts:30-43` (12 marketing names), `LanguageProvider.tsx:250-260` (9 creator-gear names), actual data (9–11 different names). Only 2 of 12 config names exist in data. |
| Image URL candidate resolution | `ProductArtwork.tsx:32-70` and `ExploreMediaMasonrySection.tsx:49-73` |
| Modal mechanics (body lock, Esc, initial focus) | `CheckoutModal`, `OrderInquiryModal`, `SearchOverlay`, `CartDrawer`, `CatalogueClient` filter drawer, `Header` mobile menu — 6 hand-rolled copies, none trap focus or restore focus |
| Scroll listeners | `Header.tsx:32`, `BottomSwitch.tsx:35`, `ExploreClient.tsx:109`, `Footer.tsx:57` |
| `xtream-utd:world-ui-ready` subscription | `Header.tsx:57-66` and `BottomSwitch.tsx:47-56` (identical) |

* **Why:** features were built page-by-page; there was no designated home for "commerce rules" or "UI primitives".
* **Growth risk:** a delivery-fee change requires editing ~12 places in two languages; a missed spot shows customers a wrong price. Any accessibility fix to modals must be done six times.

### 6.5 i18n bypass

* **What:** 266 occurrences of `language === "bn" ? "…" : "…"` across 17 files (CheckoutModal 46, TermsClient 37, CatalogueClient 34, AboutClient 30, ContactForm 27, …). Some UI is English-only (e.g. `OrderInquiryModal`, sort option labels in `CatalogueClient.tsx:25-31`, "Clear all", "No products match your search.").
* **Why:** adding a ternary is faster than adding a typed key in two dictionaries in a 350-line file.
* **Growth risk:** no completeness check; adding a third language is a rewrite; copy review is impossible without reading JSX.

### 6.6 God components

`ProductWorld.tsx` (987), `CatalogueClient.tsx` (670), `CheckoutModal.tsx` (547), `ExploreMediaMasonrySection.tsx` (448), `ProductDetailsClient.tsx` (425), `ExploreClient.tsx` (396), `sheets.ts` (474).

* **Why:** no convention for extracting hooks (`useWorldPointer`, `useCatalogueFilters`) or pure geometry modules.
* **Growth risk:** merge conflicts, regressions, untestable logic (pointer physics, slot geometry, carousel math are pure functions trapped in components).

### 6.7 Untyped cross-component communication

* **What:** `window.dispatchEvent(new CustomEvent("xtream-utd:…"))` with five string event names across 4 files; `document.body.classList` `"modal-open"` used both as a scroll lock **and** as a signal observed by a `MutationObserver` in `ProductWorld.tsx:436`.
* **Why:** `BottomSwitch`/`Header` live in the layout and `ProductWorld`/`ExploreClient` live in pages; there was no shared state channel.
* **Growth risk:** typos fail silently; multiple components toggling one class is order-dependent (one modal closing removes the lock another still needs).

### 6.8 Data integrity and honesty issues (violate `AGENTS.md`)

* Fabricated reviews with names, cities and 5-star ratings (`ExploreReviewsSection.tsx:20-60`) — "Do not invent … ratings".
* Invented feature line "Suitable for desks, studios and everyday routines" added to every product (`ProductDetailsClient.tsx:363-367`).
* Spec table shows hard-coded delivery text but **never renders `product.specifications`** (`ProductDetailsClient.tsx:376-393`) — real data is dropped, invented data shown.
* False success states: "Your inquiry has been sent." (`OrderInquiryModal.tsx:120`), contact form `setTimeout` "submit" (`ContactForm.tsx:108`), checkout "Order Submitted Successfully!" before the user sends anything in Messenger (`CheckoutModal.tsx:225`).
* Copy references "creator gear", "camera", "studio" from the original template (`CartDrawer` empty state, reviews, `kind: "camera"` default in schema).

### 6.9 Error/loading handling gaps

No `error.tsx`/`global-error.tsx`/`loading.tsx`; global 404 says "This product could not be found" for any URL; `/offline` Retry button does nothing; Sheets failures fall back silently with `console.error` (stale JSON served with no signal); `console.log` in production paths (`sheets.ts:258,430,441`).

### 6.10 Tooling debt

* All dependency versions are `"latest"` (`package.json`) → non-reproducible installs. Evidence: `npm run test` currently **fails to start** (`Cannot find module './rolldown-binding.wasi.cjs'` from Vitest's bundler) while `package-lock.json` has uncommitted drift.
* ESLint config uses only `@eslint/js` + `typescript-eslint`; `eslint-config-next` is installed but **not used**, so **no `react-hooks` and no Next.js rules run**. `typescript-eslint` is imported but not declared in `package.json` (works only transitively).
* `@playwright/test` is installed with no config and no tests.
* `three`, `@react-three/fiber`, `@react-three/drei` are installed but **never imported**.
* `tsconfig.tsbuildinfo` and `.cache/` are committed.

---

## 7. Dependency and Coupling Analysis

### 7.1 Observed import graph (simplified)

```text
app/layout ─► lib/products-server ─► lib/products ─► design-reference/data/*.json
                    └─(dynamic)──► lib/sheets ─► googleapis, node:fs, lib/image-utils
app/layout ─► components/site/{Header,Footer,BottomSwitch,Theme,Language}, components/cart/{CartProvider,CartDrawer}

components/site/Header ─► components/cart/CartProvider   (shell → feature)
components/cart/CartProvider ─► components/cart/CheckoutModal (state → UI)
components/cart/CheckoutModal ─► components/site/LanguageProvider, components/products/ProductArtwork, lib/order, config/site
components/details/* ─► components/{products,cart,site}/*
components/explore/ExploreClient ─► components/home/HomeFeaturesSection (explore → home)
components/catalogue/CatalogueClient ─► lib/products (pulls JSON into client bundle)
components/admin/AdminDashboard ─► lib/products (pulls JSON into client bundle)
components/* (17 files) ─► components/site/LanguageProvider
app/products/page ─► lib/products (types, stockStatuses) + parse logic inline
```

### 7.2 Coupling hotspots

| Hotspot | Kind | Why it matters |
|---|---|---|
| `components/site/LanguageProvider` | **Fan-in 20+** | Every UI file depends on a 350-line file containing both runtime and all copy. Any copy edit touches a module that all components import. |
| `lib/products.ts` | Hidden global state | Helpers behave differently depending on which data source the page used. |
| `CartProvider ↔ CheckoutModal` | Bidirectional | `CartProvider` imports `CheckoutModal`; `CheckoutModal` imports `useCart` from `CartProvider`. Works because of hoisting/runtime use, but it is a **true circular import**. |
| `site/Header → cart/CartProvider` and `site/SearchOverlay → products/ProductGrid → products/ProductCard → cart/CartProvider` | Shell depends on features | Shell can't be reused or tested without cart context. Acceptable once made explicit (shell is a composition layer). |
| `explore → home/HomeFeaturesSection` | Misplaced shared component | Folder name lies about usage. |
| `app/api/admin/save-products → design-reference/data` | Runtime writes into design assets | Couples production data to design folder. |
| Window events | Implicit coupling | Not visible in the import graph at all. |

### 7.3 Circular-dependency risks

* **Existing:** `cart/CartProvider.tsx ⇄ cart/CheckoutModal.tsx` (see above).
* **Latent:** `products/ProductCard → cart/CartProvider → cart/CheckoutModal → products/ProductArtwork` — if `ProductArtwork` ever imports from `ProductCard` (or a `products/index.ts` barrel is introduced), a cycle forms. **Barrel files would make this much worse** (see §15.4).

---

## 8. Next.js / React Analysis

> Verified against the bundled docs in `node_modules/next/dist/docs/` for Next 16.3 (e.g. `01-app/02-guides/data-security.md`, `caching-without-cache-components.md`, `03-api-reference/04-functions/unstable_cache.md`, `01-getting-started/16-proxy.md`).

### 8.1 Server/Client Components

| Observation | Assessment |
|---|---|
| Server Components are only route shells. | Underuses RSC. About, Terms, FAQ, Footer, HomeFeatures, Breadcrumb, PriceDisplay and most of ProductDetails are static markup that could render on the server. |
| The only reason most components are client is `useLanguage()` (client-side language from `localStorage`). | Root cause. As long as language is unknown on the server, **every translated string must render on the client**, and first paint is always English, then switches (content flash for Bangla users). |
| `PriceDisplay.tsx` has no directive and is imported only by client components. | Fine; it would work as a shared (isomorphic) component. |
| `ProductWorld` and `ExploreClient` render an **empty shell until `mounted`** (`ProductWorld.tsx:644`, `ExploreClient.tsx:303`). | Home page HTML contains no products for crawlers or no-JS; LCP waits for hydration + 1.5 s fly-in. The `sr-only` product link list is also post-mount only. |

### 8.2 Data fetching & caching

| Observation | Assessment |
|---|---|
| `fetchAllProducts()` called in layout **and** each page (and 3× on `[slug]`: `generateStaticParams`, `generateMetadata`, page). | No React `cache()` dedupe; correctness relies on the hand-rolled memory cache in `sheets.ts`. |
| Hand-rolled memory + **disk** cache in `.cache/` (`sheets.ts:33-109`). | Duplicates Next's Data Cache; disk writes to `process.cwd()` fail or are ephemeral on serverless hosts; cache files were committed to git. |
| `export const revalidate = 60` on pages, but layout also fetches. | Under the previous caching model the effective revalidation is the lowest of layout/page. Acceptable but implicit. |
| `/products` reads `searchParams` → fully dynamic each request. | Expected; filtering is client-side anyway. Could be static + client-read of params, but current approach (SSR the filtered first page) is SEO-friendly. Keep. |
| Next 16 recommends `'use cache'` + Cache Components and marks `unstable_cache` as replaced. | Migration to Cache Components is optional and should be a separate, later decision (§24, Phase 6). |
| `/api/revalidate` revalidates `/`, `/products`, `/explore`, `/contact` but **not** `/products/[slug]`, `/about`, `/terms`. | Product detail pages stay stale up to 60 s after a webhook. |

### 8.3 Routing & file conventions

* Missing `error.tsx`, `global-error.tsx`, `loading.tsx` (no streaming fallback for the async layout).
* `not-found.tsx` is product-specific; `/products/[slug]` should have its own `not-found.tsx` and the root one should be generic.
* `<main>` is rendered by pages (`app/page.tsx`, `products/page.tsx`) **and** by clients (`ExploreClient.tsx:305,325`) — inconsistent landmark ownership.
* `/xadmin` relies on `Header`/`BottomSwitch` returning `null` for that path — a route group with its own layout is the idiomatic fix (moot if admin is removed).
* No `proxy.ts` (formerly middleware) — none needed today.
* Metadata: per-page metadata exists; `siteConfig.url` is `https://example.com` so canonical/OG URLs cannot be correct; no `metadataBase`, sitemap, robots, or product JSON-LD.

### 8.4 React practices

| Practice | Status |
|---|---|
| Context values memoized | ✅ `useMemo` in all providers |
| Effects for subscriptions with cleanup | ✅ mostly; ❌ rAF loop in `ExploreClient` never pauses |
| `useEffect` used to sync derived state | ⚠️ e.g. `setCurrentPage(Math.min(page, pageCount))` (`CatalogueClient.tsx:150`), `setSelectedGalleryIndex(0)` on slug change (`ProductDetailsClient.tsx:102`) — prefer `key` reset or derivation |
| Unvalidated `JSON.parse` of storage | ❌ `CartProvider.tsx:44`, `ProductDetailsClient.tsx:92` |
| Array index in keys | ⚠️ `ProductWorld.tsx:701`, `ExploreClient.tsx:342` (acceptable because lists are positional/duplicated) |
| Focus management in dialogs | ❌ no focus trap or focus return in any of the 6 modals |
| `react-hooks` lint rules | ❌ not enabled (see §6.10) — dependency-array mistakes are not caught |
| Global keyboard hijack | ❌ `ProductWorld.tsx:397-409` prevents default on ArrowDown/PageDown window-wide and navigates away; `ProductWorld.tsx:565-575` any wheel ≥ 8px anywhere navigates to `/explore` |

---

## 9. State Management Analysis

| State | Where | Persistence | Assessment |
|---|---|---|---|
| Theme | `ThemeProvider` context | localStorage + inline script | ✅ Appropriate. Keep. |
| Language | `LanguageProvider` context | localStorage | ⚠️ Works, but server can't see it → forces client rendering and EN→BN flash. Recommend cookie (§19.6). |
| Cart items | `CartProvider` context | localStorage, **full `Product` snapshots** | ❌ Stale prices/titles/stock after catalogue edits; unvalidated parse; schema drift if `Product` changes. Store `{slug, variant, quantity}` and rehydrate from current catalogue. |
| Cart/checkout open flags | `CartProvider` | none | ⚠️ UI state mixed into domain state; `CheckoutModal` rendered by the provider. Split into cart state vs. shell UI. |
| Catalogue filters | `CatalogueClient` local + URL | URL | ✅ Good pattern. Move parse/serialize into one module. |
| Recently viewed | `ProductDetailsClient` effect | localStorage | ⚠️ Needs whole catalogue to resolve slugs; extract `useRecentlyViewed()` hook in the product-details feature. |
| World / explore view state | component-local `useState` + refs | sessionStorage (shuffle) | ✅ Local is right; ❌ cross-component control via window events. |
| Shell "UI ready" | window event | none | ❌ Duplicate listeners in Header & BottomSwitch. |
| Admin form state | `AdminDashboard` 14 `useState` | none | Moot (remove). |

**Conclusion:** the app does **not** need a global state library (Redux/Zustand/Jotai). Three small contexts are the right scale. What is missing is (a) typed boundaries, (b) storage validation, and (c) one small, typed channel for shell ↔ showcase commands.

---

## 10. API / Service Analysis

### 10.1 External services

| Service | Access | Assessment |
|---|---|---|
| Google Sheets API v4 | `googleapis` SDK, API key **or** service-account JWT (`sheets.ts:115-146`) | Works. The SDK is very large for two read calls; `fetch` against the REST endpoint would integrate with Next's fetch cache and drop a heavy dependency (optional, §19.4). Sheet discovery is heuristic (title contains "product", hard-coded `sheetId === 662705131` for gallery at `sheets.ts:438`). |
| Google Drive / lh3 images | Direct `<img>` URLs with a 3-candidate fallback chain | Fine for now; depends on public Drive sharing and Google's undocumented URL formats. |
| YouTube | `youtube-nocookie` embeds | ✅ privacy-friendly choice. |
| Facebook Messenger | `m.me/<page>?text=` deep link | The ordering "backend". Message length limits and encoding should be tested. |

### 10.2 Internal route handlers

| Route | Used by UI? | Verdict |
|---|---|---|
| `POST /api/admin/save-products` | No | **Remove.** Writes to `design-reference/` (read-only on most hosts), no auth. |
| `POST /api/admin/save-settings` | No | **Remove.** Writes arbitrary unvalidated JSON, no auth. |
| `POST /api/admin/upload-image` | No | **Remove.** Path traversal + arbitrary file write, no auth, no type/size check. |
| `GET /api/image-proxy` | No | **Remove** (or restrict to validated Drive IDs + same-origin). |
| `POST/GET /api/revalidate` | External webhook | **Keep, harden**: fail closed, POST only, header token only, include slug pages. |

### 10.3 Service-layer shape

There is no explicit service layer; `products-server.ts` is a 2-function facade and `sheets.ts` mixes transport, caching, table parsing and domain mapping. The **parsing of a sheet row into a `Product` is the most valuable and most fragile piece of logic in the codebase** (column aliases such as the typo `"ppecifications"`, pipe-splitting, Drive URL normalization) and it has **zero tests**.

---

## 11. TypeScript / Code Organization Analysis

| Topic | Observation | Recommendation |
|---|---|---|
| Strictness | `strict: true`, `isolatedModules`, no `any`. | Keep. Consider `noUncheckedIndexedAccess` later (many `row[idx]` and `arr[0]` accesses). |
| Single type source | `Product` from `z.infer` ✅. But sheets path constructs `Product` literals manually → type-correct but **unvalidated** (e.g. `accent` regex transform skipped). | Route every external row through `productSchema.parse`. |
| Unsafe casts | `rawProducts as unknown as Product[]` (`products.ts:32`) defeats validation on failure; `response.data.values as string[][]`; `formData.get("file") as File`; `JSON.parse(...) as string[]`. | Replace with schema parsing / type guards. |
| Duplicated shapes | `cover_image` + `poster_image_url`, `gallery_images` + `gallery_images_url` both populated with the same values (`sheets.ts:386-390`). | Normalize to one set at the data boundary. |
| Naming | Domain uses snake_case (`old_price`, `new_arrival`) mirroring JSON; gallery uses camelCase. Components are PascalCase; `*Client` suffix for page roots. | Keep snake_case `Product` for now (renaming is high-churn, low value). Keep `*Client` suffix only for the client root of a route if still needed; drop it for components that become server components. |
| Stringly-typed unions | `SortKey` duplicated as a literal check in `app/products/page.tsx:72`; stock statuses duplicated (`stockStatusSchema` + `stockStatuses` array + translation map keys). | Derive arrays from the Zod enum (`stockStatusSchema.options`) and a `sortKeys` const tuple. |
| Translation keys | `TranslationKey` is a hand-maintained 80-member union separate from the dictionaries. | Derive keys from the English dictionary: `type TranslationKey = keyof typeof en`; type `bn` as `Record<TranslationKey, string>`. |
| Dead code | `getSuggestedCategories`, `isDiscounted`, `isGoogleDriveUrl`, `getYouTubeThumbnailUrl`, `toggleCart`, `setLanguage`, `isEditablePlaceholder` (no placeholders remain), `formatDiscount`'s callers only in `PriceDisplay`, translation keys like `recently_viewed`, `scroll_to_zoom`; `kind` / `badge` fields barely used. | Remove during the relevant phase (verify with grep at that time). |
| Encoding | `sheets.ts` starts with a UTF-8 BOM; other files don't. | Normalize (cosmetic). |

---

## 12. Performance Analysis

| # | Issue | Evidence | Impact | Fix direction |
|---|---|---|---|---|
| P1 | Full catalogue in every RSC payload | `layout.tsx:49` → `Header products` | Grows with catalogue × pages | Search via `/products?q=` or a slim `ProductSearchItem[]` (slug, title, category, price, image) or a small search route handler |
| P2 | Catalogue twice on detail pages | `[slug]/page.tsx` → `allProducts` | Double payload | Pass `ProductSummary[]` or resolve recently-viewed via a server action/route |
| P3 | JSON bundled into client JS | client imports of `@/lib/products` | Bundle grows with fallback data | Pure helpers must not import data; data only in `server/` |
| P4 | 12.6k-line global CSS on every route | `app/globals.css` | Render-blocking CSS, unused rules | Split by feature; later consider CSS Modules for feature-scoped rules |
| P5 | All images `loading="eager"`, raw `<img>` | `ProductArtwork.tsx:144` | Up to ~50 world cards + 18+ carousel cards load at once | `loading="lazy"` except above-the-fold; evaluate `next/image` with `remotePatterns` for `lh3.googleusercontent.com` |
| P6 | Explore rAF loop runs forever | `ExploreClient.tsx:239-262` | CPU/battery drain even when tab hidden is mitigated by browser, but loop continues while paused/modal-open/scrolled away | Stop when settled; pause when `isPaused` or section off-screen (IntersectionObserver) |
| P7 | Home world renders nothing on the server | `ProductWorld.tsx:644` | LCP ≥ hydration + 1.5 s fly-in | SSR a static first frame with default geometry; animate after hydration |
| P8 | Per-move React state updates in world drag | `ProductWorld.tsx:525` `setWorldView` on each pointermove | Re-renders up to 50 cards per pointer event | Write CSS variables via ref inside rAF (the explore code already does this well) |
| P9 | `googleapis` | `sheets.ts:12` | Large server dependency, slower cold starts | Optional switch to REST via `fetch` |
| P10 | 3 fetches on `[slug]` + layout | no `cache()` | Redundant work if memory cache misses | Wrap data access in React `cache()` |
| P11 | Unused heavy deps installed | `three`, R3F, drei | Install time only (not bundled) | Remove, or isolate behind `next/dynamic` if WebGL is reinstated |

---

## 13. Security Analysis

Ranked by severity. **S1–S3 should be fixed before any production deployment, independent of the restructuring.**

### S1 — Hard-coded admin credentials in client bundle (Critical)
* **Current:** `AdminLoginClient.tsx:23` compares against a literal email and password in browser JavaScript. Anyone can read it from DevTools or the git history. If that password is reused for the business Gmail account, the account is compromised.
* **Recommendation:** delete the client-side login and the dashboard (it saves nothing). **Rotate that password everywhere it is used.** Treat it as public. `AGENTS.md` forbids adding authentication unless explicitly requested; the Google Sheet already acts as the admin.
* **Risk of fix:** none functionally — the dashboard is non-functional today.

### S2 — Unauthenticated filesystem-writing API routes (Critical)
* **Current:** `/api/admin/upload-image` takes `folder` from form data and does `path.join(process.cwd(), "public", "products", subfolder)` (`route.ts:9,17`) → `folder=../../app` style traversal writes arbitrary files on hosts with a writable FS; no auth, no MIME/size limits. `/api/admin/save-settings` writes any JSON body to disk; `/api/admin/save-products` overwrites the fallback catalogue.
* **Recommendation:** delete all three routes. If admin capabilities are requested later, design them with real auth (per Next's `authentication.md`/`data-security.md` guidance: verify session inside each route/action, never in the client).

### S3 — Credentials committed in `.env.local.example` (High)
* **Current:** lines 3-5 contain a real-looking spreadsheet ID, service-account email, and an `AIza…` Google API key placed in the `PRIVATE_KEY` variable.
* **Recommendation:** rotate the API key in Google Cloud, replace example values with obvious placeholders, document required scopes. Keep secrets only in host env.

### S4 — Fail-open, GET-triggerable revalidation (Medium)
* **Current:** `api/revalidate/route.ts:13` only checks the token **if** `REVALIDATION_SECRET` is set; `GET` calls `POST`; token accepted in query string (logged by proxies).
* **Recommendation:** require the secret (500/401 when unset), POST only, header token only, constant-time compare, revalidate product detail pages too.

### S5 — Open image proxy (Medium)
* **Current:** `api/image-proxy` fetches arbitrary Drive IDs with a spoofed browser User-Agent, buffers whole images in memory and returns `Access-Control-Allow-Origin: *`. Unused by the app.
* **Recommendation:** delete. If needed later: strict ID regex, size cap, same-origin only, cache headers, rate limiting at the edge.

### S6 — No security headers (Low/Medium)
* No CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame-ancestors. Inline theme script exists (needs a nonce/hash if CSP is added).
* **Recommendation:** add `headers()` in `next.config.mjs` in a dedicated phase; CSP must allow YouTube-nocookie frames and Google image hosts.

### S7 — Client storage trust (Low)
* `localStorage` cart is parsed without validation and its **prices are trusted** when building the order message. A user can edit prices locally; the seller confirms manually so impact is low, but the message should be built from current catalogue prices.

### S8 — Server-only code is not enforced (Low, structural)
* `sheets.ts`/`products-server.ts` read `process.env` secrets and are importable from client files by accident. Next's data-security guide recommends a Data Access Layer marked with `import "server-only"`.

---

## 14. Scalability Analysis

| Dimension | Today | Breaks at | Why |
|---|---|---|---|
| Catalogue size | 18–25 products | ~150–300 products | Full-catalogue payload on every page (P1/P2), client-side filtering, world shows ≤ 50 cards, explore duplicates list to ≥ 18 nodes all animated each frame |
| Number of pages/features | 8 routes | each new page adds to the single CSS file and the single dictionary file | No feature boundaries |
| Languages | 2 | 3rd language | 266 inline ternaries |
| Contributors | ~1 | 2–3 parallel | God components and a 12.6k-line CSS file guarantee merge conflicts |
| Data sources | JSON + Sheets | any third source | Hidden JSON coupling in helpers; ad-hoc sheet parsing |
| Hosting | Node with writable FS assumed | serverless/edge | Disk cache in `.cache/`, admin routes writing to `public/` |
| Business rule changes | — | first delivery-fee change | ~12 edit sites (§6.4) |

---

## 15. Recommended Architecture

### 15.1 Options considered

| Option | Fit for this project | Verdict |
|---|---|---|
| **Pure layered** (`components/`, `hooks/`, `services/`, `utils/`, `types/`) | Similar to today; spreads one feature across 5 folders; doesn't solve the scattering problem. | ❌ Rejected |
| **Pure feature-based** (everything under `features/*`) | Good cohesion, but the `Product` model and its rules are used by *every* feature — forcing it into one feature creates feature→feature imports. | ⚠️ Partially |
| **Feature-Sliced Design (FSD)** (app/pages/widgets/features/entities/shared) | Conceptually sound, but 6 layers with strict rules is heavy for ~40 components and one domain entity; terminology overhead for a small team. | ❌ Too heavy |
| **Clean/Hexagonal** (use cases, ports/adapters, DI) | Only one real external port (Sheets) and no writes. Ceremony > benefit. | ❌ Rejected |
| **Monorepo / packages** | Single app, single team. | ❌ Rejected |
| **Feature-based + shared + domain + server DAL** ("feature + layered light") | Features own their UI/hooks/local logic; the one cross-cutting entity (`product`) is a pure domain module; data access is an explicit server-only layer; `app/` stays thin. | ✅ **Recommended** |

### 15.2 Why this fits *this* codebase

1. The codebase already has the **right route shape** (thin `page.tsx` → feature root component). We keep it and only move what's under it.
2. There is **exactly one domain entity with real rules** (product: pricing, discount, stock, filter, sort, related) plus a small **commerce policy** (delivery zones/fees, phone format, order message). A small `domain/` module captures all of it without inventing abstractions.
3. There is **exactly one server boundary** that matters (Sheets/JSON + secrets). Next 16's own guidance is a server-only Data Access Layer — that maps directly to `src/server/`.
4. The worst problems (§6.2–6.5) are **"no designated home"** problems. Feature folders + `shared/` + `config/` + `content/` give every scattered thing a home.
5. It is **incremental**: each folder can be introduced while old paths still work (via moves + import updates), validated by lint/typecheck/tests/screenshots at every step.

### 15.3 Architectural principles

1. **Routes are thin.** `app/**` files: metadata, params parsing (via feature helpers), one data call, one feature component. No business logic.
2. **Pure domain, no I/O.** `src/domain/**` never imports React, Next, `fetch`, `fs`, `process.env`, or JSON data. Every function receives its data as arguments.
3. **Data enters through one door.** Only `src/server/**` touches Sheets, JSON fallback, env secrets and caching; it is marked `server-only` and validates everything with Zod.
4. **Server by default, client at the leaves.** Interactive islands are client components; static sections are server components (fully realizable once language is server-readable — §19.6).
5. **One home per rule.** Fees, phone format, categories, copy, order-message format each live in exactly one module.
6. **No invented data.** UI renders only what data/config provides; missing data → hide the section, never fabricate.
7. **Explicit over clever.** Typed props, typed contexts, typed event helpers — no barrels, no DI containers, no generic repositories.

### 15.4 Abstractions worth introducing

| Abstraction | Why (evidence) |
|---|---|
| `server/catalog` DAL: `getProducts()`, `getProductBySlug()`, `getGalleryItems()` wrapped in React `cache()` | Removes triple fetching and hidden JSON coupling (§6.2, P10) |
| `domain/product` pure module (schema, pricing, filter, sort, related, categories) — all taking `products` as a parameter | Fixes two-sources-of-truth |
| `domain/commerce` (delivery zones & fees as numbers, BD phone schema, order message builder) | Consolidates §6.4 |
| `ProductSummary` DTO + `toProductSummary()` | Shrinks payloads (P1/P2) |
| `features/catalogue/lib/catalogue-query.ts` (`parseCatalogueQuery` / `serializeCatalogueQuery`) | Puts both halves of the URL contract in one tested module |
| `shared/ui/Dialog` (+ `useBodyScrollLock` with ref-counting, focus trap, focus restore, Esc) | Replaces 6 hand-rolled modals |
| `shared/i18n` with typed dictionaries per namespace | Removes 266 ternaries; enables server translation |
| `shared/lib/storage.ts` (`readJson(key, schema)` / `writeJson`) | Validated localStorage access (S7) |
| Typed showcase command channel (`features/showcase/lib/showcase-events.ts`: `emitShowcase(cmd)`, `useShowcaseEvent(cmd, handler)`) | Types the window bus without adding a library |
| `useScrollPosition`-style shared hook (single passive listener) | 4 duplicate scroll listeners |
| Pure geometry modules (`world-layout.ts`, `carousel-math.ts`) | Make the hardest-to-change code testable |

### 15.5 Abstractions that should NOT be introduced

| Don't introduce | Reason |
|---|---|
| Redux / Zustand / Jotai / any global store | 3 small contexts suffice (§9) |
| React Query / SWR | No client-side data fetching exists or is needed; RSC fetches |
| Repository interfaces, DI containers, "use case" classes | One read-only data port; adds indirection with no second implementation beyond JSON fallback (which is a function, not an interface hierarchy) |
| A generic `apiClient` / `httpService` | There are no internal APIs the client calls |
| Barrel files (`index.ts` re-exports) | Hide cycles (§7.3), defeat tree-shaking of client/server boundaries, slow tooling |
| A component library dependency (MUI, Chakra, shadcn wholesale) | The design system is custom and already implemented in CSS |
| Tailwind migration now | `AGENTS.md` allows "Tailwind or an equivalent token system"; 12.6k lines of working CSS + tokens exist. A migration is a rewrite with high visual-regression risk and no functional gain. Revisit only if CSS splitting fails. |
| i18n framework (next-intl, i18next) — **optional, not default** | Two languages, ~300 strings; a typed dictionary + cookie is sufficient. Revisit if a 3rd language or pluralization rules appear. |
| Payments, auth, database | Forbidden by `AGENTS.md` unless requested |

### 15.6 Architecture patterns to avoid

* Module-level data imports inside helpers ("hidden globals").
* Page-named component folders for shared components (`home/HomeFeaturesSection` used by explore).
* Inline translation ternaries.
* UI components rendered by state providers (`CartProvider` → `CheckoutModal`).
* String-typed window events and DOM class signalling between components.
* Global listeners that hijack wheel/keyboard outside the component's own element.
* Writing to the project filesystem at runtime.
* "Second pass" CSS override layers and `!important` to win specificity wars.
* Success UI for actions that did not happen.

---

## 16. Proposed Folder Structure

### 16.1 Target tree

```text
app/                                   # ROUTING ONLY (thin)
  layout.tsx                           # html/body, fonts, providers, AppShell
  globals.css                          # imports only: tokens, base, then feature CSS (see 16.3)
  not-found.tsx                        # generic 404
  error.tsx  global-error.tsx          # NEW
  page.tsx                             # → features/showcase HomeWorld
  explore/page.tsx                     # → features/showcase ExploreShowcase
  products/
    page.tsx                           # → features/catalogue CatalogueView
    loading.tsx                        # NEW (optional)
    [slug]/
      page.tsx                         # → features/product-details ProductDetailsView
      not-found.tsx                    # NEW product-specific 404 (moved copy)
  about/page.tsx   contact/page.tsx   terms/page.tsx   offline/page.tsx
  api/revalidate/route.ts              # hardened; the only route handler kept

src/
  config/
    site.ts                            # identity, URLs, contact channels, hours (existing, trimmed)
    commerce.ts                        # NEW: delivery zones { id, fee: number, eta }, currency, COD flag
  content/                             # NEW: long-form editable copy, per language
    about.ts  terms.ts  contact-faq.ts  trust-points.ts
  domain/                              # PURE, isomorphic, no React/Next/I/O
    product/
      product-schema.ts                # from lib/product-schema.ts (+ normalized image fields)
      product-summary.ts               # ProductSummary DTO + toProductSummary()
      pricing.ts                       # from lib/format.ts (discount logic)
      catalogue-filter.ts              # filterProducts, sortProducts, matches search (from lib/products.ts)
      related-products.ts              # getRelatedProducts(product, all)
      categories.ts                    # getCategories(all), counts
      *.test.ts
    commerce/
      delivery.ts                      # fee/zone lookups using config/commerce.ts
      phone.ts                         # BD mobile Zod schema (single rule)
      order-message.ts                 # ONE builder for cart checkout + single-product inquiry
      checkout-schema.ts               # Zod schema for checkout form
      *.test.ts
    gallery/
      gallery-schema.ts                # from lib/gallery-schema.ts
  server/                              # SERVER-ONLY ("server-only" import in each entry)
    env.ts                             # Zod-validated env (Sheets config detection in one place)
    catalog/
      get-products.ts                  # getProducts(), getProductBySlug(), getGalleryItems() + React cache()
      sources/
        local-json.ts                  # the ONLY importer of the JSON fallback
        google-sheets/
          client.ts                    # auth + values.get
          table.ts                     # header detection, getCol, pipeSplit (shared by both tabs)
          parse-products.ts            # row → unknown → productSchema.parse
          parse-gallery.ts             # row → galleryItemSchema.parse
          __fixtures__/*.json          # captured sheet rows for tests
          *.test.ts
  features/
    shell/                             # app chrome; composition layer
      components/  Header.tsx  MobileMenu.tsx  Footer.tsx  BottomDock.tsx  AppShell.tsx
      hooks/       useScrollThreshold.ts
    search/
      components/  SearchDialog.tsx
      lib/         search-index.ts     # slim index from ProductSummary[]
    catalogue/
      components/  CatalogueView.tsx  CatalogueToolbar.tsx  FilterPanel.tsx  Pagination.tsx
                   ActiveFilterChips.tsx  CatalogueEmptyState.tsx
      hooks/       useCatalogueFilters.ts
      lib/         catalogue-query.ts  # parse + serialize URL params (+ tests)
    product/                           # product UI reused by many features
      components/  ProductCard.tsx  ProductGrid.tsx  ProductImage.tsx (was ProductArtwork)
                   PriceDisplay.tsx  StockBadge.tsx
      lib/         image-candidates.ts # from lib/image-utils.ts (shared w/ gallery)
    product-details/
      components/  ProductDetailsView.tsx  ProductGallery.tsx  BuyBox.tsx  VariantSelector.tsx
                   QuantityStepper.tsx  SpecificationsCard.tsx  RelatedProducts.tsx
                   RecentlyViewed.tsx  InquiryDialog.tsx
      hooks/       useRecentlyViewed.ts
    cart/
      components/  CartDrawer.tsx  CheckoutDialog.tsx  CheckoutForm.tsx  OrderSummary.tsx
                   CartLineItem.tsx
      state/       CartProvider.tsx    # state only; stores {slug, variant, qty}
      hooks/       useCart.ts
    showcase/                          # home world + explore
      world/       HomeWorld.tsx  WorldCard.tsx  WorldPreview.tsx
                   world-layout.ts (slot tables + geometry)  useWorldPointer.ts  *.test.ts
      explore/     ExploreShowcase.tsx  ExploreCarousel.tsx  carousel-math.ts  useCarouselLoop.ts
                   MediaMasonry.tsx  masonry-layout.ts  TopSelling.tsx  TrustFeatures.tsx
      lib/         showcase-events.ts  # typed command channel
    contact/
      components/  ContactView.tsx  ContactChannels.tsx  ContactForm.tsx  ContactFaq.tsx
    content-pages/
      components/  AboutView.tsx  TermsView.tsx
  shared/
    ui/            Dialog.tsx  Breadcrumb.tsx  Button.tsx (only if duplication justifies)  Icon wrappers
    hooks/         useBodyScrollLock.ts  useMediaQuery.ts  usePrefersReducedMotion.ts  useMounted.ts
    i18n/
      dictionaries/ en/*.ts  bn/*.ts   # namespaced: common, catalogue, cart, product, contact…
      translate.ts                     # pure t(dict, key) for server & client
      LanguageProvider.tsx             # client context (reads initial lang from server)
      get-language.ts                  # server: reads cookie (phase 6)
      format.ts                        # toBengaliDigits, formatNumber
    theme/         ThemeProvider.tsx  theme-script.ts
    lib/           format-price.ts  storage.ts  cn.ts (only if needed)
  styles/
    tokens.css  base.css  utilities.css  # split from globals.css

tests/
  e2e/             smoke.spec.ts  catalogue.spec.ts  checkout.spec.ts
  visual/          pages.spec.ts           # screenshots @ 390 / 820 / 1440 widths
playwright.config.ts
```

### 16.2 Current → proposed (summary)

```text
src/lib/products.ts           →  src/domain/product/{catalogue-filter,related-products,categories}.ts
                                 + src/server/catalog/sources/local-json.ts (the JSON import)
src/lib/products-server.ts    →  src/server/catalog/get-products.ts + src/server/env.ts
src/lib/sheets.ts             →  src/server/catalog/sources/google-sheets/{client,table,parse-products,parse-gallery}.ts
src/components/site/*         →  src/features/shell/* , src/shared/{i18n,theme,ui}/*
src/components/products/*     →  src/features/product/components/*
src/components/world/*        →  src/features/showcase/world/*
src/components/explore/*      →  src/features/showcase/explore/*
src/components/home/*         →  src/features/showcase/explore/TrustFeatures.tsx
src/components/admin/*, app/xadmin, app/api/admin/*, app/api/image-proxy   →  DELETED
```

### 16.3 CSS organization

```text
app/globals.css           @import order: tokens → base → shared/ui → feature files → theme-light overrides (temporary)
src/styles/tokens.css     :root + [data-theme] custom properties (existing 75 tokens)
src/styles/base.css       resets, typography, .sr-only, .page-main, buttons
src/features/*/**.css     one file per feature, moved verbatim first (no rule changes)
```

Phase 1 of CSS work is a **pure move** (same rules, same order) so the cascade is unchanged and screenshot diffs should be zero. Only after that, per feature, collapse "second pass" overrides and reduce `!important`. CSS Modules can be adopted per feature later if desired; not required.

---

## 17. Layer Responsibilities

| Layer | Owns | Must NOT |
|---|---|---|
| **`app/`** (routes) | URL structure, metadata, `generateStaticParams`, segment config, error/loading/not-found boundaries, calling `server/` and rendering one feature view | contain business rules, parsing beyond delegating to feature helpers, styling, client hooks |
| **`src/server/`** (DAL) | env access, Sheets/JSON sources, Zod validation of external data, caching (`cache()`, later `'use cache'`), DTO shaping (`toProductSummary`) | be imported by client components (enforced by `server-only`), render UI |
| **`src/domain/`** | pure product & commerce rules, schemas, types | import React/Next/`fs`/`fetch`/`process.env`/JSON data/`config` copy text (it may import numeric `config/commerce`) |
| **`src/features/*`** | UI, hooks and feature-local logic for one capability | import another feature's internals (exceptions: `shell` composes others; `product` is a shared UI feature — see §18) |
| **`src/shared/`** | generic, product-agnostic UI primitives, hooks, i18n, theme, utilities | import from `features/`, `server/` or know about products |
| **`src/config/`** | editable business facts as typed constants (numbers/URLs/strings) | contain logic |
| **`src/content/`** | long-form, per-language copy (About, Terms, FAQ, trust points) | contain logic or invented claims |
| **`styles/` + feature CSS** | visual system | be referenced by logic |
| **`tests/`** | e2e + visual; unit tests colocated as `*.test.ts` next to the code | depend on live Sheets |

### 17.1 Server/client boundary rules

* `"use client"` only at **interactive leaves**: `HomeWorld`, `ExploreCarousel`, `MediaMasonry`, `CatalogueView` (or its interactive parts), `BuyBox`, `ProductGallery`, `CartDrawer`, `CheckoutDialog`, `SearchDialog`, `Header` actions, `ContactForm`, providers.
* Static sections (`SpecificationsCard`, `RelatedProducts` grid wrapper, `AboutView`, `TermsView`, `ContactFaq`, `Footer` body, `TrustFeatures`) become **server components** once language is server-readable (Phase 6). Until then they stay client, but already receive translated strings from typed dictionaries.
* Props crossing the boundary are **serializable DTOs** (`ProductSummary`, `Product`), never functions or class instances.

### 17.2 Error-handling responsibilities

| Concern | Owner |
|---|---|
| External data failure (Sheets) | `server/catalog`: log once with context, fall back to JSON, expose `source: "sheets" | "fallback"` for diagnostics |
| Invalid rows | `parse-products.ts`: skip row, collect issues, log summary (not per-row spam) |
| Unknown slug | `app/products/[slug]/page.tsx` → `notFound()` → segment `not-found.tsx` |
| Unexpected render errors | `app/error.tsx` (segment) + `app/global-error.tsx` |
| Client storage corruption | `shared/lib/storage.ts` returns fallback and clears the key |
| Clipboard/share failures | feature hooks surface a non-blocking message; never claim success on failure |

### 17.3 Testing structure

| Level | Location | Tool | What |
|---|---|---|---|
| Unit | `src/domain/**/*.test.ts`, `src/server/**/*.test.ts`, `src/features/**/lib/*.test.ts` | Vitest (node env) | pricing, filter/sort, related, categories, catalogue-query round-trip, order message, phone schema, sheet parsing from fixtures, world/carousel geometry |
| Component (optional) | colocated `*.test.tsx` | Vitest + jsdom + Testing Library (**new dev deps — only if approved**) | Dialog focus behaviour, CheckoutForm validation |
| E2E | `tests/e2e` | Playwright (already installed) | home loads, click vs drag, catalogue filter → URL, product → add to cart → checkout message, language toggle, theme toggle, keyboard-only path, reduced-motion |
| Visual | `tests/visual` | Playwright screenshots | every route at 390 / 820 / 1440 px, dark & light |

Test data must come from `__fixtures__/`, not from the live fallback JSON, so editing the catalogue never breaks tests (today `products.test.ts` asserts on specific slugs/categories in `sample_products.json`).

---

## 18. Dependency Rules

### 18.1 Allowed directions

```text
            app/
             │
     ┌───────┼───────────┐
     ▼       ▼           ▼
 features/  server/   shared/ ◄──────────┐
     │  │      │          ▲              │
     │  └──────┼──────────┘              │
     ▼         ▼                         │
   domain/ ◄───┘                         │
     │                                   │
     ▼                                   │
  config/ , content/ ────────────────────┘ (readable by features, server, app; domain may read numeric config only)
```

| From ↓ / To → | app | features | server | domain | shared | config/content |
|---|---|---|---|---|---|---|
| **app** | — | ✅ | ✅ | ✅ (types) | ✅ | ✅ |
| **features** | ❌ | ⚠️ see 18.2 | ❌ (types only via `domain`) | ✅ | ✅ | ✅ |
| **server** | ❌ | ❌ | — | ✅ | ✅ (pure utils only) | ✅ |
| **domain** | ❌ | ❌ | ❌ | — | ❌ | ✅ numeric config only |
| **shared** | ❌ | ❌ | ❌ | ❌ | — | ✅ |

### 18.2 Feature-to-feature rules

* `shell` may import other features' **public components** (it is the composition layer: Header → `search`, `cart`).
* `product` (ProductCard, ProductImage, PriceDisplay, StockBadge) is a **shared product-UI feature**: any feature may import it; it may import `cart` hooks only through a callback prop (`onAddToCart`) — preferred — to avoid `product → cart` coupling.
* All other cross-feature imports are **forbidden**; if two features need the same thing, move it to `domain/`, `shared/`, or `product/`.
* No deep imports into another feature's `hooks/` or `lib/` (only `components/` entry files, and `cart/hooks/useCart`).

### 18.3 Enforcement

* `import "server-only"` at the top of every `src/server/**` entry (Next resolves this module; confirm at implementation time against `node_modules/next/dist/docs/01-app/02-guides/data-security.md`).
* ESLint `no-restricted-imports` patterns per folder (e.g. in `src/domain/**`: forbid `react`, `next/*`, `@/server/*`, `@/features/*`, `node:*`, `*.json`). Uses ESLint core — **no new dependency**.
* Enable `eslint-config-next` (already installed) to get `react-hooks` and Next rules.
* Optional later: `madge --circular` in CI (would be a new dev dependency — only if approved).

---

## 19. Refactoring Recommendations

Format per item: **Current → Problem → Recommended → Reason → Benefit → Risk.**

### 19.1 Remove the admin surface and unused route handlers
* **Current:** `/xadmin` with hard-coded credentials; 3 unauthenticated admin write APIs; unused image proxy.
* **Problem:** critical security exposure; violates `AGENTS.md` (no auth/DB unless requested); non-functional.
* **Recommended:** delete `app/xadmin`, `src/components/admin`, `app/api/admin/*`, `app/api/image-proxy`, the `/xadmin` checks in Header/BottomSwitch, and the admin CSS block (`globals.css` ~11447–end of admin section). Rotate the password and API key.
* **Reason:** Google Sheets already is the admin; nothing in the UI calls these routes.
* **Benefit:** removes S1/S2/S5, ~700 LOC and ~1,100 lines of CSS.
* **Risk:** Low. Confirm with the owner that nobody relies on `/xadmin` for demos.

### 19.2 Single-source data access layer
* **Current:** `products.ts` imports JSON at module scope; helpers read it implicitly; `products-server.ts` duplicates env checks; pages fetch 1–3× per request.
* **Problem:** wrong categories, related products and sort order when Sheets is active (§6.2).
* **Recommended:** `src/server/catalog/get-products.ts` exports `getProducts()` (React `cache()`-wrapped) that returns `{ products, source }`; `local-json.ts` is the only JSON importer; every domain helper takes `products` as an argument (`getCategories(products)`, `getRelatedProducts(product, products)`, sort tie-break by index in the given array or an explicit `position` field).
* **Reason:** Next 16 Data Access Layer guidance; pure functions are testable.
* **Benefit:** correctness in production, smaller client bundles, one place for caching.
* **Risk:** Medium — sort/related output changes (it becomes *correct*); covered by unit tests + e2e.

### 19.3 Validate every external row with Zod; split `sheets.ts`
* **Current:** 474-line module; products built as literals bypassing `productSchema`; duplicated header detection/caching; disk cache in `.cache/`.
* **Recommended:** `client.ts` (auth/transport), `table.ts` (header detection, column aliases, `pipeSplit`), `parse-products.ts` / `parse-gallery.ts` (row → `schema.safeParse`, collect issues), remove disk cache (rely on Next data cache / ISR), remove hard-coded `sheetId 662705131` in favour of configured tab names in `server/env.ts` (with current heuristic as fallback).
* **Benefit:** testable with fixtures; consistent normalization (accent, stock); serverless-safe.
* **Risk:** Medium — removing the disk cache changes build-time behaviour (it existed "for multi-worker SSG builds", `sheets.ts:251`). Mitigate with React `cache()` + measuring Sheets API quota during `next build`; keep an opt-in memory cache if needed.

### 19.4 (Optional) Replace `googleapis` with REST `fetch`
* **Current:** full SDK for 2 GET calls.
* **Recommended:** `fetch("https://sheets.googleapis.com/v4/spreadsheets/{id}/values/{range}?key=…")` for API-key mode; service-account mode needs a JWT → keep SDK *or* use `google-auth-library` only.
* **Benefit:** lighter cold start; native Next fetch caching with tags.
* **Risk:** Medium; only worth it if API-key mode is the production mode. **Decide with owner.**

### 19.5 Consolidate commerce rules
* **Current:** fees/phone/order message/Messenger URL duplicated (§6.4).
* **Recommended:** `config/commerce.ts` (`deliveryZones: [{ id: "dhaka", fee: 70, eta: {min:24,max:48} }, …]`), `domain/commerce/{delivery,phone,order-message,checkout-schema}.ts`; all copy that mentions fees formats them from config via `formatPrice`.
* **Benefit:** a fee change is one edit; checkout, FAQ, terms and about can never disagree.
* **Risk:** Low; copy strings must be re-templated in both languages.

### 19.6 Typed i18n, then server-readable language
* **Current:** client-only `LanguageProvider` with an 80-key union + 266 inline ternaries.
* **Recommended (two steps):**
  1. Move dictionaries to `shared/i18n/dictionaries/{en,bn}/<namespace>.ts`; derive key types from `en`; replace all ternaries with `t()` calls; long-form copy to `src/content/`. No behaviour change.
  2. Persist language in a **cookie** (set by the toggle, read by `get-language.ts` on the server via `cookies()`); pass initial language to `LanguageProvider`; convert static sections to server components. Keep `localStorage` read once for migration.
* **Reason:** routes are fixed by `AGENTS.md` (no `/[lang]` segment), so a cookie is the least invasive server-readable option.
* **Benefit:** no EN→BN flash, smaller client JS, completeness checking by type.
* **Risk:** Step 2 makes pages that read cookies **dynamic** (loses static/ISR for those routes) unless using Cache Components with the cookie read inside a dynamic hole. **This trade-off needs an owner decision** (see §26).

### 19.7 Slim payloads (`ProductSummary`)
* **Current:** full `Product[]` to Header and ProductDetails.
* **Recommended:** `ProductSummary = Pick<Product, "slug"|"title"|"category"|"price"|"old_price"|"stock"|"accent"> & { image: string }`; Header search gets summaries (or search becomes navigation to `/products?q=` with suggestions computed from summaries); recently-viewed uses summaries.
* **Benefit:** payload no longer scales with description/spec size.
* **Risk:** Low; ProductCard must accept `ProductSummary` (it uses only those fields + tags for search — keep search text field in the index).

### 19.8 Cart stores references, not snapshots
* **Current:** `localStorage` holds full `Product`; prices can be stale/tampered; unvalidated `JSON.parse`.
* **Recommended:** persist `{ slug, variant, quantity }[]` validated by Zod; resolve against current `ProductSummary[]` (provided once by the layout) at render; drop lines whose slug vanished; move `CheckoutModal` out of `CartProvider` into the shell; split UI flags (`isOpen`) from cart state.
* **Benefit:** correct prices in order messages; schema changes don't corrupt carts.
* **Risk:** Medium — existing carts in users' browsers must be migrated (read old shape once, map to slugs).

### 19.9 One Dialog primitive
* **Current:** 6 bespoke modals; no focus trap/restore; shared `modal-open` class toggled by many owners.
* **Recommended:** `shared/ui/Dialog.tsx` built on native `<dialog>` (`showModal()` gives inert background + Esc) or a small focus-trap hook; `useBodyScrollLock` with a ref-counter; showcase pause subscribes to a `useAnyDialogOpen()` signal instead of a `MutationObserver` on `body.class`.
* **Benefit:** accessibility compliance (`AGENTS.md`: keyboard support) in one place.
* **Risk:** Medium — visual styles of each modal must be preserved (keep existing class names on the panel).

### 19.10 Typed showcase command channel
* **Current:** 5 string events on `window`.
* **Recommended:** `features/showcase/lib/showcase-events.ts` with `type ShowcaseCommand = "world-home" | "world-reload" | "world-ui-ready" | "explore-prev" | "explore-next"`, `emitShowcase(cmd)`, `useShowcaseEvent(cmd, handler)`; one `useShowcaseReady()` hook used by Header and BottomDock.
* **Reason:** smallest change that adds type safety; a React context would re-render the shell on every command.
* **Risk:** Low.

### 19.11 Decompose the showcase components
* **Current:** `ProductWorld.tsx` 987 lines; `ExploreClient.tsx` 396; carousel/masonry math inline.
* **Recommended:** extract slot tables + `getShowcaseSlots/Scale/StageStyle/FlyInOrigin` into `world-layout.ts` (pure, tested); pointer/drag logic into `useWorldPointer`; hover-preview timers into `useHoverPreview`; carousel `place()` math into `carousel-math.ts`; rAF loop into `useCarouselLoop` that stops when settled/paused/off-screen; scope wheel/keyboard listeners to the section element (no global hijack) and respect `prefers-reduced-motion` in JS; SSR a static first frame.
* **Benefit:** testable geometry; fixes P6/P7/P8 and keyboard hijack.
* **Risk:** Medium-High — this is the signature UX; requires screenshot + interaction e2e before and after.

### 19.12 Catalogue query module and component split
* **Current:** parse in `app/products/page.tsx:31-73`; serialize in `CatalogueClient.tsx:688-721`; 670-line component; English-only sort labels.
* **Recommended:** `features/catalogue/lib/catalogue-query.ts` with `parseCatalogueQuery(searchParams)` + `serializeCatalogueQuery(filters)` + round-trip tests; `useCatalogueFilters()` hook (state + URL sync + pagination); split toolbar, filter panel, pagination, chips, empty state into files; categories from `getCategories(products)`.
* **Benefit:** one contract, testable; fixes category bug.
* **Risk:** Low-Medium.

### 19.13 Product details: render real data, stop inventing
* **Current:** invented feature line; specs ignore `product.specifications`; hard-coded delivery spec; fake inquiry success.
* **Recommended:** `SpecificationsCard` renders `product.specifications` (hide when empty) + delivery info from `config/commerce`; remove the invented feature; `InquiryDialog` either deep-links to Messenger with the composed message (like checkout) or shows "copy message" — success copy must describe what actually happened ("Message ready — send it in Messenger").
* **Benefit:** compliance with `AGENTS.md`; trust.
* **Risk:** Low; needs owner approval of copy.

### 19.14 Remove fabricated reviews
* **Current:** hard-coded named 5-star reviews.
* **Recommended:** remove the section, or source real reviews from a new Sheets tab (with explicit consent) parsed through a schema; hide when empty.
* **Risk:** Low (content decision for the owner).

### 19.15 Error, loading and 404 boundaries
* **Recommended:** add `app/error.tsx`, `app/global-error.tsx`, `app/products/[slug]/not-found.tsx` (move current product copy there), generic root `not-found.tsx`, optional `loading.tsx` for `/products`; make `/offline` Retry call `location.reload()` (client island).
* **Risk:** Low.

### 19.16 Harden `/api/revalidate`
* See S4. Also revalidate `/products/[slug]` via `revalidatePath("/products/[slug]", "page")` and `/about`, `/terms` if they ever read data. Later, switch to tag-based revalidation (`revalidateTag("products")`) when Cache Components are adopted.
* **Risk:** Low; update the webhook caller to send the header.

### 19.17 Tooling: pin, lint, test
* **Recommended:** pin exact versions currently installed (Next 16.3.0, React 19.2.8, etc.) instead of `"latest"`; declare `typescript-eslint` explicitly; enable `eslint-config-next` flat config (react-hooks + next rules); fix Vitest startup (reinstall with pinned versions); add `playwright.config.ts`; add `.cache/` and `tsconfig.tsbuildinfo` to `.gitignore` and untrack them; replace `.env.local.example` values with placeholders.
* **Risk:** Low-Medium — enabling react-hooks rules will surface existing warnings to fix (`--max-warnings=0`).

### 19.18 Images
* **Recommended:** `loading="lazy"` for non-critical images; `fetchPriority="high"` for the hero/first visible; evaluate `next/image` with `images.remotePatterns` for `lh3.googleusercontent.com`/`drive.google.com` (Drive's redirect behaviour may conflict with the optimizer — test first). Share one `image-candidates.ts` between `ProductImage` and masonry media.
* **Risk:** Low for lazy loading; Medium for `next/image` (behavioural differences with Drive URLs).

### 19.19 WebGL / React Three Fiber decision
* **Current:** `AGENTS.md` lists R3F/Three.js and WebGL fallback; the world is CSS-3D; Three deps unused.
* **Recommended:** keep the CSS-3D world (it is working, lighter, and needs no WebGL fallback). **Either** remove `three`, `@react-three/fiber`, `@react-three/drei` **or** reserve `features/showcase/world/webgl/` for a future R3F scene loaded via `next/dynamic` with `ssr: false`, with the CSS world as the fallback. **Owner decision required.**
* **Risk:** none until decided.

### 19.20 CSS split
* See §16.3. Move verbatim first; then per-feature cleanup; delete dead selectors (admin, `world-parallax` vars always "0px", legacy `size-*` classes) only with screenshot coverage.
* **Risk:** High if rules are edited during the move; Low if the move is purely mechanical and order-preserving.

---

## 20. Files/Modules to Move

| Current | Target | Notes |
|---|---|---|
| `src/lib/product-schema.ts` | `src/domain/product/product-schema.ts` | normalize duplicate image fields later |
| `src/lib/gallery-schema.ts` | `src/domain/gallery/gallery-schema.ts` | |
| `src/lib/format.ts` | `src/shared/lib/format-price.ts` (`formatPrice`) + `src/domain/product/pricing.ts` (discount fns) | |
| `src/lib/order.ts` | `src/domain/commerce/order-message.ts` | merged with checkout template (§22) |
| `src/lib/image-utils.ts` | `src/features/product/lib/image-candidates.ts` (Drive) + `src/features/showcase/explore/youtube.ts` (YouTube) | split by concern |
| `src/lib/products-server.ts` | `src/server/catalog/get-products.ts` + `src/server/env.ts` | |
| `src/lib/sheets.ts` | `src/server/catalog/sources/google-sheets/*` | split (§21) |
| JSON import in `src/lib/products.ts` | `src/server/catalog/sources/local-json.ts` | only importer |
| `src/lib/products.test.ts` | `src/domain/product/*.test.ts`, `src/domain/commerce/*.test.ts` | rewrite against fixtures |
| `src/components/site/Header.tsx` | `src/features/shell/components/Header.tsx` (+ `MobileMenu.tsx`) | |
| `src/components/site/Footer.tsx` | `src/features/shell/components/Footer.tsx` | |
| `src/components/site/BottomSwitch.tsx` | `src/features/shell/components/BottomDock.tsx` | |
| `src/components/site/SearchOverlay.tsx` | `src/features/search/components/SearchDialog.tsx` | |
| `src/components/site/Breadcrumb.tsx` | `src/shared/ui/Breadcrumb.tsx` | |
| `src/components/site/LanguageProvider.tsx` | `src/shared/i18n/LanguageProvider.tsx` + `dictionaries/*` | |
| `src/components/site/ThemeProvider.tsx` | `src/shared/theme/ThemeProvider.tsx` | inline script → `theme-script.ts` |
| `src/components/products/*` | `src/features/product/components/*` | `ProductArtwork` → `ProductImage`, `StockStatus` → `StockBadge` (rename optional) |
| `src/components/world/ProductWorld.tsx` | `src/features/showcase/world/*` | split (§21) |
| `src/components/explore/*` | `src/features/showcase/explore/*` | |
| `src/components/home/HomeFeaturesSection.tsx` | `src/features/showcase/explore/TrustFeatures.tsx` | only used by explore |
| `src/components/catalogue/CatalogueClient.tsx` | `src/features/catalogue/components/*` | split |
| `src/components/details/*` | `src/features/product-details/components/*` | split |
| `src/components/cart/*` | `src/features/cart/{state,components,hooks}/*` | |
| `src/components/contact/*` | `src/features/contact/components/*` | copy → `src/content/contact-faq.ts` |
| `src/components/about/AboutClient.tsx`, `terms/TermsClient.tsx` | `src/features/content-pages/components/*` + `src/content/{about,terms}.ts` | |
| Filter parsing in `app/products/page.tsx` | `src/features/catalogue/lib/catalogue-query.ts` | |
| `app/globals.css` sections | `src/styles/*` + `src/features/**/**.css` | mechanical, order-preserving |
| `app/not-found.tsx` product copy | `app/products/[slug]/not-found.tsx` | root becomes generic |

## 21. Files/Modules to Split

| File | Lines | Split into |
|---|---|---|
| `app/globals.css` | 12,590 | tokens, base, per-feature CSS, light-theme overrides per feature |
| `src/components/world/ProductWorld.tsx` | 987 | `HomeWorld.tsx`, `WorldCard.tsx`, `WorldPreview.tsx`, `WorldIndicator.tsx`, `world-layout.ts` (slot tables + geometry), `useWorldPointer.ts`, `useHoverPreview.ts`, `useHomeShuffle.ts` |
| `src/components/catalogue/CatalogueClient.tsx` | 670 | `CatalogueView`, `CatalogueHero`, `CatalogueToolbar`, `CategoryMenu`, `SortMenu`, `FilterPanel`, `ActiveFilterChips`, `Pagination` (+ `getVisiblePaginationPages` → `pagination.ts`), `CatalogueEmptyState`, `useCatalogueFilters`, `catalogue-query.ts` |
| `src/components/cart/CheckoutModal.tsx` | 547 | `CheckoutDialog`, `CheckoutForm`, `DeliveryZonePicker`, `OrderSummary`, `CheckoutSuccess`, `useCopyToClipboard` (shared), message from `domain/commerce/order-message.ts`, validation from `checkout-schema.ts` |
| `src/lib/sheets.ts` | 474 | `client.ts`, `table.ts`, `parse-products.ts`, `parse-gallery.ts` (+ tests) |
| `src/components/explore/ExploreMediaMasonrySection.tsx` | 448 | `MediaMasonry`, `MediaCard`, `ShowcaseCardMedia`, `masonry-layout.ts`, `useActiveVideo` |
| `src/components/details/ProductDetailsClient.tsx` | 425 | `ProductDetailsView` (server-capable), `ProductGallery`, `BuyBox`, `VariantSelector`, `QuantityStepper`, `TrustList`, `SpecificationsCard`, `RelatedProducts`, `RecentlyViewed` + `useRecentlyViewed` |
| `src/components/explore/ExploreClient.tsx` | 396 | `ExploreShowcase`, `ExploreCarousel`, `carousel-math.ts`, `useCarouselLoop`, `useCarouselDrag` |
| `src/components/site/LanguageProvider.tsx` | 351 | `LanguageProvider.tsx`, `translate.ts`, `format.ts`, `dictionaries/en/*`, `dictionaries/bn/*` |
| `src/components/contact/ContactForm.tsx` | 334 | `ContactForm`, `InquiryTypePicker`, `ContactSubmitted`; copy to dictionaries |
| `src/components/terms/TermsClient.tsx` / `about/AboutClient.tsx` | 292 / 234 | view components + `src/content/*` data |
| `src/components/site/Header.tsx` | 164 | `Header`, `MobileMenu`, `HeaderActions` |

## 22. Files/Modules to Consolidate

| Duplicated today | Consolidate into |
|---|---|
| Order message: `lib/order.ts` + `CheckoutModal.tsx:88-125` + contact form text | `domain/commerce/order-message.ts` (`buildOrderMessage({ lines, customer, zone })`) |
| Delivery fees in ~12 places | `config/commerce.ts` + `domain/commerce/delivery.ts` |
| Phone validation × 3 | `domain/commerce/phone.ts` (Zod) |
| Messenger fallback URL × 2 + `site.ts` | `config/site.ts` only |
| Modal mechanics × 6 | `shared/ui/Dialog.tsx` + `shared/hooks/useBodyScrollLock.ts` |
| Scroll listeners × 4 | `shared/hooks/useScrollThreshold.ts` |
| `world-ui-ready` subscription × 2 | `features/showcase/lib/showcase-events.ts` → `useShowcaseReady()` |
| Image candidate logic × 2 | `features/product/lib/image-candidates.ts` |
| Clipboard copy with fallback × 3 (`CheckoutModal`, `OrderInquiryModal`, details share) | `shared/hooks/useCopyToClipboard.ts` |
| Sheet header detection/caching × 2 | `server/catalog/sources/google-sheets/table.ts` |
| Env/config detection × 3 (`products-server.ts` ×2, `sheets.ts`) | `server/env.ts` |
| Stock status list × 3 (schema enum, `stockStatuses`, translation map) | `stockStatusSchema.options` + dictionary keys |
| Sort keys × 3 (type, page guard, options array) | `sortKeys` const tuple + derived type |
| Categories × 3 taxonomies | data-derived `getCategories(products)`; `siteConfig.categories` removed or explicitly mapped; translations keyed by real data categories |
| Price/old-price rendering (`ProductCard` inline, `PriceDisplay`, `OrderInquiryModal.PriceDisplayText`, `ProductWorld` preview) | `PriceDisplay` with size variants |
| Trust/guarantee copy (cart drawer, checkout, details, about, terms, features) | `src/content/trust-points.ts` |

---

## 23. Things That Should NOT Be Changed

* **The thin route pattern** in `app/**/page.tsx` (fetch → one view). Only the import paths change.
* **The five public routes** and their URLs (`/`, `/products`, `/products/[slug]`, `/about`, `/contact`), plus existing `/explore`, `/terms`, `/offline`. No `[lang]` segment.
* **The URL query contract** of `/products` (`q`, `category`, `stock`, `min`, `max`, `new`, `best`, `discount`, `sort`) — external links and the search overlay depend on it.
* **The `Product` field names** (snake_case) — renaming is pure churn across JSON, Sheets mapping and UI.
* **Zod as the validation library** and `z.infer` as the type source.
* **The Messenger-first ordering model** (no payment, no backend, no DB) per `AGENTS.md`.
* **Google Sheets as the content admin** with JSON fallback.
* **The visual design and CSS class names** — the CSS split is a move, not a redesign; class names are the contract between TSX and CSS.
* **Theme mechanism** (inline pre-hydration script + `data-theme` + `localStorage`) — it prevents flash and works.
* **Click-vs-drag thresholds and the interaction feel** of the world and carousel (values `dragThreshold = 7`, easing constants) — extract them, don't retune them.
* **`formatPrice` output format** (`৳1,290`) — tested and required.
* **Strict TypeScript settings** and the no-`any` rule.
* **Path alias `@/*` → `src/*`.**
* **`siteConfig` as the single editable home for business contact details** (extend it, don't replace it).

---

## 24. Implementation Strategy

**Strategy: "Secure → Safety net → Correct → Restructure → Optimize".** Small, independently mergeable PRs; each must pass `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, and the Playwright smoke/visual suite at 390/820/1440 px with no console errors (per `AGENTS.md`).

### Phase 0 — Security hotfix (before anything else)
Remove admin UI/routes and image proxy; harden revalidate; sanitize `.env.local.example`; rotate exposed password and API key (owner action).

### Phase 1 — Safety net
Pin dependency versions; fix Vitest run; enable `eslint-config-next` (react-hooks/next rules) and fix findings; add Playwright config + smoke + baseline screenshots of every route (dark/light, 3 widths); untrack `.cache/` and `tsconfig.tsbuildinfo`; add test fixtures.

### Phase 2 — Data correctness (behavioural fixes, minimal moves)
Create `src/server/` DAL with `server-only`, `cache()`, Zod-validated Sheets parsing split into modules with fixture tests; make all product helpers parameterized (`domain/product`); fix categories/related/sort; remove disk cache (with build-time quota check); add `ProductSummary`.

### Phase 3 — Domain & config consolidation
`config/commerce.ts`, `domain/commerce/*` (fees, phone, order message, checkout schema); replace all duplicates; remove invented product feature; render real specifications; honest success states; reviews decision.

### Phase 4 — Structural moves (mechanical)
Create `features/`, `shared/`, `content/`; move files per §20 with import updates only; split god components per §21 without changing markup or class names; introduce `Dialog`, typed showcase events, shared hooks; add `error.tsx`/`global-error.tsx`/segment `not-found.tsx`.

### Phase 5 — i18n & CSS
Typed namespaced dictionaries, remove 266 ternaries; move long copy to `content/`; CSS split (mechanical, order-preserving), then per-feature cleanup of overrides and `!important` with screenshot verification.

### Phase 6 — Performance & rendering optimizations (decision-gated)
Slim payloads (search index/summary), lazy images/`next/image` evaluation, explore rAF pause, world SSR first frame + ref-based drag updates + scoped listeners + JS reduced-motion; **optional:** cookie-based language + server components for static sections; **optional:** Cache Components (`cacheComponents`, `'use cache'`, `cacheTag`, `revalidateTag`); **optional:** REST instead of `googleapis`; security headers/CSP; metadata (`metadataBase`, sitemap, robots, product JSON-LD) once the real domain replaces `https://example.com`.

---

## 25. Implementation Order

| # | Step | Phase | Depends on | Size | Risk |
|---|---|---|---|---|---|
| 1 | Delete `/xadmin`, `components/admin`, `api/admin/*`, `api/image-proxy`, admin CSS; remove `/xadmin` checks in shell | 0 | — | S | Low |
| 2 | Harden `/api/revalidate` (fail closed, POST+header only, add slug pages) | 0 | — | S | Low |
| 3 | Sanitize `.env.local.example`; owner rotates credentials | 0 | — | S | Low |
| 4 | Pin deps to installed versions; reinstall; confirm `npm run test` runs | 1 | — | S | Low |
| 5 | Enable `eslint-config-next` + declare `typescript-eslint`; fix hook-rule findings | 1 | 4 | M | Low-Med |
| 6 | Playwright config, smoke tests, baseline screenshots (all routes × 3 widths × 2 themes) | 1 | 4 | M | Low |
| 7 | `.gitignore` `.cache/`, `tsconfig.tsbuildinfo`; untrack | 1 | — | S | Low |
| 8 | Sheets fixtures + parser tests against **current** `sheets.ts` (characterization tests) | 1 | 4 | M | Low |
| 9 | `src/server/env.ts`, `server/catalog/get-products.ts` with `cache()`, `local-json.ts`; pages use it | 2 | 8 | M | Med |
| 10 | Split Sheets source into `client/table/parse-*`; route rows through Zod; remove disk cache | 2 | 8, 9 | M | Med |
| 11 | `domain/product/*` parameterized helpers; fix categories, related, sort; update callers | 2 | 9 | M | Med |
| 12 | `ProductSummary` DTO; Header/recently-viewed use it | 2 | 11 | S | Low |
| 13 | `config/commerce.ts`, `domain/commerce/*`; replace fee/phone/message duplicates | 3 | 11 | M | Low |
| 14 | Cart persists `{slug,variant,qty}` with migration; CheckoutDialog moved out of provider | 3 | 12, 13 | M | Med |
| 15 | Details: real specs, remove invented feature, honest inquiry flow; reviews decision | 3 | 13 | S | Low |
| 16 | Create `shared/`, `features/`, `content/`; move files (§20) — imports only | 4 | 6 | L | Med |
| 17 | `shared/ui/Dialog` + `useBodyScrollLock`; migrate 6 modals | 4 | 16 | M | Med |
| 18 | Typed showcase events + shared scroll hook | 4 | 16 | S | Low |
| 19 | Split Catalogue (with `catalogue-query.ts`), Checkout, Details, Masonry | 4 | 16 | L | Med |
| 20 | Split ProductWorld / Explore into geometry modules + hooks (no behaviour change) | 4 | 6, 16 | L | Med-High |
| 21 | `error.tsx`, `global-error.tsx`, segment `not-found.tsx`, offline retry | 4 | 16 | S | Low |
| 22 | Typed i18n dictionaries; remove ternaries; `content/` copy | 5 | 16 | L | Low-Med |
| 23 | CSS mechanical split (zero screenshot diff required) | 5 | 6 | L | Med |
| 24 | Per-feature CSS cleanup (`!important`, second-pass overrides, dead selectors) | 5 | 23 | L | Med |
| 25 | Performance: lazy images, rAF pause, world SSR frame, ref-based drag, scoped listeners, JS reduced-motion | 6 | 20 | M | Med |
| 26 | Decision-gated: cookie language + server components; Cache Components; REST Sheets; CSP/headers; SEO metadata; WebGL decision | 6 | 22 | M–L | Varies |

---

## 26. Risks and Migration Considerations

| Risk | Where | Mitigation |
|---|---|---|
| **Visual regressions** from CSS moves/cleanup | Phase 5 | Baseline screenshots (step 6); mechanical, order-preserving move first; one feature per PR |
| **Interaction regressions** in world/explore (feel, click vs drag) | Step 20, 25 | Extract constants verbatim; Playwright tests for click-opens-preview vs drag-doesn't; manual check on touch device |
| **Behaviour change from data fixes** (related, categories, sort now correct) | Step 11 | Communicate to owner; tests assert new expected behaviour |
| **Sheets quota during build** after removing disk cache | Step 10 | React `cache()` dedupe per render; measure `next build` request count; optional opt-in memory cache keyed by build |
| **Existing user carts** in old shape | Step 14 | One-time migration read of old `xtream-shopping-cart` shape → slugs; discard unparseable |
| **Language cookie makes pages dynamic** | Step 26 | Owner decision: accept dynamic rendering, or adopt Cache Components so only the language read is dynamic; or keep client-side language (status quo) |
| **Cache Components adoption** changes caching semantics globally | Step 26 | Separate PR after everything else; follow `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md` |
| **`next/image` with Google Drive URLs** | Step 25 | Spike first; keep `<img>` fallback |
| **Enabling react-hooks lint** reveals many issues | Step 5 | Fix or locally justify; don't disable globally |
| **Large move PR conflicts** with ongoing design work | Step 16 | Freeze feature work for the move window, or move one feature folder per PR |
| **Deleting admin** surprises stakeholders | Step 1 | Confirm with owner; document that Google Sheets is the admin |
| **Credential rotation** is an owner action outside the repo | Step 3 | Track explicitly; git history keeps the old values forever |
| **Dependency pinning** may change transitive versions | Step 4 | Pin to currently installed versions (`npm ls --depth=0`) to minimise drift |
| **Encoding** — Bengali strings in TS files | Steps 16, 22 | Edit with UTF-8-aware tools; PowerShell 5.1 `Get-Content` without `-Encoding UTF8` displays mojibake (display only, files are fine) |

### Owner decisions required before the relevant phase

1. Confirm removal of `/xadmin` and admin APIs (Phase 0).
2. Reviews section: remove, or provide real reviews via a Sheets tab (Phase 3).
3. Language persistence: keep client-only, or cookie + server rendering (and accept dynamic routes / adopt Cache Components) (Phase 6).
4. WebGL/R3F: remove the unused deps, or plan an R3F world with the CSS world as fallback (Phase 6).
5. Sheets auth mode in production (API key vs service account) — determines whether `googleapis` can be dropped (Phase 6).
6. Real production domain for `siteConfig.url` / `metadataBase` (Phase 6).

---

## 27. Final Architecture Decision

**Adopt a pragmatic Feature-based architecture with three supporting layers:**

1. **`app/` — thin routing shell** (unchanged shape): metadata, params, one server data call, one feature view, plus proper error/loading/not-found boundaries.
2. **`src/server/` — server-only Data Access Layer**: the single entry point for Google Sheets and the JSON fallback, Zod-validating every external row, deduplicated with React `cache()`, producing typed DTOs. Nothing else reads env secrets or the JSON file.
3. **`src/domain/` — pure, isomorphic business rules** for products (pricing, filter, sort, related, categories) and commerce (delivery zones/fees, BD phone format, order message, checkout schema), always taking data as arguments.
4. **`src/features/*` — cohesive UI modules** (`shell`, `search`, `catalogue`, `product`, `product-details`, `cart`, `showcase`, `contact`, `content-pages`), each owning its components, hooks and local logic, with strictly limited cross-feature imports.
5. **`src/shared/`, `src/config/`, `src/content/`** — generic UI/hooks/i18n/theme, editable business facts, and editable per-language copy.

**Explicitly rejected:** global state libraries, client data-fetching libraries, repository/DI/use-case layers, barrel files, a Tailwind rewrite, and (for now) an i18n framework.

**Execution:** security hotfix first, then a test and screenshot safety net, then data-correctness fixes, then mechanical restructuring, then i18n/CSS cleanup, and finally decision-gated performance and rendering upgrades — every step independently shippable and verified with lint, typecheck, unit tests, build, and multi-viewport browser checks.

This architecture is chosen because it directly addresses the problems observed in *this* codebase — hidden global data, client-only rendering forced by client-only i18n, scattered business rules, god components, and an unsafe admin surface — while preserving what already works well: thin routes, the Zod product model, URL-driven catalogue state, the Messenger ordering flow, and the signature interactive showcase.

---

## 28. Implementation Record (2026-10-06)

The plan in §24–§25 has been implemented. This section records what was built, where it deviates from the blueprint, and which items were deliberately not done.

### 28.1 Final structure (deviations from §16)

| Blueprint | As built | Why |
|---|---|---|
| `src/shared/i18n/` holds dictionaries and provider | Generic tools (`format.ts`, `languages.ts`, `define-messages.ts`) stay in `src/shared/i18n/`; dictionaries and `LanguageProvider` live in a new app-level **`src/i18n/`** | Most messages belong to features, and `shared/` must not depend on features. `src/i18n/` sits beside `features/` in the dependency graph. |
| Per-feature CSS files colocated in `src/features/**` | **`src/styles/00-…css` – `23-…css`**, imported in order by `app/globals.css` | The original cascade interleaves features (e.g. light-theme overrides near the end). Keeping consecutive, ordered files guarantees identical cascade order. |
| — | **`src/features/brand/`** (trust points shown on several pages) and **`src/features/system/`** (404/error/offline status pages) | Shared business UI with a clear owner instead of a cross-feature import. |
| `useBodyScrollLock` | **`useModalLayer`** (ref-counted lock + `useAnyModalOpen`) and **`useDialog`** (Escape, focus trap, focus return) | One mechanism also replaces the `MutationObserver` the home world used to detect open dialogs. |
| — | **`src/shared/lib/stored-value.ts`** (`useSyncExternalStore` over Web Storage) | Theme, language, cart, recently-viewed and the home shuffle read storage during render instead of "load in an effect, then set state". |
| `ProductSummary` passed per page | Plus a client **`CatalogueProvider`** filled once by the root layout | Header search, cart and recently-viewed resolve slugs from one list instead of each receiving the catalogue. |

Layer rules from §18 are enforced with ESLint `no-restricted-imports` in `eslint.config.mjs`.

### 28.2 Completed steps

All steps 1–25 of §25 are complete, plus these parts of step 26:

- **Security:** admin UI, admin APIs and the image proxy were deleted. `/api/revalidate` is closed unless a secret is configured, accepts only POST with a header token compared in constant time, and uses `revalidateTag`. Baseline security headers are in `next.config.mjs`. Next.js was upgraded 16.3.0 → 16.3.8 for critical advisories.
- **Data:** a single server-only data layer with `unstable_cache` (tag `catalog`, 60 s) and React `cache()`. The disk cache is removed. Every Sheets row is validated with Zod. Categories, related products and sort order now always come from the live data.
- **Business rules:** one source each for delivery zones and fees, the Bangladeshi mobile-number rule, and the order/inquiry message format.
- **Honesty fixes:**
  - Fabricated reviews were removed.
  - The feature line that was added to every product was removed.
  - Product specifications are now rendered.
  - Inquiry and contact forms prepare a Messenger message instead of claiming something was sent.
- **i18n:** all 266 inline language ternaries were replaced by typed, namespaced messages. A test checks key parity and placeholders. Bengali category names now render for the real categories.
- **CSS:** split into 24 ordered files. 200 unused rules (~1,450 lines; template leftovers such as SVG art, hover panels, loading strips and reviews) were removed.
- **Bug fixed:** dragging the home world (or the explore carousel) when the drag started on a product photo was cancelled by native image dragging. It now works, as `AGENTS.md` requires.
- **Performance and accessibility:**
  - Lazy images, with priority loading for the hero and gallery.
  - The explore animation loop idles when settled and pauses off-screen, while a dialog is open, or when the tab is hidden.
  - World cards are memoized, so dragging doesn't re-render all of them.
  - Wheel and arrow-key handling is scoped and ignored in inputs.
  - JavaScript respects `prefers-reduced-motion`.
  - The home page's server HTML includes product links.
- **SEO:** `robots.txt`, a sitemap (active once `siteConfig.url` is real), product JSON-LD (catalogue data only), and canonical/OG metadata.
- **Quality gates:** pinned dependencies, `eslint-config-next` (React hooks + Next rules), Vitest unit tests for domain, parsers, URL contract, cart migration, i18n and showcase geometry, and Playwright end-to-end and screenshot tests at 390/820/1440 px.

### 28.3 Decisions taken (owner may revisit)

| Open question (§26) | Decision | Reason |
|---|---|---|
| Admin area | Removed | Insecure and non-functional; Google Sheets is the admin. |
| Reviews | Removed | They were invented. Real reviews can return via a Sheets tab parsed through a schema. |
| Language persistence | Kept client-side (localStorage); not moved to a cookie | A cookie would make every page dynamic (no static/ISR). Revisit together with Cache Components. |
| Cache Components (`'use cache'`) | Not adopted | Global change to caching semantics; the current model (`unstable_cache` + ISR) is correct and simpler. |
| `googleapis` → REST `fetch` | Not changed | Service-account authentication needs JWT signing; the production auth mode is unknown. |
| R3F / Three.js packages | Kept installed, unused | `AGENTS.md` lists them as the stack. The CSS-3D world remains the implementation. |
| Content-Security-Policy | Not added (other security headers are) | A safe CSP needs per-request nonces (dynamic rendering) plus allowances for YouTube and Google image hosts. |
| Server-rendered first frame of the home world | Not done; product links are server-rendered instead | The layout depends on the real viewport and a per-visit shuffle. A server frame would visibly jump and restart the fly-in on hydration. |
| `!important` reduction (~386) | Not done | Each removal changes specificity and needs visual sign-off per rule. The CSS is now split by section, so this can be done one section at a time with the screenshot comparison. |

### 28.4 Remaining owner actions

- Rotate the previously exposed admin password and Google API key (both remain in git history).
- Set `siteConfig.url` to the production domain.
- Set `REVALIDATION_SECRET` and the `GOOGLE_SHEETS_*` variables in the hosting environment.