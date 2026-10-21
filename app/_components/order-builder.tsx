"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { formatDh, whatsappLink } from "../_data";
import { Check, Minus, OPEN_ORDER_EVENT, Plus, packPrice, useCart } from "./cart";
import { useSectionActive } from "./use-section-active";

const PHONE_RE = /^(?:\+212|00212|0)[5-7]\d{8}$/;

type Form = { name: string; phone: string; city: string; address: string; code: string; note: string };
const emptyForm: Form = { name: "", phone: "", city: "", address: "", code: "", note: "" };

/**
 * The mobile flow. On a phone the order is a guided sequence instead of one
 * long column: pick the care, give the address, check the summary. On desktop
 * the section keeps its two-column layout and every step stays visible.
 */
const STEPS = [
  { n: "1", label: "Choix" },
  { n: "2", label: "Livraison" },
  { n: "3", label: "Récap" },
];

export function OrderBuilder() {
  const { catalog, items, lines, subtotal, savings, count, setQty, add, clear } = useCart();
  const { products, packs, shipping, whatsappNumber } = catalog;
  const [form, setForm] = useState<Form>(emptyForm);
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  /** Active step of the mobile flow. Desktop shows every step at once. */
  const [step, setStep] = useState(1);
  /** True while the section is on screen — the mobile action bar lives there. */
  const sectionActive = useSectionActive("commande");
  const railRef = useRef<HTMLDivElement>(null);

  const city = shipping.cities.find((c) => c.name === form.city);
  const freeFrom = shipping.freeFrom;
  const freeShipping = freeFrom !== null && subtotal >= freeFrom;
  const deliveryFee = !city ? null : freeShipping ? 0 : city.fee;
  const total = subtotal + (deliveryFee ?? 0);
  const toFree = freeFrom === null ? 0 : Math.max(0, freeFrom - subtotal);

  const phoneClean = form.phone.replace(/[\s.-]/g, "");
  const deliveryErrors = {
    name: form.name.trim().length < 2 ? "Indiquez votre nom." : null,
    phone: !PHONE_RE.test(phoneClean) ? "Numéro marocain invalide (ex. 06 12 34 56 78)." : null,
    city: !city ? "Choisissez votre ville." : null,
    address: form.address.trim().length < 6 ? "Indiquez votre adresse de livraison." : null,
  };
  const deliveryValid = Object.values(deliveryErrors).every((e) => e === null);
  const itemsError = count === 0 ? "Ajoutez au moins un soin." : null;
  const valid = itemsError === null && deliveryValid;

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

  /** Brings the step rail back under the header after a step change. */
  function focusRail() {
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    railRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* Arriving from the site-wide cart bar opens the step that still needs the
     visitor: the basket if it is empty, the address if it is missing, the
     summary if everything is already filled in. */
  useEffect(() => {
    function open() {
      setStep(count === 0 ? 1 : deliveryValid ? 3 : 2);
      focusRail();
    }
    window.addEventListener(OPEN_ORDER_EVENT, open);
    return () => window.removeEventListener(OPEN_ORDER_EVENT, open);
  }, [count, deliveryValid]);

  /**
   * Leaving a step validates it first, so nothing is skipped silently: the
   * visitor cannot reach the summary with an empty basket or a half-filled
   * address.
   */
  function goToStep(next: number) {
    if (next > step) {
      if (step === 1 && itemsError) {
        setTouched(true);
        focusRail();
        return;
      }
      if (step === 2 && !deliveryValid) {
        setTouched(true);
        focusRail();
        return;
      }
    }
    setStep(next);
    focusRail();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) {
      // Send the visitor straight to the step that still needs work.
      setStep(itemsError ? 1 : 2);
      focusRail();
      return;
    }
    window.open(whatsappLink(whatsappNumber, buildMessage()), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  /* The summary. Rendered twice — once in the desktop column, once as the
     last step of the mobile flow — so both layouts read identically. */
  const summary = (
    <div className="grain relative overflow-hidden rounded-[1.75rem] bg-forest p-7 text-cream sm:p-8">
      <div className="relative">
        <div className="flex items-baseline justify-between">
          <p className="font-serif text-3xl font-light">Récapitulatif</p>
          {count > 0 && (
            <button
              type="button"
              onClick={clear}
              className="-my-2 px-2 py-2 text-xs text-cream/60 underline-offset-4 hover:text-cream hover:underline"
            >
              Vider
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-cream/20 px-5 py-8 text-center text-sm text-cream/65">
            Votre sélection est vide.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {items.map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-4 text-sm">
                <div>
                  <p>
                    <span className="text-gold">{l.qty} ×</span> {l.name}
                  </p>
                  <p className="text-xs text-cream/60">{l.detail}</p>
                </div>
                <p className="shrink-0 nums">{formatDh(l.unitPrice * l.qty)}</p>
              </li>
            ))}
          </ul>
        )}

        {count > 0 && freeFrom !== null && (
          <div className="mt-6">
            <div className="h-1 overflow-hidden rounded-full bg-cream/10">
              <div
                className="bg-foil h-full rounded-full transition-[width] duration-700 ease-soft"
                style={{ width: `${Math.min(100, (subtotal / freeFrom) * 100)}%` }}
              />
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
          <span className="font-serif text-4xl nums">{deliveryFee === null && count > 0 ? "—" : formatDh(total)}</span>
        </div>
        <p className="mt-1 text-right text-xs text-cream/60">Paiement en espèces à la livraison</p>

        {/* The mobile action bar carries the call to action, so this one is
            only shown in the desktop column. */}
        <button
          type="submit"
          className="eyebrow bg-foil mt-7 hidden w-full items-center justify-center gap-3 rounded-full py-4 text-forest transition-[filter,opacity] duration-300 hover:brightness-110 lg:flex"
        >
          <WhatsAppIcon className="size-4" />
          Commander sur WhatsApp
        </button>
        {touched && !valid && (
          <p className="mt-3 text-center text-xs text-[#f0b9a5]">Complétez les champs indiqués pour continuer.</p>
        )}
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
    </div>
  );

  return (
    <>
      {/* Step rail — mobile only. Sticks under the header so the visitor always
          knows where they are and can jump back to a completed step. */}
      <div
        ref={railRef}
        className="sticky top-16 z-30 -mx-4 mb-8 scroll-mt-20 border-y border-forest/10 bg-cream-soft/95 px-4 py-1.5 backdrop-blur-md sm:-mx-8 sm:px-8 lg:hidden"
      >
        <ol className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <li key={s.n} className="flex-1">
                <button
                  type="button"
                  onClick={() => goToStep(n)}
                  aria-current={active ? "step" : undefined}
                  className="flex w-full items-center gap-2 py-2"
                >
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-[0.65rem] nums transition-colors ${
                      active
                        ? "border-gold bg-gold text-forest"
                        : done
                          ? "border-forest/30 bg-forest text-cream"
                          : "border-forest/20 text-forest/65"
                    }`}
                  >
                    {done ? <Check className="size-3" /> : s.n}
                  </span>
                  <span
                    className={`text-[0.68rem] uppercase tracking-[0.12em] transition-colors ${
                      active ? "text-forest" : "text-forest/65"
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="sr-only" aria-live="polite">
          {`Étape ${step} sur ${STEPS.length} : ${STEPS[step - 1].label}`}
        </p>
      </div>

      <form
        id="order-form"
        onSubmit={submit}
        noValidate
        className="grid gap-10 pb-24 lg:mt-16 lg:grid-cols-[1fr_23rem] lg:gap-12 lg:pb-0"
      >
        <div className="min-w-0">
          {/* Step 1 — products */}
          <div className={`mb-0 lg:mb-14 ${step === 1 ? "" : "hidden lg:block"}`}>
            <Step n="1" title="Choisissez vos soins" error={touched ? itemsError : null}>
              {packs.length > 0 && (
                /* Two packs side by side, even on a phone: they share the same
                   shape, so a pair reads as a choice. The card carries the same
                   information at half the width — smaller type, tighter
                   spacing, the thumbnails in a single strip. */
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
                        className={`relative rounded-2xl border p-3.5 text-left transition-all duration-300 sm:p-5 ${
                          active ? "border-forest bg-forest text-cream" : "border-forest/15 bg-cream-soft hover:border-forest/40"
                        }`}
                      >
                        {pack.badge && (
                          <span className="bg-foil eyebrow absolute -top-2 right-2.5 rounded-full px-2 py-0.5 !text-[0.5rem] tracking-[0.18em] text-forest sm:-top-2.5 sm:right-5 sm:px-3 sm:py-1 sm:!text-[0.55rem] sm:tracking-[0.3em]">
                            {pack.badge}
                          </span>
                        )}
                        <div className="flex items-start justify-between gap-1.5 sm:gap-3">
                          <div className="min-w-0">
                            <p
                              className={`eyebrow !text-[0.56rem] !tracking-[0.14em] sm:!text-[0.6875rem] sm:!tracking-[0.3em] ${
                                active ? "text-gold" : "text-gold-deep"
                              }`}
                            >
                              Pack · −{Math.round(pack.discount * 100)} %
                            </p>
                            <p className="mt-1 font-serif text-[1.15rem] leading-tight sm:mt-2 sm:text-2xl">{pack.name}</p>
                            <p
                              className={`mt-1 line-clamp-2 text-[0.62rem] leading-snug sm:mt-1 sm:line-clamp-none sm:text-xs ${
                                active ? "text-cream/60" : "text-ink/65"
                              }`}
                            >
                              {pack.description}
                            </p>
                          </div>
                          <span
                            className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border sm:mt-1 sm:size-6 ${
                              active ? "border-gold bg-gold text-forest" : "border-forest/25 text-forest/65"
                            }`}
                          >
                            {active ? <Check className="size-3" /> : <Plus className="size-2.5" />}
                          </span>
                        </div>
                        {/* Thumbnails on the left, price on the right — the card
                            spends its full width instead of stacking. */}
                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-1.5 gap-y-1 sm:mt-5 sm:flex-nowrap sm:gap-3">
                          <div className="flex -space-x-2.5 sm:-space-x-3">
                            {pack.items.map((slug) => {
                              const p = products.find((x) => x.slug === slug)!;
                              return (
                                <span
                                  key={slug}
                                  className={`flex size-7 items-center justify-center rounded-full border sm:size-11 ${
                                    active ? "border-forest-soft bg-cream" : "border-cream bg-sand"
                                  }`}
                                >
                                  <Image
                                    src={p.image.url}
                                    alt=""
                                    width={p.image.width}
                                    height={p.image.height}
                                    sizes="32px"
                                    className="h-4 w-auto sm:h-8"
                                  />
                                </span>
                              );
                            })}
                          </div>
                          <p className="ml-auto whitespace-nowrap sm:text-right">
                            {/* The struck price only fits from sm up: on a phone
                                the discount badge already says the saving. */}
                            <span
                              className={`mr-2 hidden text-xs nums line-through sm:inline ${
                                active ? "text-cream/60" : "text-ink/65"
                              }`}
                            >
                              {formatDh(full)}
                            </span>
                            <span className="font-serif text-[1.05rem] nums sm:text-2xl">{formatDh(price)}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {packs.length > 0 && <p className="eyebrow mb-4 mt-10 text-forest/70">Ou à l’unité</p>}
              <ul className="divide-y divide-forest/10 border-y border-forest/10">
                {products.map((p) => {
                  const qty = lines[p.slug] ?? 0;
                  return (
                    <li key={p.slug} className="flex items-center gap-4 py-4 sm:gap-6">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-sand-warm sm:size-16">
                        <Image
                          src={p.image.url}
                          alt=""
                          width={p.image.width}
                          height={p.image.height}
                          sizes="48px"
                          className="h-10 w-auto sm:h-12"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-serif text-lg text-forest sm:text-xl">{p.name}</p>
                        <p className="text-xs nums text-ink/65">
                          {p.size} · {formatDh(p.price)}
                        </p>
                      </div>
                      {p.soldOut ? (
                        <span className="shrink-0 text-xs text-ink/65">Rupture de stock</span>
                      ) : qty === 0 ? (
                        /* Nothing selected yet: a single, honest "add" control
                           instead of a stepper sitting on a zero. */
                        <button
                          type="button"
                          onClick={() => add(p.slug)}
                          aria-label={`Ajouter ${p.name} — ${formatDh(p.price)}`}
                          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-forest/20 text-forest transition-colors duration-300 hover:border-forest hover:bg-forest hover:text-cream"
                        >
                          <Plus className="size-4" />
                        </button>
                      ) : (
                        <Stepper value={qty} onChange={(v) => setQty(p.slug, v)} label={p.name} />
                      )}
                    </li>
                  );
                })}
              </ul>
            </Step>
          </div>

          {/* Step 2 — delivery */}
          <div className={step === 2 ? "" : "hidden lg:block"}>
            <Step
              n="2"
              title="Vos coordonnées de livraison"
              error={touched && !deliveryValid ? "Complétez les champs indiqués pour continuer." : null}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nom complet" error={touched ? deliveryErrors.name : null}>
                  {(id) => (
                    <input
                      id={id}
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      autoComplete="name"
                      autoCapitalize="words"
                      className={inputCls}
                      placeholder="Prénom Nom"
                    />
                  )}
                </Field>
                <Field label="Téléphone (WhatsApp)" error={touched ? deliveryErrors.phone : null}>
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
                <Field label="Ville" error={touched ? deliveryErrors.city : null}>
                  {(id) => (
                    <div className="relative">
                      <select
                        id={id}
                        value={form.city}
                        onChange={(e) => update("city", e.target.value)}
                        className={`${inputCls} appearance-none pr-10`}
                      >
                        <option value="">Sélectionnez votre ville</option>
                        {shipping.cities.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name} — {formatDh(c.fee)}
                          </option>
                        ))}
                      </select>
                      <Chevron className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-forest/70" />
                    </div>
                  )}
                </Field>
                <Field label="Adresse" error={touched ? deliveryErrors.address : null}>
                  {(id) => (
                    <input
                      id={id}
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      autoComplete="street-address"
                      autoCapitalize="words"
                      className={inputCls}
                      placeholder="Quartier, rue, n°"
                    />
                  )}
                </Field>
                <Field label="Code parrainage" optional>
                  {(id) => (
                    <input
                      id={id}
                      value={form.code}
                      onChange={(e) => update("code", e.target.value.toUpperCase())}
                      className={`${inputCls} uppercase`}
                      placeholder="Facultatif"
                    />
                  )}
                </Field>
                <Field label="Note pour la livraison" optional>
                  {(id) => (
                    <input
                      id={id}
                      value={form.note}
                      onChange={(e) => update("note", e.target.value)}
                      className={inputCls}
                      placeholder="Horaires, repère…"
                    />
                  )}
                </Field>
              </div>
            </Step>
          </div>

          {/* Step 3 — summary (mobile). The desktop shows it in the column. */}
          <div className={`${step === 3 ? "" : "hidden"} lg:hidden`}>{summary}</div>
        </div>

        {/* Summary column (desktop) */}
        <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">{summary}</aside>
      </form>

      {/* Action bar — mobile only. It replaces the site-wide cart bar while the
          section is on screen, so there is never more than one bar and one
          amount on a phone. */}
      {sectionActive && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-forest/10 bg-cream/95 px-4 py-2.5 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[0.58rem] uppercase leading-tight tracking-[0.14em] text-ink/65">
                {deliveryFee === null ? "Sous-total" : "Total"} · {count} article{count > 1 ? "s" : ""}
              </p>
              <p className="font-serif text-[1.5rem] leading-tight nums text-forest">
                {formatDh(deliveryFee === null ? subtotal : total)}
              </p>
            </div>

            {step === 3 ? (
              <button
                type="submit"
                form="order-form"
                className="eyebrow bg-foil inline-flex shrink-0 items-center gap-2.5 rounded-full px-6 py-3.5 text-forest transition-[filter] duration-300 hover:brightness-110"
              >
                <WhatsAppIcon className="size-4" />
                Commander
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goToStep(step + 1)}
                className="eyebrow inline-flex shrink-0 items-center gap-2 rounded-full bg-forest px-6 py-3.5 text-cream transition-colors duration-300 hover:bg-forest-soft"
              >
                {step === 1 ? "Livraison" : "Récap"}
                <ArrowIcon className="size-3.5" />
              </button>
            )}
          </div>

          {count > 0 && toFree > 0 && (
            <p className="mt-1.5 text-center text-[0.66rem] text-gold-deep">
              Plus que {formatDh(toFree)} pour la livraison offerte
            </p>
          )}
        </div>
      )}
    </>
  );
}

/* 16 px on a phone: anything smaller makes iOS zoom the page on focus. */
const inputCls =
  "w-full rounded-xl border border-forest/15 bg-cream-soft px-4 py-3.5 text-base text-ink outline-none transition-colors placeholder:text-ink/55 focus:border-forest sm:text-sm";

function Step({ n, title, error, children }: { n: string; title: string; error?: string | null; children: React.ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-5 flex w-full items-center gap-3 lg:mb-7 lg:gap-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gold font-serif text-base text-gold-deep lg:size-9 lg:text-lg">
          {n}
        </span>
        <span className="font-serif text-2xl font-light text-forest lg:text-3xl">{title}</span>
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
        {optional && <span className="font-normal text-ink/65">Facultatif</span>}
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
      <dd className={`nums ${accent ? "text-gold" : muted ? "text-cream/60" : ""}`}>{value}</dd>
    </div>
  );
}

function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex shrink-0 items-center rounded-full border border-forest/15">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value === 0}
        aria-label={`Retirer ${label}`}
        className="flex size-10 items-center justify-center text-forest transition-opacity disabled:opacity-25"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-6 text-center text-sm nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label={`Ajouter ${label}`}
        className="flex size-10 items-center justify-center text-forest"
      >
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

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" />
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
