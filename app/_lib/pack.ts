import type { Pack, Product } from "./types";

export function packPrice(pack: Pack, products: Product[]) {
  const full = pack.items.reduce((sum, slug) => sum + (products.find((p) => p.slug === slug)?.price ?? 0), 0);
  return { full, price: Math.round(full * (1 - pack.discount)) };
}
