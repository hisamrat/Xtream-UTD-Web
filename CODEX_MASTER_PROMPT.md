# Codex Master Command

Paste everything below into Codex after opening this folder.

---

Build a complete, production-ready website for **Xtream UTD** based strictly on the UI/UX files inside this repository.

## First actions
1. Inspect the complete repository before editing files.
2. Read `README.md` and `AGENTS.md`.
3. Study every relevant file inside `design-reference/docs/`, `design-reference/boards/`, `design-reference/previews/`, and `design-reference/data/`.
4. Create `IMPLEMENTATION_PLAN.md` with architecture, milestones, routes, state model, and verification plan.
5. Then implement the complete website. Do not stop after planning or scaffolding.

## Identity
Xtream UTD is a gadget and accessories business. This is not a portfolio website. Use product terminology throughout.

## Technology
Use latest stable Next.js App Router, React, strict TypeScript, Tailwind CSS or equivalent, React Three Fiber/Three.js, Framer Motion or a lightweight equivalent, Next.js Image, local JSON product data, schema validation, accessible forms, ESLint, tests, and production build verification.

Do not use TypeScript `any`. Do not add authentication, payment, database, or admin features in this version.

## Routes
Implement `/`, `/products`, `/products/[slug]`, `/about`, `/contact`, and a proper not-found experience. Preserve filters, search, and sorting in URL parameters where appropriate.

## Header
Create the approved compact header with Xtream UTD, Home, All Products, Categories, About, Contact, Search, Theme switch, and mobile menu. The wordmark links to `/`; active routes must be visible and accessible.

## Homepage product world
Build the immersive 3D product world from the design boards. Distribute product cards around a virtual sphere/spatial environment. Cards show image, title, price, discount, category, and stock state.

Implement mouse/touch drag, wheel/trackpad/pinch zoom, vertical rotation limits, zoom limits, subtle inertia, gradual deceleration, billboard behaviour, controlled overlap, loading, error, reduced-motion, and WebGL fallback states.

Correctly distinguish clicks from drags. A completed drag must never open a product. Hover or keyboard focus reveals product information and “View Details.” Clicking navigates to `/products/[slug]`. Restore rotation, zoom, and filter state after returning where practical.

## Bottom navigation
Create the bottom-centre pill:
- Explore Products → `/`
- View All Products → `/products`

## Catalogue
Build a responsive catalogue: 4 columns large desktop, 3 smaller desktop, 2 tablet, 1–2 mobile. Cards show image, title, current price, previous price, discount, category, stock status, and View Details. The full card links to the product page.

Implement default, hover, focus, loading, sale, new, best seller, low stock, out of stock, and missing-image states. Use locale-aware Bangladeshi taka formatting.

## Filters and search
Implement filters for category, price, availability, new arrivals, best sellers, and discounted products. Add sorting by newest, price ascending, price descending, title, and featured. Include result count, chips, clear action, desktop panel, mobile bottom sheet, empty state, and URL persistence.

Implement accessible local search across title, category, subcategory, descriptions, features, and tags. Include overlay, suggestions, recent searches, results, no-results, keyboard navigation, debouncing, and Escape-to-close.

## Product details
Each product page includes image gallery, optional video, title, prices, discount, stock, summary, full description, features, specifications, colours/variants, quantity selector, delivery and return information, Order Now, Messenger, configurable WhatsApp, sharing, related products, recently viewed products, breadcrumbs, and Back to All Products. Invalid slugs show not found.

## Order inquiry
Do not add checkout or payment. Create a Messenger-first inquiry modal with product summary, variant, colour, quantity, name, phone, address, note, validation, loading, success, error, focus trapping, Escape-to-close, and restored focus. Generate a Messenger-ready summary and support configurable redirect or copy-to-clipboard. Centralize placeholders in `src/config/site.ts`.

## About and Contact
Create complete About and Contact pages matching the approved UI/UX. Do not invent unverifiable business claims or contact details. Contact supports configurable Messenger, WhatsApp, phone, email, location, hours, forms, loading, validation, error, and success states.

## Mobile and accessibility
Implement compact mobile navigation, large tap targets, mobile filter bottom sheet, no horizontal overflow, visible prices/order actions, fewer 3D objects on weak devices, Grid/WebGL fallback, semantic HTML, alt text, visible focus, keyboard controls, focus trapping, reduced motion, accessible HTML product links outside the canvas, arrow-key rotation, plus/minus zoom, and Enter/Space activation.

## Themes
Implement dark and light themes with shared tokens. Dark is primary. Persist preference and respect system preference on first visit where appropriate.

## Data/configuration
Validate `design-reference/data/sample_products.json`. Create strict product types. Create `src/config/site.ts` for editable business details. Use `public/products/` and `public/brand/`; create polished local placeholders when real assets are absent.

## Design accuracy
Use SVG boards and PNG previews as the visual source of truth. Do not show a whole board as the webpage, flatten the UI, replace it with a generic store template, use portfolio terminology, or add excessive neon, gradients, glassmorphism, gaming, or crypto styling.

## Performance
Use responsive images, lazy loading, dynamically loaded 3D, controlled device pixel ratio, reduced 3D objects on weak devices, paused rendering in hidden tabs, Three.js resource disposal, code splitting, font optimization, and minimal third-party scripts. Avoid React state updates every animation frame.

## SEO
Add route/product metadata, Open Graph, canonical URLs, sitemap, robots, valid product and breadcrumb structured data, and correct headings. Do not invent reviews or ratings.

## Testing
Test product validation, price formatting, search, filters, sorting, navigation, invalid slugs, inquiry validation, theme persistence, reduced motion, click-versus-drag threshold, WebGL fallback, and keyboard use. Add browser/end-to-end tests for major flows.

## Verification
Before finishing, run the development server and inspect desktop, tablet, and mobile views. Compare with the design boards, test all major flows, check console errors and overflow, then run:
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
Fix real errors and do not claim commands passed unless actually executed.

## Deliverables
Leave working source code, 3D homepage, catalogue, filters/search, dynamic product details, inquiry flow, About/Contact, themes, accessibility/fallbacks, tests, updated README, AGENTS.md, IMPLEMENTATION_PLAN.md, configuration/product-editing guide, deployment instructions, and verification report.

Do not return only a plan or scaffold. Implement, test, verify, and leave the repository runnable.

In the final response provide what was built, architecture, routes, components, changed files, configuration still needing real information, exact verification results, limitations, and local run instructions.
