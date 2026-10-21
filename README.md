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
scripts/         one-off content migrations
```

## Adding a product

1. Upload a transparent cutout (PNG/WebP) as the product image in Studio.
2. Create the product document: set `name`, `slug`, `price`, `size`, `category`, `availability`.
3. Optionally set `badge` (e.g. `Nouveau`) — it renders as a pill on the product card and the card in the hero.
4. Add the slug to a `pack` if it belongs to a bundle.

Product photos are displayed with `object-contain` on a warm sand panel, so a transparent
background is required. Editorial photography (used in the story section) lives in `public/brand/`.

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
