# Xtream UTD Product Catalogue

This is a Next.js App Router product-catalogue website for Xtream UTD, built from the approved UI/UX files in `design-reference/`.

## Routes

- `/` - immersive 3D product discovery homepage
- `/products` - complete product catalogue with search, filters, and sorting
- `/products/[slug]` - product details and Messenger-first inquiry flow
- `/about` - Xtream UTD product and trust information
- `/contact` - customer support and inquiry form
- `/offline` - offline state

## Local Development

```bash
npm install
npm run dev
```

Current local preview: `http://127.0.0.1:3000`

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Product Data

The app validates and uses `design-reference/data/sample_products.json`. Product helpers live in `src/lib/products.ts`, and product schema validation lives in `src/lib/product-schema.ts`.

## Editable Business Placeholders

Unverified business information is centralized in `src/config/site.ts`:

- Messenger URL
- WhatsApp URL
- Phone number
- Email
- Facebook page URL
- Business hours
- Delivery information
- Return or replacement policy

Do not publish until those values are replaced with verified Xtream UTD details.

## Assets Still Needed

The current app uses polished local product-art placeholders. Add real assets later:

- Product photos under `public/products/`
- Logo, wordmark, favicon, and social image under `public/brand/`

Do not scrape product images from Facebook.

## Deployment Note

This project is a standard Next.js App Router application. It is ready for a Next-compatible host such as Vercel or another Node/Next hosting target. Sites deployment was not attempted because the available Sites packager expects a Sites/OpenNext-compatible `dist/server/index.js` output.
