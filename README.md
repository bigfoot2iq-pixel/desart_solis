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
  _components/   cart, order builder, reviews widget, mobile nav
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

## Adding a product

1. Upload a transparent cutout (PNG/WebP) as the product image in Studio.
2. Create the product document: set `name`, `slug`, `price`, `size`, `category`, `availability`.
3. Optionally set `badge` (e.g. `Nouveau`) — it renders as a pill on the product card.
4. Add the slug to a `pack` if it belongs to a bundle.
5. Re-cut the product so it can join the hero range:

   ```bash
   python scripts/build-range.py                 # re-cut all four (needs Python 3 + Pillow)
   python scripts/build-range.py new-product.webp # or just the new one
   ```

   Then add it to the `range` array in `app/page.tsx` with its pixel size and
   the share of the strip height it should stand at.

Product photos are displayed with `object-contain` on a warm sand panel, so a transparent
background is required. Editorial photography (used in the story section) lives in `public/brand/`.

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
