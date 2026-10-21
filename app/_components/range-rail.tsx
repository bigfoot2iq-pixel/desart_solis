"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The range is a snap rail on small screens and a plain grid from lg up.
 *
 * The cards themselves are rendered on the server and handed over as
 * children, so the catalogue markup never ships as client JavaScript —
 * this component only owns the scrolling and the position indicator.
 */
export function RangeRail({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const sync = () => {
      const cards = Array.from(el.children) as HTMLElement[];
      setCount(cards.length);
      if (cards.length < 2) return;

      const inset = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const box = el.getBoundingClientRect();
      let best = 0;
      let bestDistance = Infinity;

      cards.forEach((card, i) => {
        // Scroll offset at which this card sits flush with the snap inset.
        const pos = card.getBoundingClientRect().left - box.left + el.scrollLeft - inset;
        const distance = Math.abs(pos - el.scrollLeft);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      });
      setIndex(best);
    };

    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, []);

  const goTo = useCallback((target: number) => {
    const el = ref.current;
    if (!el) return;
    const card = el.children[target] as HTMLElement | undefined;
    if (!card) return;
    const inset = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const left = card.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft - inset;
    el.scrollTo({ left, behavior: "smooth" });
  }, []);

  return (
    <div className="relative mt-10 lg:mt-16">
      <div
        ref={ref}
        // `touch-auto` on purpose: the browser must be allowed to pan the rail
        // horizontally on touch, and it picks the axis from the gesture — a
        // sideways swipe moves the rail, a vertical one scrolls the page.
        // `pan-y` would silently kill the swipe. `overscroll-x-contain` stops
        // the page from bouncing when the rail reaches its first or last card.
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 scroll-pl-4 select-none touch-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-x-7 lg:gap-y-12 lg:overflow-visible lg:px-0 lg:pb-0 lg:snap-none lg:scroll-pl-0 lg:select-auto"
      >
        {children}
      </div>

      {count > 1 && (
        <div className="mt-7 flex items-center justify-center gap-2 lg:hidden">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Aller au produit ${i + 1}`}
              aria-current={i === index}
              className={`h-[3px] rounded-full transition-all duration-500 ease-soft ${
                i === index ? "w-8 bg-gold-deep" : "w-4 bg-forest/15"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
