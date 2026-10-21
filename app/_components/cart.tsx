"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { formatDh } from "../_data";
import type { Catalog, Pack, Product } from "../_lib/types";
import { useSectionActive } from "./use-section-active";

const STORAGE_KEY = "desart-cart-v2";
const MAX_QTY = 20;

/** Quantities keyed by product slug or pack id */
type Lines = Record<string, number>;

export type CartLine = {
  id: string;
  kind: "product" | "pack";
  name: string;
  detail: string;
  qty: number;
  unitPrice: number;
  /** Price before pack discount */
  unitCompareAt: number;
};

type CartContextValue = {
  catalog: Catalog;
  lines: Lines;
  items: CartLine[];
  count: number;
  subtotal: number;
  savings: number;
  setQty: (id: string, qty: number) => void;
  add: (id: string, qty?: number) => void;
  clear: () => void;
  lastAdded: { id: string; at: number } | null;
};

const CartContext = createContext<CartContextValue | null>(null);

export function packPrice(pack: Pack, products: Product[]) {
  const full = pack.items.reduce((sum, slug) => sum + (products.find((p) => p.slug === slug)?.price ?? 0), 0);
  return { full, price: Math.round(full * (1 - pack.discount)) };
}

function toLine(id: string, qty: number, catalog: Catalog): CartLine | null {
  const product = catalog.products.find((p) => p.slug === id);
  if (product) {
    if (product.soldOut) return null;
    return { id, kind: "product", name: product.name, detail: product.size, qty, unitPrice: product.price, unitCompareAt: product.price };
  }
  const pack = catalog.packs.find((p) => p.id === id);
  if (pack) {
    const { full, price } = packPrice(pack, catalog.products);
    return { id, kind: "pack", name: `Pack ${pack.name}`, detail: pack.description, qty, unitPrice: price, unitCompareAt: full };
  }
  // Item removed or renamed in the admin since it was added: drop it silently
  return null;
}

export function CartProvider({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  const [lines, setLines] = useState<Lines>({});
  const [hydrated, setHydrated] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartContextValue["lastAdded"]>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring persisted cart after hydration
      if (saved) setLines(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, hydrated]);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(qty, MAX_QTY);
      return next;
    });
  }, []);

  const add = useCallback((id: string, qty = 1) => {
    setLines((prev) => ({ ...prev, [id]: Math.min((prev[id] ?? 0) + qty, MAX_QTY) }));
    setLastAdded({ id, at: Date.now() });
  }, []);

  const clear = useCallback(() => setLines({}), []);

  const value = useMemo(() => {
    const items = Object.entries(lines)
      .map(([id, qty]) => toLine(id, qty, catalog))
      .filter((l): l is CartLine => l !== null);
    const subtotal = items.reduce((s, l) => s + l.unitPrice * l.qty, 0);
    const savings = items.reduce((s, l) => s + (l.unitCompareAt - l.unitPrice) * l.qty, 0);
    const count = items.reduce((s, l) => s + l.qty, 0);
    return { catalog, lines, items, count, subtotal, savings, setQty, add, clear, lastAdded };
  }, [catalog, lines, setQty, add, clear, lastAdded]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

/** Fired when the visitor asks to go to the order section. */
export const OPEN_ORDER_EVENT = "desart:open-order";

export function scrollToOrder() {
  document.getElementById("commande")?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.dispatchEvent(new Event(OPEN_ORDER_EVENT));
}

export function AddToOrderButton({ product }: { product: Product }) {
  const { add, setQty, lines } = useCart();
  const qty = lines[product.slug] ?? 0;

  if (product.soldOut) {
    return (
      <span className="eyebrow shrink-0 rounded-full border border-forest/15 px-4 py-2.5 text-forest/55">
        Rupture de stock
      </span>
    );
  }

  // Nothing in the cart yet: a single, quiet call to action.
  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => add(product.slug)}
        className="eyebrow group/btn inline-flex shrink-0 items-center gap-2.5 rounded-full border border-forest/25 px-5 py-2.5 text-forest transition-colors duration-300 hover:border-forest hover:bg-forest hover:text-cream"
      >
        Ajouter
        <Plus className="size-3.5 transition-transform duration-500 ease-soft group-hover/btn:rotate-90" />
      </button>
    );
  }

  // In the cart: the button becomes a − qty + stepper.
  return (
    <div className="rise flex shrink-0 items-center gap-1 rounded-full border border-forest/20 bg-cream-soft p-1">
      <button
        type="button"
        onClick={() => setQty(product.slug, qty - 1)}
        aria-label={`Retirer un ${product.name}`}
        className="flex size-8 items-center justify-center rounded-full text-forest transition-colors duration-300 hover:bg-forest hover:text-cream"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-6 text-center text-sm font-medium nums text-forest" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => add(product.slug)}
        aria-label={`Ajouter un ${product.name}`}
        className="flex size-8 items-center justify-center rounded-full text-forest transition-colors duration-300 hover:bg-forest hover:text-cream"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

/** Toast + sticky mobile bar that surfaces the cart wherever the visitor is on the page */
export function OrderBar() {
  const { count, subtotal, lastAdded, items } = useCart();
  const [toast, setToast] = useState<string | null>(null);
  /* Inside the order section the section owns the bar: it carries the live
     total and the next action. Two bars with two different amounts is how a
     phone shopper gets lost. */
  const inOrderSection = useSectionActive("commande");

  useEffect(() => {
    if (!lastAdded) return;
    const line = items.find((l) => l.id === lastAdded.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- toast reacts to add events
    setToast(line ? line.name : null);
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only fire on new add events
  }, [lastAdded]);

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        className={`fixed left-1/2 top-24 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-full bg-forest py-2.5 pl-3 pr-5 text-sm text-cream shadow-[0_18px_40px_-12px_rgba(35,49,41,0.45)] transition-all duration-500 ease-soft ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <span className="bg-foil flex size-6 items-center justify-center rounded-full text-forest">
          <Check className="size-3.5" />
        </span>
        <span className="whitespace-nowrap">
          {toast} <span className="text-cream/60">ajouté</span>
        </span>
        <button type="button" onClick={scrollToOrder} className="eyebrow ml-2 py-1.5 text-gold underline-offset-4 hover:underline">
          Commander
        </button>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-forest/10 bg-cream/95 px-4 py-3 backdrop-blur-md transition-transform duration-500 ease-soft lg:hidden ${
          count > 0 && !inOrderSection ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm">
            <p className="text-ink/65">
              {count} article{count > 1 ? "s" : ""}
            </p>
            <p className="font-serif text-xl nums text-forest">{formatDh(subtotal)}</p>
          </div>
          <button type="button" onClick={scrollToOrder} className="eyebrow rounded-full bg-forest px-7 py-3.5 text-cream">
            Finaliser
          </button>
        </div>
      </div>
    </>
  );
}

export function Plus({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function Minus({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden>
      <path d="M5 12h14" />
    </svg>
  );
}

export function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
