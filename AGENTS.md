# Xtream UTD Repository Instructions

## Product
Build a premium gadget and accessories product-catalogue website for Xtream UTD. This is not a creative-agency portfolio.

## Design source of truth
Inspect all relevant files in:
- `design-reference/docs/`
- `design-reference/boards/`
- `design-reference/previews/`
- `design-reference/data/`

Recreate the interface with real semantic components. Never use an entire board as a full-page image.

## Stack
- Next.js App Router
- React
- strict TypeScript
- Tailwind CSS or equivalent token system
- React Three Fiber / Three.js
- accessible semantic HTML

## Routes
- `/`
- `/products`
- `/products/[slug]`
- `/about`
- `/contact`

## Rules
- Use product terminology, not portfolio terminology.
- Keep business details centralized and editable.
- Do not invent contact details, ratings, claims, or stock information.
- Use Bangladeshi taka formatting.
- Support keyboard use, reduced motion, and WebGL fallback.
- Distinguish click from drag in the product world.
- Do not use TypeScript `any`.
- Avoid unnecessary dependencies.
- Do not add payment, authentication, or a database unless explicitly requested.

## Verification
Run:
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
Also inspect desktop, tablet, and mobile layouts in a browser and check console errors.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
