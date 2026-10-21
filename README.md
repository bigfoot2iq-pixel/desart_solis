# Desart Solis — landing page

Single-page storefront for **Desart Solis**, a Moroccan argan-oil care brand (skin · hair · body · beard).
Next.js 16 (App Router) + Sanity Studio, with WhatsApp as the checkout channel.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.4 (App Router, Turbopack, Cache Components) |
| UI | Tailwind CSS v4 (`@theme` tokens in `app/globals.css`) |
| Fonts | Cormorant Garamond (display) + Montserrat (UI) via `next/font` |
| Content | Sanity (`next-sanity` + `SanityLive`), dataset `production` |
| Checkout | WhatsApp deep link, cash on delivery |

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm studio       # Sanity Studio → https://desart-solis.sanity.studio
pnpm build        # production build
pnpm lint         # eslint
pnpm typegen      # regenerate sanity.types.ts from the Studio schema
```

Copy `.env.example` to `.env.local` and fill in the values:

- `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` — content lake coordinates
- `SANITY_API_WRITE_TOKEN` — server-only token used by the review endpoints. Never expose it to the client.

## Content model

All catalogue content lives in Sanity; only brand copy and layout live in the repo.

| Type | Purpose |
| --- | --- |
| `product` | name, slug, price, size, tagline, description, notes, category, badge, image, availability, sortOrder |
| `pack` | a bundle of products with a percentage discount |
| `review` | customer review with optional photo/video, verified badge, reply, helpful count |
| `faq` | question / answer pairs |
| `siteSettings` | WhatsApp number, socials, announcement bar, shipping fees, free-shipping threshold |

Categories: `visage`, `cheveux`, `barbe`, `corps`.

Products are cached through `sanity/live.ts` and revalidated automatically when a document is published.

## Project layout

```
app/
  _components/   cart, order builder, reviews widget, mobile nav, snap rail
  _data.ts       static brand copy (ritual, ingredients, promises, values)
  _lib/          catalogue fetching, shared types, rate limiting
  api/           review submission endpoints
  page.tsx       landing page composition
  globals.css    design tokens + brand utilities
public/brand/    logo lockups, product cutouts, editorial photography
sanity/          client, live cache, GROQ queries
studio/          Sanity Studio (schema types, structure)
scripts/         content migrations + the hero range builder
```

## The range section

The range is a catalogue, not a shop: each product is a column with the bottle
standing on the baseline of the row, and only what a customer needs to choose
it — name, size, price and the add control. The long copy lives in the order
builder, where the visitor is actually shopping.

Below `lg` the four columns become a snap rail (`_components/snap-rail.tsx`):
the cards stay small, the next one peeks in, and the section keeps its height
instead of stacking four tall products. Swiping moves the rail card by card —
the rail keeps `touch-action: auto` so the browser picks the axis from the
gesture and a vertical swipe still scrolls the page — and the dashes below
only mirror the position. The rail owns the scrolling and the position
indicator only; the cards are rendered on the server and handed over as
children. The ritual section uses the same rail for its four steps.

The add button becomes a `− qty +` stepper as soon as the product is in the cart.

The bottles are sized from `productShare` in `app/page.tsx` — the same map the
hero strip uses — so a product never changes size between the two sections.

## The order section

The order section is a two-column layout on desktop: the selection and the
address on the left, the summary pinned on the right.

On a phone it is a guided flow instead, because a single column puts the total
two screens below the products and leaves two different amounts on screen at
once (the site-wide cart bar showed a subtotal, the summary a total):

1. **Choix** — the packs and the individual care.
2. **Livraison** — name, WhatsApp number, city, address.
3. **Récap** — the summary and the WhatsApp hand-off.

A sticky rail under the header shows the three steps and lets the visitor jump
back; an action bar pinned to the bottom carries the live amount and the next
action, and it replaces the site-wide cart bar while the section is on screen
(`useSectionActive` in `_components/use-section-active.ts` owns that handover).
Leaving a step validates it, so the flow cannot reach the summary with an
empty basket or a half-filled address.

## Adding a product

1. Upload a transparent cutout (PNG/WebP) as the product image in Studio.
2. Create the product document: set `name`, `slug`, `price`, `size`, `category`, `availability`.
3. Optionally set `badge` (e.g. `Nouveau`) — it renders as a gold label above the product.
4. Add the slug to a `pack` if it belongs to a bundle.
5. Re-cut the product so it can join the hero range:

   ```bash
   python scripts/build-range.py                 # re-cut all four (needs Python 3 + Pillow)
   python scripts/build-range.py new-product.webp # or just the new one
   ```

   Then add it to the `range` array in `app/page.tsx` with its pixel size, and
   give it a `share` in `productShare` — the part of the strip height it should
   stand at. The range section reads the same map, so both stay in step.

Product photos are displayed with `object-contain` inside a framed plate on the page cream, so a
transparent background is required. Editorial photography (used in the story section) lives in `public/brand/`.

### The hero range

The four products in the hero are composited in the DOM from individual cutouts in
`public/brand/range/`, not baked into one image. A single raster carries a single aspect
ratio, so any other viewport crops the range — wide screens slice the tops off the tall
bottles, narrow ones cut the outer products away. Each cutout is sized from the strip
height alone (`cqh`), which keeps all four whole and standing on one baseline at every
width. The cutouts must be trimmed tight or the products drift apart and break the
baseline; `scripts/build-range.py` does that trimming.

Because the cutouts are transparent they stand straight on the page cream, so there is no
image edge to seam against the hero. The warm halo behind them fades to zero alpha before
any edge, and the arch's uprights are masked so they dissolve instead of stopping.

## Mobile layout

The page is composed desktop-first, but every section has a phone layout that
is designed rather than collapsed. Measured on a 390 × 844 viewport:

| Section | Desktop → phone | Height |
| --- | --- | --- |
| Trust bar | four columns → a 2 × 2 grid, smaller icons and notes | ~336 → 185 px |
| Ritual | four columns → a snap rail of four step cards | ~1027 → 459 px |
| Story | portrait + text side by side → a full-bleed 4:3 band, copy underneath | ~1136 → 860 px |

The story stays single-column until `md`, where the portrait and the text can
sit side by side again. Nothing is hidden on a phone — the ritual keeps every
step, it just shows one at a time.

## Design system
Tokens live in `app/globals.css`:

- **Colours** — `cream`, `sand`, `forest`, `gold`, `ink` (see `public/brand/branding-board.webp`)
- **Utilities** — `display` (large serif), `eyebrow` (tracked small caps), `grain` (paper texture),
  `rule-gold` (fading hairline), `text-foil` / `text-foil-bright` (metallic gold on light / dark surfaces),
  `nums` (lining + tabular figures)
- **Motion** — scroll reveals use CSS `animation-timeline: view()` and are disabled under
  `prefers-reduced-motion`

Muted text keeps at least WCAG AA contrast (4.5:1) on its surface; gold on dark panels uses the
`text-foil-bright` variant.
