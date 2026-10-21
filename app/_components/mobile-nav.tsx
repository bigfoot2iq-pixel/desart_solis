"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type NavItem = { href: string; label: string };

/**
 * Full-screen drawer for small screens. Closes on Escape, on navigation,
 * and locks the page behind it while open.
 *
 * It is rendered in a portal: the sticky header uses `backdrop-filter`, which
 * makes it a containing block for `position: fixed` descendants.
 */
export function MobileNav({ items, ctaHref, ctaLabel }: { items: NavItem[]; ctaHref: string; ctaLabel: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- document.body only exists after hydration
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const drawer = open && (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button
        type="button"
        aria-label="Fermer le menu"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-forest/45 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        id="menu-mobile"
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        className="absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col bg-cream shadow-[-20px_0_60px_-20px_rgba(26,37,30,0.45)]"
      >
        <div className="flex items-center justify-between border-b border-forest/10 px-6 py-5">
          <span className="font-serif text-base tracking-[0.28em] text-forest">DESART SOLIS</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="flex size-9 items-center justify-center rounded-full text-forest transition-colors hover:bg-sand"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-8">
          <ul className="space-y-1">
            {items.map((item, i) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline gap-4 border-b border-forest/10 py-4 font-serif text-3xl font-light text-forest transition-colors hover:text-gold-deep"
                >
                  <span className="font-sans text-[0.6rem] tracking-[0.2em] text-forest/60">0{i + 1}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-forest/10 px-6 py-6">
          <a
            href={ctaHref}
            onClick={() => setOpen(false)}
            className="eyebrow flex items-center justify-center rounded-full bg-forest px-6 py-4 text-cream"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        aria-controls="menu-mobile"
        className="flex size-10 items-center justify-center lg:hidden"
      >
        <span className="flex flex-col items-center gap-[5px]">
          <span className="h-px w-6 bg-forest" />
          <span className="h-px w-6 bg-forest" />
        </span>
      </button>

      {mounted && drawer && createPortal(drawer, document.body)}
    </>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
