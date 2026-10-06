# Xtream UTD Product Catalogue

Next.js (App Router) product catalogue for Xtream UTD — gadgets and accessories with delivery across Bangladesh. Orders are placed by sending a prepared message on Facebook Messenger; there is no payment, account system or database.

Architecture and the reasoning behind it: [`docs/ARCHITECTURE-ANALYSIS.md`](docs/ARCHITECTURE-ANALYSIS.md).

## Routes

| Route | Purpose |
|---|---|
| `/` | Interactive 3D product world (drag to rotate, click for a preview) |
| `/explore` | Product carousel, benefits, top sellers, media gallery |
| `/products` | Catalogue with search, filters, sorting and pagination (state lives in the URL) |
| `/products/[slug]` | Product details, cart, Messenger inquiry |
| `/about`, `/contact`, `/terms` | Business information |
| `/offline` | Offline state |
| `POST /api/revalidate` | Refreshes catalogue data on demand (requires `REVALIDATION_SECRET`) |

## Getting started

```bash
npm install
cp .env.local.example .env.local   # optional — without it the bundled catalogue is used
npm run dev
```

> On Windows, npm sometimes skips a native package that Vitest needs. If `npm run test` fails with
> `Cannot find module './rolldown-binding…'`, run `npm install --no-save @rolldown/binding-win32-x64-msvc@1.2.4`.

## Scripts

```bash
npm run lint        # ESLint (Next.js + React hooks rules + layer boundaries)
npm run typecheck   # TypeScript, strict
npm run test        # Vitest unit tests (src/**/*.test.ts)
npm run build       # production build
npm run test:e2e    # Playwright end-to-end + screenshot capture (uses your installed Chrome)
```

Playwright starts `npm run start` on port 3100, so run `npm run build` first. Screenshots of every page in both
themes and three viewport sizes are written to `test-artifacts/screens/<label>/`:

```bash
SCREEN_LABEL=before npx playwright test tests/visual/capture.spec.ts
# …make changes, rebuild…
SCREEN_LABEL=after npx playwright test tests/visual/capture.spec.ts
SCREEN_BASE=before SCREEN_LABEL=after npx playwright test tests/visual/compare.spec.ts --project=desktop
```

## Where things live

```text
app/                    routes only: metadata, data loading, one feature view per page
src/server/             server-only data access (Google Sheets + bundled JSON fallback, caching, env)
src/domain/             pure business rules: products, pricing, filtering, delivery fees, order messages
src/features/           UI by feature: shell, catalogue, product, product-details, cart, search,
                        showcase (home world + explore), contact, content-pages, brand, system
src/i18n/               English/Bengali UI messages and the LanguageProvider
src/content/            long-form editable page copy (about, contact FAQ, terms) in both languages
src/config/             editable business facts: site.ts (contacts, hours), commerce.ts (delivery fees)
src/shared/             generic hooks, UI primitives, i18n/media/storage helpers
src/styles/             global CSS, split by section; imported in order by app/globals.css
tests/                  Playwright end-to-end and visual tests
```

## Editing business information

- **Contact details, social links, hours, location:** `src/config/site.ts`
- **Delivery fees, delivery times, districts, couriers:** `src/config/commerce.ts` — every page, the checkout total and the Messenger message use these values.
- **Page copy (About, Terms, Contact, FAQ):** `src/content/*.ts`
- **Interface text:** `src/i18n/messages/*.ts` (each file holds English and Bengali; TypeScript fails if a translation is missing)
- **Production domain:** set `siteConfig.url`. Until then canonical URLs and the sitemap are disabled.

## Product data

With `GOOGLE_SHEETS_*` variables set (see `.env.local.example`), products and the explore gallery are read from Google Sheets, validated, and cached for 60 seconds (or until `POST /api/revalidate` with header `x-revalidate-token: <REVALIDATION_SECRET>`). Invalid rows are skipped and logged. If Sheets is not configured or unavailable, the bundled fallback catalogue in `design-reference/data/sample_products.json` is used.

Never commit real credentials. Configure them in your hosting provider.
