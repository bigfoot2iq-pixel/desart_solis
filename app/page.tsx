import Image from "next/image";
import { AddToOrderButton, CartProvider, OrderBar } from "./_components/cart";
import { OrderBuilder } from "./_components/order-builder";
import { ReviewsWidget } from "./_components/reviews";
import { ingredients, ritual, whatsappLink } from "./_data";
import { getHomeContent } from "./_lib/catalog";
import type { Faq as FaqItem, Product, Review, Settings } from "./_lib/types";

const nav = [
  { href: "#produits", label: "Produits" },
  { href: "#rituel", label: "Rituel" },
  { href: "#ingredients", label: "Ingrédients" },
  { href: "#avis", label: "Avis" },
  { href: "#histoire", label: "Histoire" },
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
        <Ingredients />
        <Reviews reviews={reviews} products={products} whatsappNumber={settings.whatsappNumber} />
        <Order />
        <Story />
        <Faq faqs={faqs} />
        <FinalCta whatsappNumber={settings.whatsappNumber} />
      </main>
      <Footer settings={settings} />
      <OrderBar />
    </CartProvider>
  );
}

function AnnouncementBar({ text }: { text: string | null }) {
  if (!text) return null;
  const parts = text.split("•").map((t) => t.trim());
  return (
    <div className="bg-forest text-cream/80">
      <p className="eyebrow mx-auto max-w-7xl px-4 py-2.5 text-center !text-[0.6rem] !tracking-[0.14em] sm:!text-[0.6875rem] sm:!tracking-[0.32em]">
        {parts.map((part, i) => (
          <span key={i}>
            {i > 0 && <span className="text-gold"> • </span>}
            {part}
          </span>
        ))}
      </p>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8">
        <a href="#" className="flex items-center gap-3" aria-label="Desart Solis — accueil">
          <Image src="/brand/monogram-transparent.png" alt="" width={900} height={882} className="h-9 w-auto sm:h-11" preload />
          <span className="font-serif text-lg font-medium tracking-[0.28em] text-forest sm:text-xl">DESART SOLIS</span>
        </a>

        <nav className="hidden items-center gap-9 lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="eyebrow text-forest/70 transition-colors duration-300 hover:text-gold-deep"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#commande"
            className="eyebrow hidden rounded-full bg-forest px-6 py-3 text-cream transition-colors duration-300 hover:bg-forest-soft sm:inline-block"
          >
            Commander
          </a>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

function MobileMenu() {
  return (
    <details className="group relative lg:hidden">
      <summary className="flex size-10 cursor-pointer list-none flex-col items-center justify-center gap-1.5" aria-label="Menu">
        <span className="h-px w-6 bg-forest transition-transform duration-300 group-open:translate-y-[3.5px] group-open:rotate-45" />
        <span className="h-px w-6 bg-forest transition-transform duration-300 group-open:-translate-y-[3.5px] group-open:-rotate-45" />
      </summary>
      <nav className="fixed inset-x-0 top-[6.25rem] border-b border-forest/10 bg-cream px-4 pb-8 pt-4 sm:top-[7.25rem]">
        {nav.map((item) => (
          <a key={item.href} href={item.href} className="block border-b border-forest/10 py-4 font-serif text-2xl text-forest">
            {item.label}
          </a>
        ))}
        <a href="#commande" className="eyebrow mt-6 block rounded-full bg-forest py-4 text-center text-cream">
          Commander
        </a>
      </nav>
    </details>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-28 lg:pt-20">
        <div className="max-w-xl">
          <p className="eyebrow text-gold-deep">Skin • Hair • Care</p>
          <h1 className="mt-6 font-serif text-[2.75rem] font-light leading-[1.02] text-forest sm:text-6xl lg:text-7xl">
            L’éclat du désert,
            <br />
            <em className="text-foil font-normal">dans chaque geste.</em>
          </h1>
          <p className="mt-7 max-w-md text-[0.95rem] leading-relaxed text-ink/70">
            Des soins essentiels pour le visage, les cheveux et la barbe, formulés autour de l’huile d’argan du Maroc.
            Peu de produits, bien choisis.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <a
              href="#produits"
              className="eyebrow rounded-full bg-forest px-9 py-4 text-center text-cream transition-colors duration-300 hover:bg-forest-soft"
            >
              Découvrir la gamme
            </a>
            <a href="#rituel" className="eyebrow group inline-flex items-center justify-center gap-3 py-4 text-forest">
              Le rituel
              <span className="h-px w-8 bg-gold transition-all duration-500 ease-soft group-hover:w-14" />
            </a>
          </div>
          <dl className="mt-14 grid max-w-md grid-cols-3 border-t border-forest/15 pt-6">
            {[
              ["3", "soins essentiels"],
              ["Argan", "du Maroc"],
              ["COD", "paiement livraison"],
            ].map(([k, v]) => (
              <div key={v}>
                <dt className="font-serif text-3xl text-forest">{k}</dt>
                <dd className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

// Hero art direction uses fixed brand shots so the composition stays balanced whatever the catalogue holds.
const heroShots = {
  faceWash: { src: "/brand/face-wash.webp", alt: "Face Wash Miel & B5", width: 378, height: 1361 },
  serum: { src: "/brand/serum.webp", alt: "Sérum Cheveux & Barbe", width: 707, height: 1520 },
  gommage: { src: "/brand/gommage.webp", alt: "Gommage Visage", width: 1045, height: 1403 },
};

function HeroVisual() {
  const { faceWash, serum, gommage } = heroShots;
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[30rem]">
      {/* Arch, echoing Moroccan architecture */}
      <div className="absolute inset-x-[6%] bottom-0 top-[4%] rounded-t-full bg-sand" />
      {/* Gold crescent from the monogram */}
      <svg viewBox="0 0 400 400" className="absolute -right-2 top-0 w-[78%]" aria-hidden>
        <defs>
          <linearGradient id="arc" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#b8913f" stopOpacity="0" />
            <stop offset=".35" stopColor="#e9c879" />
            <stop offset=".7" stopColor="#b8913f" />
            <stop offset="1" stopColor="#f0d08a" />
          </linearGradient>
        </defs>
        <path d="M120 22 C 250 -12, 385 80, 380 220 C 377 290, 345 345, 300 385" fill="none" stroke="url(#arc)" strokeWidth="1.6" />
      </svg>

      <div className="absolute inset-x-0 bottom-[6%] flex items-end justify-center">
        <Image
          src={faceWash.src}
          alt={faceWash.alt}
          width={faceWash.width}
          height={faceWash.height}
          className="float relative z-10 -mr-4 w-[17%] drop-shadow-[0_24px_30px_rgba(35,49,41,0.18)]"
          style={{ height: "auto" }}
          preload
        />
        <Image
          src={serum.src}
          alt={serum.alt}
          width={serum.width}
          height={serum.height}
          className="float float-delay relative z-20 w-[26%] drop-shadow-[0_24px_30px_rgba(35,49,41,0.2)]"
          style={{ height: "auto" }}
          preload
        />
        <Image
          src={gommage.src}
          alt={gommage.alt}
          width={gommage.width}
          height={gommage.height}
          className="float relative z-0 -ml-[12%] w-[36%] drop-shadow-[0_24px_30px_rgba(35,49,41,0.15)]"
          style={{ height: "auto" }}
          preload
        />
      </div>
      {/* Ground line */}
      <div className="absolute inset-x-[6%] bottom-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
    </div>
  );
}

function Promises() {
  const items = ["Huile d’argan du Maroc", "Formules douces", "Visage, cheveux & barbe", "Paiement à la livraison"];
  return (
    <section className="border-y border-forest/10 bg-cream">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-8 lg:grid-cols-4">
        {items.map((item, i) => (
          <li
            key={item}
            className={`flex items-center justify-center gap-3 py-6 text-center text-[0.8rem] text-forest/80 ${
              i % 2 === 0 ? "border-r border-forest/10" : ""
            } ${i < 2 ? "border-b border-forest/10 lg:border-b-0" : ""} lg:border-r lg:last:border-r-0`}
          >
            <Leaf className="size-3.5 shrink-0 text-gold" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionHeading({ eyebrow, title, intro, dark }: { eyebrow: string; title: React.ReactNode; intro?: string; dark?: boolean }) {
  return (
    <div className="reveal mx-auto max-w-2xl text-center">
      <p className={`eyebrow ${dark ? "text-gold" : "text-gold-deep"}`}>{eyebrow}</p>
      <h2 className={`mt-5 font-serif text-4xl font-light leading-tight sm:text-5xl ${dark ? "text-cream" : "text-forest"}`}>{title}</h2>
      {intro && <p className={`mx-auto mt-5 max-w-lg text-[0.95rem] leading-relaxed ${dark ? "text-cream/65" : "text-ink/65"}`}>{intro}</p>}
      <Divider className="mt-8" />
    </div>
  );
}

function Products({ products }: { products: Product[] }) {
  return (
    <section id="produits" className="scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32">
      <SectionHeading
        eyebrow="La gamme"
        title={
          <>
            Peu de soins. <em className="text-foil">L’essentiel.</em>
          </>
        }
        intro="Une routine courte et efficace, du nettoyage du visage à la brillance des cheveux et de la barbe."
      />
      <div className="mx-auto mt-16 grid max-w-7xl gap-6 md:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-8">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="reveal group flex flex-col">
      <div className="relative flex aspect-[4/5] items-end justify-center overflow-hidden rounded-t-[999px] bg-sand px-10 pb-10 pt-16 transition-colors duration-700 ease-soft group-hover:bg-sand-deep">
        <span className="eyebrow absolute left-1/2 top-[18%] -translate-x-1/2 text-forest/45">{categoryLabels[product.category] ?? product.category}</span>
        <Image
          src={product.image.url}
          alt={product.image.alt}
          width={product.image.width}
          height={product.image.height}
          sizes="(min-width: 768px) 30vw, 80vw"
          className="h-[72%] w-auto object-contain drop-shadow-[0_20px_24px_rgba(35,49,41,0.18)] transition-transform duration-700 ease-soft group-hover:-translate-y-2 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col border-x border-b border-forest/10 bg-cream px-7 pb-8 pt-7">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-2xl text-forest">{product.name}</h3>
          <span className="shrink-0 text-xs text-ink/50">{product.size}</span>
        </div>
        {product.tagline && <p className="mt-1 font-serif text-lg italic text-gold-deep">{product.tagline}</p>}
        <p className="mt-4 text-sm leading-relaxed text-ink/65">{product.description}</p>
        <ul className="mb-7 mt-5 flex flex-wrap gap-2">
          {product.notes.map((n) => (
            <li key={n} className="rounded-full border border-forest/15 px-3 py-1 text-[0.7rem] text-forest/70">
              {n}
            </li>
          ))}
        </ul>
        <AddToOrderButton product={product} />
      </div>
    </article>
  );
}

function Ritual() {
  return (
    <section id="rituel" className="scroll-mt-24 bg-forest px-4 py-24 text-cream sm:px-8 lg:py-32">
      <SectionHeading
        dark
        eyebrow="Le rituel"
        title={
          <>
            Nettoyer, exfolier, <em className="text-foil">sublimer.</em>
          </>
        }
        intro="Trois gestes simples, à adopter chaque jour ou chaque semaine."
      />
      <ol className="mx-auto mt-16 grid max-w-6xl gap-px overflow-hidden rounded-sm bg-cream/10 md:grid-cols-3 lg:mt-20">
        {ritual.map((r) => (
          <li key={r.step} className="reveal bg-forest px-8 py-12 lg:px-10">
            <span className="text-foil font-serif text-6xl font-light">{r.step}</span>
            <h3 className="mt-6 font-serif text-3xl">{r.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-cream/65">{r.text}</p>
            <p className="eyebrow mt-8 text-gold/80">{r.product}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Ingredients() {
  return (
    <section id="ingredients" className="scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div className="reveal lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow text-gold-deep">Ingrédients</p>
          <h2 className="mt-5 font-serif text-4xl font-light leading-tight text-forest sm:text-5xl">
            Ce que la nature
            <br />
            fait <em className="text-foil">de mieux.</em>
          </h2>
          <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-ink/65">
            Des actifs reconnus, choisis pour leur douceur et leur efficacité. Rien de superflu.
          </p>
          <div className="relative mt-12 hidden aspect-square max-w-xs lg:block">
            <Image src="/brand/monogram-transparent.png" alt="" width={900} height={882} className="opacity-90" />
          </div>
        </div>
        <ul className="divide-y divide-forest/10 border-y border-forest/10">
          {ingredients.map((ing, i) => (
            <li key={ing.name} className="reveal grid grid-cols-[3rem_1fr] gap-4 py-9 sm:grid-cols-[4rem_1fr_auto] sm:gap-6">
              <span className="font-serif text-xl text-gold-deep">0{i + 1}</span>
              <div>
                <h3 className="font-serif text-3xl text-forest">{ing.name}</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/65">{ing.text}</p>
              </div>
              <span className="eyebrow col-start-2 text-forest/45 sm:col-start-auto sm:pt-3">{ing.origin}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section id="histoire" className="scroll-mt-24 bg-sand/60 px-4 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="reveal relative mx-auto w-full max-w-md">
          <Image
            src="/brand/logo-badge-dark.webp"
            alt="Emblème Desart Solis"
            width={1600}
            height={1600}
            sizes="(min-width: 1024px) 28rem, 90vw"
            className="aspect-square w-full rounded-t-full object-cover"
          />
        </div>
        <div className="reveal">
          <p className="eyebrow text-gold-deep">Notre histoire</p>
          <h2 className="mt-5 font-serif text-4xl font-light leading-tight text-forest sm:text-5xl">
            Desart Solis,
            <br />
            <em className="text-foil">le soleil du désert.</em>
          </h2>
          <div className="mt-7 space-y-4 text-[0.95rem] leading-relaxed text-ink/70">
            <p>
              Né de l’univers du barbier, Desart Solis réunit le soin du visage, des cheveux et de la barbe dans une
              gamme courte et exigeante.
            </p>
            <p>
              Notre inspiration : la lumière dorée du désert marocain et l’arganier qui y pousse. Notre promesse : des
              textures agréables, des formules honnêtes et un conseil humain, du premier message à la livraison.
            </p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-forest/15 pt-8">
            {["Douceur", "Authenticité", "Transparence", "Proximité"].map((v) => (
              <li key={v} className="flex items-center gap-3 font-serif text-xl text-forest">
                <Leaf className="size-3.5 text-gold" />
                {v}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Faq({ faqs }: { faqs: FaqItem[] }) {
  if (faqs.length === 0) return null;
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32">
      <SectionHeading eyebrow="Questions" title="Questions fréquentes" />
      <div className="mx-auto mt-14 max-w-3xl border-t border-forest/15">
        {faqs.map((f) => (
          <details key={f.id} className="group border-b border-forest/15">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 font-serif text-xl text-forest transition-colors hover:text-gold-deep sm:text-2xl">
              {f.question}
              <span className="faq-icon relative size-4 shrink-0 transition-transform duration-500 ease-soft">
                <span className="absolute left-0 top-1/2 h-px w-4 bg-current" />
                <span className="absolute left-1/2 top-0 h-4 w-px bg-current" />
              </span>
            </summary>
            <p className="max-w-2xl pb-8 text-sm leading-relaxed text-ink/65">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Reviews({ reviews, products, whatsappNumber }: { reviews: Review[]; products: Product[]; whatsappNumber: string }) {
  return (
    <section id="avis" className="scroll-mt-24 bg-sand/40 px-4 py-24 sm:px-8 lg:py-32">
      <SectionHeading
        eyebrow="Avis clients"
        title={
          <>
            Ils ont adopté <em className="text-foil">le rituel.</em>
          </>
        }
      />
      <ReviewsWidget reviews={reviews} products={products} whatsappNumber={whatsappNumber} />
    </section>
  );
}

function Order() {
  return (
    <section id="commande" className="scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32">
      <SectionHeading
        eyebrow="Commande"
        title={
          <>
            Composez <em className="text-foil">votre rituel.</em>
          </>
        }
        intro="Choisissez un pack ou vos soins à l’unité, indiquez votre ville : le total s’affiche instantanément. Confirmation sur WhatsApp, paiement à la livraison."
      />
      <OrderBuilder />
    </section>
  );
}

function FinalCta({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <section className="px-4 pb-24 sm:px-8 lg:pb-32">
      <div className="reveal relative mx-auto max-w-7xl overflow-hidden rounded-t-[12rem] bg-forest px-6 py-20 text-center sm:rounded-t-[20rem] sm:py-28">
        <p className="eyebrow text-gold">Commande simple</p>
        <h2 className="mx-auto mt-6 max-w-2xl font-serif text-4xl font-light leading-tight text-cream sm:text-6xl">
          Un message,
          <br />
          <em className="text-foil">on s’occupe du reste.</em>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-cream/65">
          Composez votre commande, nous la confirmons avec vous sur WhatsApp. Livraison partout au Maroc, paiement à la réception.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
          <a
            href="#commande"
            className="eyebrow bg-foil inline-flex items-center gap-3 rounded-full px-10 py-4 text-forest transition-[filter] duration-300 hover:brightness-110"
          >
            Composer ma commande
          </a>
          <a href={whatsappLink(whatsappNumber, "Bonjour Desart Solis, j’ai une question.")} target="_blank" rel="noopener noreferrer" className="eyebrow inline-flex items-center gap-2 text-cream/75 transition-colors hover:text-gold">
            <WhatsApp className="size-4" />
            Une question ?
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer({ settings }: { settings: Settings }) {
  const contacts = [
    settings.instagram && { label: `@${settings.instagram}`, href: `https://instagram.com/${settings.instagram}` },
    settings.facebook && { label: settings.facebook, href: `https://facebook.com/${settings.facebook}` },
    settings.website && { label: settings.website.replace(/^https?:\/\//, ""), href: settings.website },
    { label: settings.phoneDisplay ?? `+${settings.whatsappNumber}`, href: `https://wa.me/${settings.whatsappNumber}` },
  ].filter((c): c is { label: string; href: string } => !!c);
  return (
    <footer className="border-t border-forest/10 px-4 pb-28 pt-16 sm:px-8 lg:pb-10">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Image src="/brand/logo-horizontal.webp" alt="Desart Solis — Skincare & Haircare" width={1600} height={1600} className="-my-[18%] -ml-[6%] w-64" />
        </div>
        <div>
          <p className="eyebrow text-gold-deep">Explorer</p>
          <ul className="mt-5 space-y-3 text-sm text-ink/70">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="transition-colors hover:text-forest">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-gold-deep">Contact</p>
          <ul className="mt-5 space-y-3 text-sm text-ink/70">
            {contacts.map((c) => (
              <li key={c.label}>
                <a href={c.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-forest">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-forest/10 pt-8 text-xs text-ink/45 sm:flex-row">
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

function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold" />
      <Leaf className="size-4 text-gold" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold" />
    </div>
  );
}

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
