import Image from "next/image";
import { AddToOrderButton, CartProvider, OrderBar } from "../_components/cart";
import { CartIndicator } from "../_components/cart-indicator";
import { MobileNav, type NavItem } from "../_components/mobile-nav";
import { OrderBuilder } from "../_components/order-builder";
import { SnapRail } from "../_components/snap-rail";
import { ReviewsWidget } from "../_components/reviews";
import { formatDh, promises, ritual, values, whatsappLink } from "../_data";
import { getHomeContent } from "../_lib/catalog";
import type { Faq as FaqItem, Product, Review, Settings } from "../_lib/types";

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
      <p className="eyebrow mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2.5 text-center !text-[0.6875rem] !tracking-[0.18em] sm:!tracking-[0.3em]">
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

/* How tall each product stands relative to the tallest one. The product
   photos are shot at different scales, so the pixel height alone would make
   the 400 ml pump bottle look like the shortest product on the shelf. These
   shares reproduce the real pack sizes and are shared by the hero strip and
   the range grid, so a product never changes size between the two. */
const productShare: Record<string, number> = {
  "face-wash": 0.88,
  gommage: 0.72,
  "gel-douche": 0.94,
  serum: 0.78,
};

/* The range is composed from the four real cutouts instead of one baked band.
   A single raster can only carry one aspect ratio, so every viewport that did
   not match it cropped the range: wide screens sliced the tops off the tall
   bottles, narrow ones cut the outer products away entirely. Composing the
   cutouts here keeps every product whole at any width - and because they are
   transparent they stand straight on the page cream, so there is no image
   edge left to seam against the hero.

   `w`/`h` are the cutout's own pixels; the height comes from `productShare`. */
const range = [
  { src: "/brand/range/face-wash.webp", w: 376, h: 1360, slug: "face-wash", name: "Face Wash Miel & B5" },
  { src: "/brand/range/gommage.webp", w: 632, h: 1315, slug: "gommage", name: "Gommage Visage" },
  { src: "/brand/range/gel-douche.webp", w: 440, h: 1099, slug: "gel-douche", name: "Gel Douche Caramel" },
  { src: "/brand/range/serum.webp", w: 480, h: 1491, slug: "serum", name: "Sérum Cheveux & Barbe" },
];

function Hero() {
  return (
    <section id="hero" className="relative isolate overflow-hidden">
      {/* Moorish arch — the brand's core motif, kept as a whisper */}
      <div
        className="arch-fade pointer-events-none absolute left-1/2 top-4 hidden h-[20rem] w-[42rem] -translate-x-1/2 rounded-t-full border-x border-t border-forest/10 lg:block"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl px-4 pt-8 text-center sm:px-8 lg:pt-10">
        <p className="eyebrow text-gold-deep">Skin · Hair · Care</p>

        <h1 className="display mt-3.5 text-[clamp(2.25rem,4.6vw,3.25rem)] text-forest">
          L’éclat du désert,
          <br />
          <em className="text-foil font-normal">dans chaque geste.</em>
        </h1>

        <p className="mx-auto mt-3.5 max-w-xl text-[0.9rem] leading-relaxed text-ink/65 sm:text-[0.95rem]">
          Quatre soins essentiels pour le visage, le corps, les cheveux et la barbe, formulés autour de l’huile d’argan
          du Maroc. Peu de produits, bien choisis.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-7">
          <a
            href="#produits"
            className="eyebrow rounded-full bg-forest px-8 py-3.5 text-center text-cream transition-colors duration-300 hover:bg-forest-soft"
          >
            Découvrir la gamme
          </a>
          <a href="#rituel" className="eyebrow group inline-flex items-center justify-center gap-3 py-3.5 text-forest">
            Le rituel
            <span className="h-px w-8 bg-gold transition-all duration-500 ease-soft group-hover:w-14" />
          </a>
        </div>
      </div>

      <HeroRange />
    </section>
  );
}

/* The four products standing on one line. Each is sized from the strip height
   alone (cqh), so nothing can be cropped and the baseline holds at every
   breakpoint. The halo behind them is fully contained inside the strip and
   fades to zero alpha well before any edge, so it never leaves a seam. */
function HeroRange() {
  return (
    <div className="relative mt-5 pb-6 lg:mt-6">
      <div
        className="hero-strip relative flex h-[200px] items-end justify-center gap-x-3.5 pb-2 sm:h-[220px] sm:gap-x-6 lg:h-[clamp(240px,19vw,300px)] lg:gap-x-[clamp(24px,2.6vw,44px)]"
        role="img"
        aria-label={`Les quatre soins Desart Solis : ${range.map((p) => p.name).join(", ")}.`}
      >
        <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />

        {range.map((p, i) => (
          <div
            key={p.src}
            className="relative shrink-0"
            style={{ height: `${(productShare[p.slug] ?? 1) * 100}%`, width: `${(((productShare[p.slug] ?? 1) * p.w) / p.h) * 100}cqh` }}
          >
            {/* contact shadow so the product sits on the floor instead of floating */}
            <span
              className="product-shadow absolute bottom-0 left-1/2 h-[12%] w-[260%] -translate-x-1/2 translate-y-[45%]"
              aria-hidden
            />
            <Image
              src={p.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 108px, (min-width: 640px) 82px, 76px"
              className="object-contain"
              loading="eager"
              fetchPriority={i === 0 ? "high" : "auto"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* The trust bar used to be a single column of four rows below sm, which made
   it the tallest block on the page — four times the height of the promise
   itself. It is a 2×2 grid on small screens instead: every promise stays
   visible without a swipe, and the bar reads as the thin band of reassurance
   it is meant to be. The icons and the notes shrink to match the tighter
   cell, and the row of four returns at lg where each column has room to
   breathe. */
function Promises() {
  // Hairlines follow the grid: a 2×2 cross below lg, a single row of four
  // above it.
  const rules = [
    "border-b border-r border-forest/10 lg:border-b-0",
    "border-b border-forest/10 lg:border-b-0 lg:border-r",
    "border-r border-forest/10 lg:border-b-0",
    "",
  ];

  return (
    <section id="trust" className="border-y border-forest/10 bg-cream-soft">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {promises.map((item, i) => (
          <li
            key={item.label}
            className={`flex items-start gap-2.5 px-4 py-4 sm:gap-4 sm:px-6 sm:py-6 ${rules[i]}`}
          >
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold-deep sm:size-9">
              <PromiseIcon index={i} className="size-3.5 sm:size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.78rem] font-medium leading-snug text-forest sm:text-[0.8rem]">{item.label}</span>
              <span className="mt-0.5 block text-[0.6875rem] leading-snug text-ink/65 sm:mt-1 sm:text-xs">{item.note}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ——— Range ——— */

/* The range reads as a catalogue, not a shop: one product per column, the
   bottle standing on a shared baseline, and only the information needed to
   choose it — name, size, price and the add control. The longer copy lives
   in the order builder, where a customer is actually shopping.

   Below lg the four columns become a snap rail: the cards stay small and
   the section keeps its height instead of stacking four tall products. */
function Products({ products }: { products: Product[] }) {
  return (
    <section id="produits" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold-deep">La gamme</p>
            <h2 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)] text-forest">
              Peu de soins. <em className="text-foil font-normal">L’essentiel.</em>
            </h2>
          </div>
          <p className="max-w-sm text-[0.9rem] leading-relaxed text-ink/70">
            Une routine courte et efficace, du nettoyage du visage à la brillance des cheveux et de la barbe.
          </p>
        </div>

        <SnapRail
          className="mt-10 lg:mt-16"
          gridClassName="lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-x-7 lg:gap-y-12 lg:overflow-visible lg:px-0 lg:pb-0 lg:snap-none lg:scroll-pl-0 lg:select-auto"
          itemLabel="produit"
        >
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </SnapRail>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const category = categoryLabels[product.category] ?? product.category;
  // Same scale as the hero strip, so a product never changes size between sections.
  const share = productShare[product.slug] ?? 1;

  return (
    <article className="group flex w-[68vw] max-w-[16rem] shrink-0 snap-start flex-col sm:w-[42vw] lg:w-auto lg:max-w-none">
      {/* The bottle stands on the baseline of the row, whatever its proportions. */}
      <div className="relative flex h-[clamp(210px,64vw,260px)] items-end justify-center rounded-[1.25rem] border border-forest/12 bg-sand/35 p-4 lg:h-[clamp(215px,18vw,265px)]">
        {product.badge && (
          <span className="eyebrow absolute left-4 top-3 text-gold-deep">{product.badge}</span>
        )}
        <Image
          src={product.image.url}
          alt={product.image.alt}
          width={product.image.width}
          height={product.image.height}
          sizes="(min-width: 1024px) 18rem, (min-width: 640px) 40vw, 70vw"
          style={{ height: `${share * 100}%` }}
          className="mx-auto w-auto max-w-full object-contain object-bottom drop-shadow-[0_10px_12px_rgba(35,49,41,0.16)] transition-transform duration-700 ease-soft group-hover:-translate-y-1.5"
        />
      </div>

      <div className="mt-5 flex flex-1 flex-col lg:mt-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-[1.25rem] leading-tight text-forest sm:min-h-[2.5em] lg:text-[1.35rem]">
            {product.name}
          </h3>
          <span className="shrink-0 text-[0.6875rem] uppercase tracking-[0.16em] text-ink/65">
            {product.size}
            {category && <span className="hidden sm:inline"> · {category}</span>}
          </span>
        </div>

        {product.tagline && (
          <p className="mb-5 mt-2 font-serif text-[0.95rem] italic text-gold-deep">{product.tagline}</p>
        )}

        {/* `sm:line-clamp-2` also carries the display, so the paragraph can’t be
            shown as a plain block at the same breakpoint. */}
        <p className="mb-5 mt-3 hidden text-[0.8rem] leading-relaxed text-ink/70 sm:line-clamp-2">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-forest/10 pt-4">
          <span className="font-serif text-[1.3rem] nums text-forest">{formatDh(product.price)}</span>
          <AddToOrderButton product={product} />
        </div>
      </div>
    </article>
  );
}

/* ——— Ritual ——— */

/* The four steps are gestures, not paragraphs. Stacked in one column they
   were taller than the screen, so on a phone they become a snap rail: one
   step at a time, swiped sideways, with the same position indicator the
   range uses. From lg up the rail opens into the four columns of the
   desktop layout. */
function Ritual() {
  return (
    <section id="rituel" className="grain scroll-mt-24 relative overflow-hidden bg-forest text-cream">
      <div className="absolute -right-32 top-1/2 size-[30rem] -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-16 lg:py-20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-5">
          <h2 className="display text-[clamp(1.75rem,3vw,2.5rem)] text-cream">
            Nettoyer, exfolier, <em className="text-foil-bright font-normal">sublimer.</em>
          </h2>
          <p className="max-w-sm text-[0.9rem] leading-relaxed text-cream/60">
            Quatre gestes simples, à adopter chaque jour ou chaque semaine.
          </p>
        </div>

        <SnapRail
          as="ol"
          className="mt-8 lg:mt-10"
          gridClassName="lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-x-8 lg:gap-y-8 lg:overflow-visible lg:px-0 lg:pb-0 lg:snap-none lg:scroll-pl-0 lg:select-auto"
          itemLabel="étape"
        >
          {ritual.map((r) => (
            <li
              key={r.step}
              className="reveal relative w-[72vw] max-w-[17rem] shrink-0 snap-start pt-5 lg:w-auto lg:max-w-none"
            >
              <span className="rule-gold absolute inset-x-0 top-0 h-px" aria-hidden />
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-2xl font-light leading-none text-gold/80">{r.step}</span>
                <span className="eyebrow text-gold/80">{r.area}</span>
              </div>
              <h3 className="mt-3 font-serif text-2xl font-light">{r.title}</h3>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-cream/60">{r.text}</p>
              <p className="mt-3 text-xs text-cream/80">{r.product}</p>
            </li>
          ))}
        </SnapRail>
      </div>
    </section>
  );
}

/* ——— Story ——— */

/* The desktop composition is a portrait frame beside the text. On a phone
   that portrait becomes the tallest thing on the page, so it turns into a
   full-bleed band and the copy takes the whole width under it. The band
   stays until there is room for the portrait and the text side by side. */
function Story() {
  return (
    <section id="histoire" className="scroll-mt-24 bg-sand/45 px-4 py-14 sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-8 sm:gap-10 md:grid-cols-2 lg:gap-20">
        <div className="reveal relative -mx-4 sm:mx-auto sm:w-full sm:max-w-md md:max-w-none">
          <div className="relative aspect-[4/3] overflow-hidden md:aspect-[4/5] md:rounded-[1.5rem]">
            <Image
              src="/brand/editorial-gommage.webp"
              alt="Tube de Gommage Visage Desart posé près d’une noix de coco"
              fill
              sizes="(min-width: 1024px) 26rem, (min-width: 768px) 40vw, 100vw"
              className="object-cover object-[50%_62%] md:object-center"
            />
          </div>
        </div>

        <div className="reveal">
          <p className="eyebrow text-gold-deep">Notre histoire</p>
          <h2 className="display mt-4 text-[1.8rem] text-forest sm:mt-5 sm:text-[clamp(2rem,4vw,3.25rem)]">
            Desart Solis,
            <br />
            <em className="text-foil font-normal">le soleil du désert.</em>
          </h2>
          <div className="mt-5 space-y-3 text-[0.9rem] leading-relaxed text-ink/70 sm:mt-6 sm:space-y-4 sm:text-[0.95rem]">
            <p>
              Né de l’univers du barbier, Desart Solis réunit le soin du visage, des cheveux, de la barbe et du corps
              dans une gamme courte et exigeante.
            </p>
            <p>
              Notre inspiration : la lumière dorée du désert marocain et l’arganier qui y pousse. Notre promesse : des
              textures agréables, des formules honnêtes et un conseil humain, du premier message à la livraison.
            </p>
          </div>

          <ul className="mt-7 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-forest/15 pt-5 sm:mt-9 sm:gap-x-6 sm:gap-y-3 sm:pt-7 lg:grid-cols-4">
            {values.map((v) => (
              <li key={v} className="flex items-center gap-2 font-serif text-lg text-forest sm:gap-2.5 sm:text-xl">
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
        {/* On a phone the intro is a title and one line of reassurance — the
            step rail below carries the detail, so the spacing stays tight. */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold-deep">Commande</p>
            <h2 className="display mt-4 text-[clamp(2rem,4vw,3.25rem)] text-forest lg:mt-5">
              Composez <em className="text-foil font-normal">votre rituel.</em>
            </h2>
          </div>
          <p className="max-w-sm text-[0.9rem] leading-relaxed text-ink/65 lg:text-[0.95rem]">
            Choisissez un pack ou vos soins à l’unité, indiquez votre ville. Confirmation sur WhatsApp, paiement à la
            livraison.
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
        <p className="eyebrow !text-[0.6875rem]">Skin • Hair • Care</p>
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
