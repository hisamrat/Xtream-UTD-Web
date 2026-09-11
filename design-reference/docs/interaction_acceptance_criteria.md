# Xtream UTD Product Catalogue - Interaction Acceptance Criteria

## Primary routes
- `/` - immersive 3D product discovery
- `/products` - complete catalogue
- `/products/[slug]` - individual product details
- `/about` - brand and trust information
- `/contact` - customer support and inquiries

## Homepage
- Header contains Xtream UTD, Home, All Products, Categories, About, Contact, Search, Theme and Menu.
- Bottom-centre switch contains Explore Products and View All Products.
- Clicking a 3D product opens its matching `/products/[slug]` page.
- Drag movement above 6 px never triggers product navigation.
- Back navigation restores the previous world rotation, zoom, filter and view where practical.

## Catalogue
- Every card shows product image, title, current price, optional previous price, category and stock state.
- Entire card is keyboard-focusable and clickable.
- Four columns large desktop, three small desktop, two tablet, one or two mobile.
- Search matches title, category, description, features and tags.
- Filters cover category, price, availability, new, best seller, discount and sort order.

## Product details and ordering
- Product page supports gallery, video, title, price, stock, features, specifications, variants, delivery, policy and related products.
- Primary Order Now action opens an editable Messenger-first inquiry flow.
- No full payment checkout is required for this design phase.
- Inquiry form includes product, variant, quantity, name, phone, delivery address and note.

## Accessibility and fallback
- Minimum 44 x 44 px touch targets.
- Visible keyboard focus and semantic links for every product.
- Grid is always available and is the WebGL/reduced-motion fallback.
- No information relies only on colour.
- Escape closes overlays; Enter/Space activates focused products.
