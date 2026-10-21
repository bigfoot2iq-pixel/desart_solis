"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { formatDh, whatsappLink } from "../_data";
import { Check, Minus, Plus, packPrice, useCart } from "./cart";

const PHONE_RE = /^(?:\+212|00212|0)[5-7]\d{8}$/;

type Form = { name: string; phone: string; city: string; address: string; code: string; note: string };
const emptyForm: Form = { name: "", phone: "", city: "", address: "", code: "", note: "" };

export function OrderBuilder() {
  const { catalog, items, lines, subtotal, savings, count, setQty, add, clear } = useCart();
  const { products, packs, shipping, whatsappNumber } = catalog;
  const [form, setForm] = useState<Form>(emptyForm);
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);

  const city = shipping.cities.find((c) => c.name === form.city);
  const freeFrom = shipping.freeFrom;
  const freeShipping = freeFrom !== null && subtotal >= freeFrom;
  const deliveryFee = !city ? null : freeShipping ? 0 : city.fee;
  const total = subtotal + (deliveryFee ?? 0);
  const toFree = freeFrom === null ? 0 : Math.max(0, freeFrom - subtotal);

  const phoneClean = form.phone.replace(/[\s.-]/g, "");
  const errors = {
    items: count === 0 ? "Ajoutez au moins un soin." : null,
    name: form.name.trim().length < 2 ? "Indiquez votre nom." : null,
    phone: !PHONE_RE.test(phoneClean) ? "Numéro marocain invalide (ex. 06 12 34 56 78)." : null,
    city: !city ? "Choisissez votre ville." : null,
    address: form.address.trim().length < 6 ? "Indiquez votre adresse de livraison." : null,
  };
  const valid = Object.values(errors).every((e) => e === null);

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildMessage() {
    const rows = items.map((l) => `• ${l.qty} × ${l.name} (${l.detail}) — ${formatDh(l.unitPrice * l.qty)}`);
    return [
      "Bonjour Desart Solis, je souhaite passer commande :",
      "",
      ...rows,
      "",
      `Sous-total : ${formatDh(subtotal)}`,
      savings > 0 ? `Économies packs : −${formatDh(savings)}` : null,
      `Livraison (${form.city}) : ${deliveryFee === 0 ? "offerte" : formatDh(deliveryFee ?? 0)}`,
      `Total : ${formatDh(total)} — paiement à la livraison`,
      "",
      `Nom : ${form.name.trim()}`,
      `Téléphone : ${phoneClean}`,
      `Ville : ${form.city}`,
      `Adresse : ${form.address.trim()}`,
      form.code.trim() ? `Code parrainage : ${form.code.trim()}` : null,
      form.note.trim() ? `Note : ${form.note.trim()}` : null,
    ]
      .filter((r) => r !== null)
      .join("\n");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    window.open(whatsappLink(whatsappNumber, buildMessage()), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto mt-16 grid max-w-7xl gap-10 lg:mt-20 lg:grid-cols-[1fr_26rem] lg:gap-14">
      <div className="min-w-0 space-y-14">
        {/* Step 1 — products */}
        <Step n="1" title="Choisissez vos soins" error={touched ? errors.items : null}>
          {packs.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {packs.map((pack) => {
              const { full, price } = packPrice(pack, products);
              const qty = lines[pack.id] ?? 0;
              const active = qty > 0;
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => (active ? setQty(pack.id, 0) : add(pack.id))}
                  aria-pressed={active}
                  className={`relative rounded-2xl border p-5 text-left transition-all duration-300 ${
                    active ? "border-forest bg-forest text-cream" : "border-forest/15 bg-cream hover:border-forest/40"
                  }`}
                >
                  {pack.badge && (
                    <span className="bg-foil eyebrow absolute -top-2.5 right-5 rounded-full px-3 py-1 !text-[0.55rem] text-forest">{pack.badge}</span>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`eyebrow ${active ? "text-gold" : "text-gold-deep"}`}>Pack · −{Math.round(pack.discount * 100)} %</p>
                      <p className="mt-2 font-serif text-2xl">{pack.name}</p>
                      <p className={`mt-1 text-xs ${active ? "text-cream/60" : "text-ink/55"}`}>{pack.description}</p>
                    </div>
                    <span
                      className={`mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border ${
                        active ? "border-gold bg-gold text-forest" : "border-forest/25"
                      }`}
                    >
                      {active && <Check className="size-3.5" />}
                    </span>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex -space-x-3">
                      {pack.items.map((slug) => {
                        const p = products.find((x) => x.slug === slug)!;
                        return (
                          <span key={slug} className={`flex size-11 items-center justify-center rounded-full border ${active ? "border-forest-soft bg-cream" : "border-cream bg-sand"}`}>
                            <Image src={p.image.url} alt="" width={p.image.width} height={p.image.height} sizes="32px" className="h-8 w-auto" />
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-right">
                      <span className={`mr-2 text-xs line-through ${active ? "text-cream/45" : "text-ink/40"}`}>{formatDh(full)}</span>
                      <span className="font-serif text-2xl">{formatDh(price)}</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          )}

          {packs.length > 0 && <p className="eyebrow mb-4 mt-10 text-forest/50">Ou à l’unité</p>}
          <ul className="divide-y divide-forest/10 border-y border-forest/10">
            {products.map((p) => {
              const qty = lines[p.slug] ?? 0;
              return (
                <li key={p.slug} className="flex items-center gap-4 py-4 sm:gap-6">
                  <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-sand">
                    <Image src={p.image.url} alt="" width={p.image.width} height={p.image.height} sizes="48px" className="h-12 w-auto" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-xl text-forest">{p.name}</p>
                    <p className="text-xs text-ink/55">
                      {p.size} · {formatDh(p.price)}
                    </p>
                  </div>
                  {p.soldOut ? (
                    <span className="text-xs text-ink/45">Rupture de stock</span>
                  ) : (
                    <Stepper value={qty} onChange={(v) => setQty(p.slug, v)} label={p.name} />
                  )}
                </li>
              );
            })}
          </ul>
        </Step>

        {/* Step 2 — delivery */}
        <Step n="2" title="Vos coordonnées de livraison">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom complet" error={touched ? errors.name : null}>
              {(id) => (
                <input id={id} value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" className={inputCls} placeholder="Prénom Nom" />
              )}
            </Field>
            <Field label="Téléphone (WhatsApp)" error={touched ? errors.phone : null}>
              {(id) => (
                <input
                  id={id}
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  className={inputCls}
                  placeholder="06 12 34 56 78"
                />
              )}
            </Field>
            <Field label="Ville" error={touched ? errors.city : null}>
              {(id) => (
                <div className="relative">
                  <select id={id} value={form.city} onChange={(e) => update("city", e.target.value)} className={`${inputCls} appearance-none pr-10`}>
                    <option value="">Sélectionnez votre ville</option>
                    {shipping.cities.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} — {formatDh(c.fee)}
                      </option>
                    ))}
                  </select>
                  <Chevron className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-forest/50" />
                </div>
              )}
            </Field>
            <Field label="Adresse" error={touched ? errors.address : null}>
              {(id) => (
                <input
                  id={id}
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  autoComplete="street-address"
                  className={inputCls}
                  placeholder="Quartier, rue, n°"
                />
              )}
            </Field>
            <Field label="Code parrainage" optional>
              {(id) => (
                <input id={id} value={form.code} onChange={(e) => update("code", e.target.value.toUpperCase())} className={`${inputCls} uppercase`} placeholder="Facultatif" />
              )}
            </Field>
            <Field label="Note pour la livraison" optional>
              {(id) => <input id={id} value={form.note} onChange={(e) => update("note", e.target.value)} className={inputCls} placeholder="Horaires, repère…" />}
            </Field>
          </div>
        </Step>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-3xl bg-forest p-7 text-cream sm:p-8">
          <div className="flex items-baseline justify-between">
            <p className="font-serif text-3xl">Récapitulatif</p>
            {count > 0 && (
              <button type="button" onClick={clear} className="text-xs text-cream/50 underline-offset-4 hover:text-cream hover:underline">
                Vider
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-cream/20 px-5 py-8 text-center text-sm text-cream/55">Votre sélection est vide.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {items.map((l) => (
                <li key={l.id} className="flex items-start justify-between gap-4 text-sm">
                  <div>
                    <p>
                      <span className="text-gold">{l.qty} ×</span> {l.name}
                    </p>
                    <p className="text-xs text-cream/50">{l.detail}</p>
                  </div>
                  <p className="shrink-0 tabular-nums">{formatDh(l.unitPrice * l.qty)}</p>
                </li>
              ))}
            </ul>
          )}

          {count > 0 && freeFrom !== null && (
            <div className="mt-6">
              <div className="h-1 overflow-hidden rounded-full bg-cream/10">
                <div className="bg-foil h-full rounded-full transition-[width] duration-700 ease-soft" style={{ width: `${Math.min(100, (subtotal / freeFrom) * 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-cream/60">
                {freeShipping ? "Livraison offerte ✓" : `Plus que ${formatDh(toFree)} pour la livraison offerte`}
              </p>
            </div>
          )}

          <dl className="mt-6 space-y-2.5 border-t border-cream/10 pt-6 text-sm">
            <Row label="Sous-total" value={formatDh(subtotal)} />
            {savings > 0 && <Row label="Économies packs" value={`−${formatDh(savings)}`} accent />}
            <Row
              label={city ? `Livraison · ${city.name}` : "Livraison"}
              value={deliveryFee === null ? "Choisir une ville" : deliveryFee === 0 ? "Offerte" : formatDh(deliveryFee)}
              muted={deliveryFee === null}
            />
          </dl>
          <div className="mt-5 flex items-baseline justify-between border-t border-cream/10 pt-5">
            <span className="eyebrow text-cream/70">Total</span>
            <span className="font-serif text-4xl tabular-nums">{deliveryFee === null && count > 0 ? "—" : formatDh(total)}</span>
          </div>
          <p className="mt-1 text-right text-xs text-cream/50">Paiement en espèces à la livraison</p>

          <button
            type="submit"
            className="eyebrow bg-foil mt-7 flex w-full items-center justify-center gap-3 rounded-full py-4 text-forest transition-[filter,opacity] duration-300 hover:brightness-110"
          >
            <WhatsAppIcon className="size-4" />
            Commander sur WhatsApp
          </button>
          {touched && !valid && <p className="mt-3 text-center text-xs text-[#f0b9a5]">Complétez les champs indiqués pour continuer.</p>}
          {sent && valid && (
            <p className="mt-3 text-center text-xs text-cream/70">
              WhatsApp s’est ouvert avec votre commande. Envoyez le message : nous confirmons très vite.
            </p>
          )}

          <ul className="mt-8 grid grid-cols-2 gap-3 border-t border-cream/10 pt-6 text-xs text-cream/65">
            {["Paiement à la livraison", "Confirmation WhatsApp", "Livraison partout au Maroc", "Conseil personnalisé"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="size-3.5 shrink-0 text-gold" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-forest/15 bg-cream px-4 py-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-forest";

function Step({ n, title, error, children }: { n: string; title: string; error?: string | null; children: React.ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-7 flex w-full items-center gap-4">
        <span className="flex size-9 items-center justify-center rounded-full border border-gold font-serif text-lg text-gold-deep">{n}</span>
        <span className="font-serif text-3xl text-forest">{title}</span>
      </legend>
      {error && <p className="-mt-3 mb-5 text-xs text-[#b4533a]">{error}</p>}
      {children}
    </fieldset>
  );
}

function Field({ label, optional, error, children }: { label: string; optional?: boolean; error?: string | null; children: (id: string) => React.ReactElement }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex justify-between text-xs font-medium text-forest/80">
        {label}
        {optional && <span className="font-normal text-ink/40">Facultatif</span>}
      </label>
      <div className={error ? "[&_input]:border-[#b4533a] [&_select]:border-[#b4533a]" : ""}>{children(id)}</div>
      {error && <p className="mt-1.5 text-xs text-[#b4533a]">{error}</p>}
    </div>
  );
}

function Row({ label, value, accent, muted }: { label: string; value: string; accent?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-cream/65">{label}</dt>
      <dd className={`tabular-nums ${accent ? "text-gold" : muted ? "text-cream/45" : ""}`}>{value}</dd>
    </div>
  );
}

function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center rounded-full border border-forest/15">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value === 0}
        aria-label={`Retirer ${label}`}
        className="flex size-10 items-center justify-center text-forest transition-opacity disabled:opacity-25"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label={`Ajouter ${label}`} className="flex size-10 items-center justify-center text-forest">
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3ZM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
    </svg>
  );
}
