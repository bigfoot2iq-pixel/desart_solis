"use client";

import { useCart } from "./cart";

/** Compact cart summary shown in the header, and in the sticky mobile bar. */
export function CartIndicator({ className = "" }: { className?: string }) {
  const { count, subtotal } = useCart();

  if (count === 0) return null;

  return (
    <a
      href="#commande"
      className={`group flex items-center gap-3 rounded-full border border-forest/15 bg-cream-soft/70 py-1.5 pl-3 pr-4 transition-colors duration-300 hover:border-forest/40 ${className}`}
      aria-label={`${count} article${count > 1 ? "s" : ""} dans la commande — ${Math.round(subtotal)} dirhams`}
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-forest text-[0.65rem] font-medium nums text-cream">
        {count}
      </span>
      <span className="text-xs nums text-forest">{Math.round(subtotal)} DH</span>
    </a>
  );
}
