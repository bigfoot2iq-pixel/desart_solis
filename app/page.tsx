import Image from "next/image";
import { AddToOrderButton, CartProvider, OrderBar } from "./_components/cart";
import { CartIndicator } from "./_components/cart-indicator";
import { MobileNav, type NavItem } from "./_components/mobile-nav";
import { OrderBuilder } from "./_components/order-builder";
import { ReviewsWidget } from "./_components/reviews";
import { promises, ritual, values, whatsappLink } from "./_data";
import { getHomeContent } from "./_lib/catalog";
import type { Faq as FaqItem, Product, Review, Settings } from "./_lib/types";

const nav: NavItem[] = [
  { href: "#produits", label: "Produits" },
  { href: "#rituel", label: "Rituel" },
  { href: "#histoire", label: "Histoire" },
  { href: "#avis", label: "Avis" },
  { href: "#faq", label: "FAQ" },
];

const categoryLabels: Record<string, string> = { visage: "Visage", cheveux: "Cheveux", barbe: "Barbe", corps: "Corps" };

export default async function Home() {
  const { settings, shipping, products, packs, reviews, faqs } = await getHomeContent();
  const catalog = { products, packs, shipping, whatsappNumber: settings.whatsappNumber };

  return (
    <CartProvider catalog={catalog}>
      <AnnouncementBar text={settings.announcement} />
      <Header />
      <main>
        <Hero />
        <Promises />
        <Products products={products} />
        <Ritual />
        <Story />
        <Reviews reviews={reviews} products={products} whatsappNumber={settings.whatsappNumber} />
        <Order />
        <Faq faqs={faqs} />
        <FinalCta whatsappNumber={settings.whatsappNumber} />
      </main>
      <Footer settings={settings} />
      <OrderBar />
    </CartProvider>
  );
}

/* ——— Chrome ——— */

function AnnouncementBar({ text }: { text: string | null }) {
  if (!text) return null;
  const parts = text.split("•").map((t) => t.trim()).filter(Boolean);
  return (
    <div className="bg-forest text-cream/80">
      <p className="eyebrow mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2.5 text-center !text-[0.6rem] !tracking-[0.22em] sm:!text-[0.6875rem] sm:!tracking-[0.3em]">
        {parts.map((part, i) => (
          <span key={part} className="flex items-center gap-2">
            {i > 0 && <span className="text-gold">•</span>}
            {part}
          </span>
        ))}
      </p>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-cream/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-8">
        <a href="#" className="flex items-center gap-3" aria-label="Desart Solis — accueil">
          <Image src="/brand/monogram-transparent.png" alt="" width={900} height={882} className="h-8 w-auto sm:h-10" preload />
          <span className="font-serif text-base font-medium tracking-[0.26em] text-forest sm:text-lg">DESART SOLIS</span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group relative inline-block py-2 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-forest/65 transition-colors duration-300 hover:text-forest"
            >
              {item.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-gold transition-transform duration-500 ease-soft group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CartIndicator className="hidden sm:flex" />
          <a
            href="#commande"
            className="eyebrow hidden rounded-full bg-forest px-6 py-3 text-cream transition-colors duration-300 hover:bg-forest-soft sm:inline-block"
          >
            Commander
          </a>
          <a
            href="#commande"
            aria-label="Commander"
            className="flex size-10 items-center justify-center rounded-full border border-forest/15 text-forest transition-colors duration-300 hover:border-forest sm:hidden"
          >
            <BagIcon className="size-[1.15rem]" />
          </a>
          <MobileNav items={nav} ctaHref="#commande" ctaLabel="Composer ma commande" />
        </div>
      </div>
    </header>
  );
}

/* ——— Hero ——— */

function Hero() {
  return (
    <section id="hero" className="relative isolate overflow-hidden">
      {/* Moorish arch — the brand's core motif, kept as a whisper */}
      <div
        className="pointer-events-none absolute left-1/2 top-6 hidden h-[24rem] w-[46rem] -translate-x-1/2 rounded-t-full border-x border-t border-forest/10 lg:block"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl px-4 pt-12 text-center sm:px-8 lg:pt-14">
        <p className="eyebrow text-gold-deep">Skin · Hair · Care</p>

        <h1 className="display mt-5 text-[clamp(2.5rem,5.8vw,4rem)] text-forest">
          L’éclat du désert,
          <br />
          <em className="text-foil font-normal">dans chaque geste.</em>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-ink/65">
          Quatre soins essentiels pour le visage, le corps, les cheveux et la barbe, formulés autour de l’huile d’argan
          du Maroc. Peu de produits, bien choisis.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-7">
          <a
            href="#produits"
            className="eyebrow rounded-full bg-forest px-8 py-4 text-center text-cream transition-colors duration-300 hover:bg-forest-soft"
          >
            Découvrir la gamme
          </a>
          <a href="#rituel" className="eyebrow group inline-flex items-center justify-center gap-3 py-4 text-forest">
            Le rituel
            <span className="h-px w-8 bg-gold transition-all duration-500 ease-soft group-hover:w-14" />
          </a>
        </div>
      </div>

      {/* The range, shot as one family — full bleed, standing on the page */}
      <div className="relative mt-9 h-[185px] w-full overflow-hidden sm:h-[250px] lg:mt-10 lg:h-[330px]">
        <picture>
          {/* A 4.3:1 crop cannot serve a phone band, so phones get their own framing */}
          <source media="(max-width: 639px)" srcSet="/brand/hero-range-mobile.webp" />
          <Image
            src="/brand/hero-range.webp"
            alt="Les quatre soins Desart Solis : Face Wash Miel & B5, Gommage Visage, Gel Douche Caramel et Sérum Cheveux & Barbe"
            fill
            sizes="100vw"
            className="object-cover object-bottom"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
      </div>
    </section>
  );
}

function Promises() {
  // Hairlines have to follow the grid: 1 column on mobile, 2 on sm, 4 on lg.
  const rules = [
    "border-b border-forest/10 sm:border-r lg:border-b-0",
    "border-b border-forest/10 lg:border-b-0 lg:border-r",
    "border-b border-forest/10 sm:border-b-0 sm:border-r lg:border-b-0",
    "",
  ];

  return (
    <section id="trust" className="border-y border-forest/10 bg-cream-soft">
      <ul className="mx-auto grid max-w-7xl sm:grid-cols-2 lg:grid-cols-4">
        {promises.map((item, i) => (
          <li key={item.label} className={`flex items-start gap-4 px-6 py-6 sm:px-8 lg:py-6 ${rules[i]}`}>
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold-deep">
              <PromiseIcon index={i} className="size-4" />
            </span>
            <span>
              <span className="block text-[0.8rem] font-medium leading-snug text-forest">{item.label}</span>
              <span className="mt-1 block text-xs text-ink/65">{item.note}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ——— Range ——— */

function Products({ products }: { products: Product[] }) {
  return (
    <section id="produits" className="scroll-mt-24 px-4 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold-deep">La gamme</p>
            <h2 className="display mt-5 text-[clamp(2rem,4vw,3.25rem)] text-forest">
              Peu de soins. <em className="text-foil font-normal">L’essentiel.</em>
            </h2>
          </div>
          <p className="max-w-sm text-[0.95rem] leading-relaxed text-ink/65">
            Une routine courte et efficace, du nettoyage du visage à la brillance des cheveux et de la barbe.
          </p>
        </div>

        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-x-7">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="reveal group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-sand-warm to-sand transition-colors duration-700 ease-soft group-hover:from-sand group-hover:to-sand-deep">
        {product.badge && (
          <span className="bg-foil absolute left-4 top-4 z-10 rounded-full px-3 py-1.5 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-forest">
            {product.badge}
          </span>
        )}
        <span className="eyebrow absolute right-4 top-5 z-10 text-forest/60">{categoryLabels[product.category] ?? product.category}</span>
        <Image
          src={product.image.url}
          alt={product.image.alt}
          fill
          sizes="(min-width: 1024px) 19rem, (min-width: 640px) 45vw, 80vw"
          className="object-contain p-9 drop-shadow-[0_16px_20px_rgba(35,49,41,0.16)] transition-transform duration-700 ease-soft group-hover:-translate-y-1.5 group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-[1.6rem] leading-tight text-forest">{product.name}</h3>
          <span className="shrink-0 text-xs nums text-ink/65">{product.size}</span>
        </div>
        {product.tagline && <p className="mt-1.5 font-serif text-lg italic text-gold-deep">{product.tagline}</p>}
        <p className="mt-4 text-[0.85rem] leading-relaxed text-ink/65">{product.description}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {product.notes.map((n) => (
            <li key={n} className="rounded-full border border-forest/12 px-3 py-1 text-[0.68rem] text-forest/65">
              {n}
            </li>
          ))}
        </ul>
        <AddToOrderButton product={product} />
      </div>
    </article>
  );
}

/* ——— Ritual ——— */

function Ritual() {
  return (
    <section id="rituel" className="grain scroll-mt-24 relative overflow-hidden bg-forest text-cream">
      <div className="absolute -right-32 top-1/2 size-[30rem] -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:py-20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="display text-[clamp(1.75rem,3vw,2.5rem)] text-cream">
            Nettoyer, exfolier, <em className="text-foil-bright font-normal">sublimer.</em>
          </h2>
          <p className="max-w-sm text-[0.9rem] leading-relaxed text-cream/60">
            Quatre gestes simples, à adopter chaque jour ou chaque semaine.
          </p>
        </div>

        <ol className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {ritual.map((r) => (
            <li key={r.step} className="reveal relative pt-5">
              <span className="rule-gold absolute inset-x-0 top-0 h-px" aria-hidden />
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-2xl font-light leading-none text-gold/70">{r.step}</span>
                <span className="eyebrow text-gold/70">{r.area}</span>
              </div>
              <h3 className="mt-3 font-serif text-2xl font-light">{r.title}</h3>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-cream/60">{r.text}</p>
              <p className="mt-3 text-xs text-cream/80">{r.product}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ——— Story ——— */

function Story() {
  return (
    <section id="histoire" className="scroll-mt-24 bg-sand/45 px-4 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="reveal relative mx-auto w-full max-w-md">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
            <Image
              src="/brand/editorial-gommage.webp"
              alt="Tube de Gommage Visage Desart posé près d’une noix de coco"
              fill
              sizes="(min-width: 1024px) 26rem, 90vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="reveal">
          <p className="eyebrow text-gold-deep">Notre histoire</p>
          <h2 className="display mt-5 text-[clamp(2rem,4vw,3.25rem)] text-forest">
            Desart Solis,
            <br />
            <em className="text-foil font-normal">le soleil du désert.</em>
          </h2>
          <div className="mt-6 space-y-4 text-[0.95rem] leading-relaxed text-ink/70">
            <p>
              Né de l’univers du barbier, Desart Solis réunit le soin du visage, des cheveux, de la barbe et du corps
              dans une gamme courte et exigeante.
            </p>
            <p>
              Notre inspiration : la lumière dorée du désert marocain et l’arganier qui y pousse. Notre promesse : des
              textures agréables, des formules honnêtes et un conseil humain, du premier message à la livraison.
            </p>
          </div>

          <ul className="mt-9 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-forest/15 pt-7 sm:grid-cols-4">
            {values.map((v) => (
              <li key={v} className="flex items-center gap-2.5 font-serif text-xl text-forest">
                <Leaf className="size-3.5 shrink-0 text-gold" />
                {v}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ——— Reviews ——— */

function Reviews({ reviews, products, whatsappNumber }: { reviews: Review[]; products: Product[]; whatsappNumber: string }) {
  return (
    <section id="avis" className="scroll-mt-24 px-4 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold-deep">Avis clients</p>
            <h2 className="display mt-5 text-[clamp(2rem,4vw,3.25rem)] text-forest">
              Ils ont adopté <em className="text-foil font-normal">le rituel.</em>
            </h2>
          </div>
          <p className="max-w-sm text-[0.95rem] leading-relaxed text-ink/65">
            Chaque avis est vérifié par notre équipe avant publication.
          </p>
        </div>

        <ReviewsWidget reviews={reviews} products={products} whatsappNumber={whatsappNumber} />
      </div>
    </section>
  );
}

/* ——— Order ——— */

function Order() {
  return (
    <section id="commande" className="scroll-mt-24 bg-cream-soft px-4 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold-deep">Commande</p>
            <h2 className="display mt-5 text-[clamp(2rem,4vw,3.25rem)] text-forest">
              Composez <em className="text-foil font-normal">votre rituel.</em>
            </h2>
          </div>
          <p className="max-w-sm text-[0.95rem] leading-relaxed text-ink/65">
            Choisissez un pack ou vos soins à l’unité, indiquez votre ville : le total s’affiche instantanément.
            Confirmation sur WhatsApp, paiement à la livraison.
          </p>
        </div>

        <OrderBuilder />
      </div>
    </section>
  );
}

/* ——— FAQ ——— */

function Faq({ faqs }: { faqs: FaqItem[] }) {
  if (faqs.length === 0) return null;
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow text-gold-deep">Questions</p>
          <h2 className="display mt-5 text-[clamp(2rem,4vw,3.25rem)] text-forest">Questions fréquentes</h2>
          <p className="mt-6 max-w-xs text-[0.95rem] leading-relaxed text-ink/65">
            Une question sans réponse ? Écrivez-nous sur WhatsApp, on répond vite.
          </p>
        </div>

        <div className="border-t border-forest/15">
          {faqs.map((f) => (
            <details key={f.id} className="group border-b border-forest/15">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-serif text-xl text-forest transition-colors hover:text-gold-deep sm:py-7 sm:text-2xl">
                {f.question}
                <span className="faq-icon relative size-4 shrink-0 transition-transform duration-500 ease-soft">
                  <span className="absolute left-0 top-1/2 h-px w-4 bg-current" />
                  <span className="absolute left-1/2 top-0 h-4 w-px bg-current" />
                </span>
              </summary>
              <p className="max-w-2xl pb-7 text-[0.9rem] leading-relaxed text-ink/65">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ——— Final CTA ——— */

function FinalCta({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <section className="px-4 pb-24 sm:px-8 lg:pb-32">
      <div className="grain relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] bg-forest px-6 py-16 text-center text-cream sm:px-12 lg:py-20">
        <div className="absolute -left-24 -top-24 size-80 rounded-full bg-gold/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-2xl">
          <p className="eyebrow text-gold">Commande simple</p>
          <h2 className="display mt-6 text-[clamp(2rem,4.2vw,3.5rem)] text-cream">
            Un message,
            <br />
            <em className="text-foil-bright font-normal">on s’occupe du reste.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[0.9rem] leading-relaxed text-cream/65">
            Composez votre commande, nous la confirmons avec vous sur WhatsApp. Livraison partout au Maroc, paiement à la
            réception.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
            <a
              href="#commande"
              className="eyebrow bg-foil inline-flex items-center gap-3 rounded-full px-9 py-4 text-forest transition-[filter] duration-300 hover:brightness-110"
            >
              Composer ma commande
            </a>
            <a
              href={whatsappLink(whatsappNumber, "Bonjour Desart Solis, j’ai une question.")}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow inline-flex items-center gap-2 py-2 text-cream/75 transition-colors hover:text-gold"
            >
              <WhatsApp className="size-4" />
              Une question ?
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ——— Footer ——— */

function Footer({ settings }: { settings: Settings }) {
  const contacts = [
    settings.instagram && { label: `@${settings.instagram}`, href: `https://instagram.com/${settings.instagram}` },
    settings.facebook && { label: settings.facebook, href: `https://facebook.com/${settings.facebook}` },
    settings.website && { label: settings.website.replace(/^https?:\/\//, ""), href: settings.website },
    { label: settings.phoneDisplay ?? `+${settings.whatsappNumber}`, href: `https://wa.me/${settings.whatsappNumber}` },
  ].filter((c): c is { label: string; href: string } => !!c);

  return (
    <footer className="border-t border-forest/10 px-4 pb-28 pt-16 sm:px-8 lg:pb-10">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/brand/monogram-transparent.png" alt="" width={900} height={882} className="h-11 w-auto" />
            <span className="font-serif text-lg tracking-[0.26em] text-forest">DESART SOLIS</span>
          </div>
          <p className="mt-5 max-w-xs text-[0.85rem] leading-relaxed text-ink/65">
            Soins visage, corps, cheveux et barbe à l’huile d’argan du Maroc. Formulé, produit et livré au Maroc.
          </p>
        </div>
        <div>
          <p className="eyebrow text-gold-deep">Explorer</p>
          <ul className="mt-5 space-y-3 text-[0.85rem] text-ink/70">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="inline-block py-1 transition-colors hover:text-forest">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-gold-deep">Contact</p>
          <ul className="mt-5 space-y-3 text-[0.85rem] text-ink/70">
            {contacts.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1 transition-colors hover:text-forest"
                >
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-forest/10 pt-8 text-xs text-ink/65 sm:flex-row">
        <p>
          © <CopyrightYear /> Desart Solis. Tous droits réservés.
        </p>
        <p className="eyebrow !text-[0.6rem]">Skin • Hair • Care</p>
      </div>
    </footer>
  );
}

async function CopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

/* ——— Ornaments & icons ——— */

function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 2.5C7.5 6.5 6.2 11 7.4 15.2c.8 2.8 2.6 4.8 4.6 6.3 2-1.5 3.8-3.5 4.6-6.3C17.8 11 16.5 6.5 12 2.5Z" fill="currentColor" />
      <path d="M12 7v14" stroke="var(--color-cream)" strokeWidth="0.8" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

function WhatsApp({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3ZM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
    </svg>
  );
}

function BagIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 7h14l-1 13H6L5 7Z" />
      <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
    </svg>
  );
}

/** Small line icons for the trust bar. */
function PromiseIcon({ index, className }: { index: number; className?: string }) {
  const icons: string[][] = [
    // argan drop
    ["M12 3.2c3 3.8 5.2 6.3 5.2 8.8A5.2 5.2 0 0 1 12 17.2a5.2 5.2 0 0 1-5.2-5.2c0-2.5 2.2-5 5.2-8.8Z"],
    // soft leaf
    ["M6 18C6 10.5 11 6.5 18.5 5.5 17.5 13 13.5 17.5 6 18Z", "M6 18 12.5 11.5"],
    // delivery
    ["M2.8 7.5h10.4v8H2.8z", "M13.2 10.2h3.3l2.9 3.1v2.2h-6.2", "M6.6 18.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z"],
    // Morocco map pin
    [
      "M12 21s6.5-5.4 6.5-10.5A6.5 6.5 0 1 0 5.5 10.5C5.5 15.6 12 21 12 21Z",
      "M12 13a2.2 2.2 0 1 0 0-4.4A2.2 2.2 0 0 0 12 13Z",
    ],
  ];
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {icons[index % icons.length].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
