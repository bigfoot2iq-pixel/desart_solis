import "server-only";
import { cachedSanity } from "@/sanity/live";
import { HOME_QUERY } from "@/sanity/queries";
import type { HOME_QUERY_RESULT } from "@/sanity.types";
import type { Faq, Pack, Product, Review, ReviewMedia, Settings, Shipping } from "./types";

const FALLBACK_WHATSAPP = "212612213324";

export async function getHomeContent() {
  const { data } = await cachedSanity({ query: HOME_QUERY, perspective: "published", stega: false });
  return normalize(data);
}

/** Turns the nullable query result into the strict shapes the UI expects, dropping incomplete entries. */
function normalize(data: HOME_QUERY_RESULT) {
  const s = data.settings;
  const settings: Settings = {
    whatsappNumber: s?.whatsappNumber || FALLBACK_WHATSAPP,
    phoneDisplay: s?.phoneDisplay ?? null,
    instagram: s?.instagram ?? null,
    facebook: s?.facebook ?? null,
    website: s?.website ?? null,
    announcement: s?.announcement ?? null,
  };

  const shipping: Shipping = {
    freeFrom: s?.freeShippingFrom ?? null,
    cities: (s?.cities ?? []).flatMap((c) => (c.city && c.fee != null ? [{ name: c.city, fee: c.fee }] : [])),
  };

  const products: Product[] = data.products.flatMap((p) => {
    const img = p.image;
    if (!p.slug || !p.name || p.price == null || !img?.url || !img.width || !img.height) return [];
    return [
      {
        id: p._id,
        slug: p.slug,
        name: p.name,
        category: p.category ?? "",
        tagline: p.tagline ?? "",
        badge: p.badge ?? null,
        description: p.description ?? "",
        size: p.size ?? "",
        price: p.price,
        notes: p.notes ?? [],
        soldOut: p.availability === "soldOut",
        image: { url: img.url, width: img.width, height: img.height, alt: img.alt ?? p.name },
      },
    ];
  });
  const slugs = new Set(products.map((p) => p.slug));

  const packs: Pack[] = data.packs.flatMap((p) => {
    const items = (p.items ?? []).filter((slug): slug is string => !!slug && slugs.has(slug));
    if (!p.name || items.length < 2) return [];
    return [
      {
        id: p._id,
        name: p.name,
        description: p.description ?? "",
        badge: p.badge,
        discount: Math.min(Math.max(p.discountPercent ?? 0, 0), 80) / 100,
        items,
      },
    ];
  });

  const reviews: Review[] = data.reviews.flatMap((r) => {
    if (!r.author || !r.body || !r.rating || !r.product || !r.date) return [];
    const media = (r.media ?? []).flatMap<ReviewMedia>((m) => {
      if (!m.url) return [];
      if (m._type === "image" && m.width && m.height) return [{ key: m._key, type: "image", url: m.url, width: m.width, height: m.height }];
      if (m._type === "video") return [{ key: m._key, type: "video", url: m.url }];
      return [];
    });
    return [
      {
        id: r._id,
        author: r.author,
        city: r.city,
        date: r.date,
        rating: r.rating,
        title: r.title,
        body: r.body,
        product: r.product,
        verified: r.verified,
        reply: r.reply,
        helpful: r.helpful,
        media,
      },
    ];
  });

  const faqs: Faq[] = data.faqs.flatMap((f) => (f.question && f.answer ? [{ id: f._id, question: f.question, answer: f.answer }] : []));

  return { settings, shipping, products, packs, reviews, faqs };
}
