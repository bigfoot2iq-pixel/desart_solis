"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { formatDh } from "../_data";
import { Check } from "./cart";
import { inputCls } from "./field";

export type ShippingCity = { name: string; fee: number };

/**
 * The city list is a list, not a form field.
 *
 * On a phone the native select hands the choice to the OS picker: sixteen
 * options rendered by the system, each one a flat "Casablanca — 20 DH"
 * string, with the delivery fee buried in the middle of it and no way to
 * filter. This replaces it with a sheet that keeps the brand typography, puts
 * the fee on the right where it can be compared at a glance, and filters the
 * list as you type.
 *
 * A wide screen keeps the native select — one line, keyboard friendly, and it
 * needs no JavaScript at all.
 */
export function CityPicker({
  id,
  labelId,
  cities,
  value,
  onChange,
  error,
  freeFrom,
  freeShipping,
}: {
  id: string;
  labelId: string;
  cities: ShippingCity[];
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  freeFrom: number | null;
  freeShipping: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const sheetId = useId();
  const valueId = useId();

  const selected = cities.find((c) => c.name === value) ?? null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => c.name.toLowerCase().includes(q));
  }, [cities, query]);

  const close = useCallback(() => {
    setQuery("");
    setOpen(false);
  }, []);

  /* The sheet takes over the screen: the page behind it must not scroll. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    /* A phone turned sideways becomes a wide screen, where the sheet does not
       exist. Close it rather than leave the page locked behind a hidden
       panel. */
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) close();
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = previous;
    };
  }, [open, close]);

  /* Move the focus into the sheet, and give it back to the trigger. */
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      (searchRef.current ?? panelRef.current)?.focus();
    } else if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  function choose(name: string) {
    onChange(name);
    close();
  }

  /* The sheet is a phone control. A wide screen keeps the native select, so
     the sheet must never open there — the button is hidden, but a keyboard or
     a stray event could still reach it. */
  function openSheet() {
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    setOpen(true);
  }

  const cheapest = cities.length ? Math.min(...cities.map((c) => c.fee)) : 0;
  const dearest = cities.length ? Math.max(...cities.map((c) => c.fee)) : 0;

  return (
    <>
      {/* Wide screens: the native select. */}
      <div className="relative hidden lg:block">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} appearance-none pr-10`}
        >
          <option value="">Sélectionnez votre ville</option>
          {cities.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} — {formatDh(c.fee)}
            </option>
          ))}
        </select>
        <Chevron className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-forest/70" />
      </div>

      {/* Phone: a button that opens the sheet. It has to look like a control
          and not like a text field — the visitor must know a list is waiting
          behind it. */}
      {cities.length > 0 && (
        <button
          ref={triggerRef}
          type="button"
          onClick={openSheet}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-labelledby={`${labelId} ${valueId}`}
          className={`${inputCls} flex items-center justify-between gap-3 text-left lg:hidden ${
            error ? "border-[#b4533a]" : ""
          }`}
        >
          <span id={valueId} className={value ? "text-ink" : "text-ink/55"}>
            {value || "Sélectionnez votre ville"}
          </span>
          <Chevron className="size-4 shrink-0 text-forest/70" />
        </button>
      )}

      {/* The delivery fee, stated once the city is known — the sheet showed it
          next to every city, the field only needs to confirm the choice. */}
      {selected && (
        <p className="mt-1.5 text-xs text-ink/65">
          Livraison {freeShipping ? "offerte" : formatDh(selected.fee)}
          {!freeShipping && freeFrom !== null ? ` · offerte dès ${formatDh(freeFrom)} d’achat` : ""}
        </p>
      )}

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-labelledby={sheetId}>
          <button
            type="button"
            aria-label="Fermer la liste des villes"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-forest/45 backdrop-blur-[2px]"
          />

          <div
            ref={panelRef}
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-[1.5rem] bg-cream-soft shadow-[0_-18px_44px_rgba(35,49,41,0.22)] outline-none"
          >
            <span className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-forest/15" aria-hidden />

            <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
              <div>
                <h2 id={sheetId} className="font-serif text-xl font-light text-forest">
                  Ville de livraison
                </h2>
                <p className="mt-1 text-xs text-ink/65">
                  {formatDh(cheapest)} à {formatDh(dearest)}
                  {freeShipping
                    ? " · livraison offerte"
                    : freeFrom !== null
                      ? ` · offerte dès ${formatDh(freeFrom)} d’achat`
                      : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-forest/15 text-forest transition-colors hover:bg-sand/60"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            {cities.length > 8 && (
              <div className="px-5 pb-3">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-forest/45" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher une ville"
                    aria-label="Rechercher une ville"
                    className="w-full rounded-xl border border-forest/15 bg-cream py-2.5 pl-10 pr-3 text-base text-ink outline-none transition-colors placeholder:text-ink/50 focus:border-forest"
                  />
                </div>
              </div>
            )}

            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
            >
              {results.length === 0 ? (
                <p className="px-3 py-10 text-center text-sm text-ink/65">Aucune ville ne correspond à « {query} ».</p>
              ) : (
                <ul role="listbox" aria-label="Villes">
                  {results.map((c) => {
                    const active = c.name === value;
                    return (
                      <li key={c.name} role="presentation">
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => choose(c.name)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                            active ? "bg-forest text-cream" : "text-forest hover:bg-sand/60"
                          }`}
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            {active && <Check className="size-4 shrink-0 text-gold" />}
                            <span className="truncate text-[0.95rem]">{c.name}</span>
                          </span>
                          <span className={`shrink-0 text-xs nums ${active ? "text-cream/70" : "text-ink/60"}`}>
                            {formatDh(c.fee)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className={className} aria-hidden>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
