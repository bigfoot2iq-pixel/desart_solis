import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grain relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-cream px-6 py-20 text-center">
      <div className="absolute -right-24 -top-24 size-80 rounded-full bg-gold/10 blur-3xl" aria-hidden />
      <div className="relative">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-gold/50 text-gold-deep">
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
            <path d="M12 2.5C7.5 6.5 6.2 11 7.4 15.2c.8 2.8 2.6 4.8 4.6 6.3 2-1.5 3.8-3.5 4.6-6.3C17.8 11 16.5 6.5 12 2.5Z" />
            <path d="M12 7v14" stroke="var(--color-cream)" strokeWidth="0.8" strokeLinecap="round" opacity=".7" />
          </svg>
        </span>
        <p className="eyebrow mt-8 text-gold-deep">Erreur 404</p>
        <h1 className="display mt-4 text-[clamp(2rem,6vw,3.25rem)] text-forest">
          Cette page s’est <em className="text-foil font-normal">égarée.</em>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[0.95rem] leading-relaxed text-ink/65">
          La page que vous cherchez n’existe plus ou a été déplacée. La gamme, elle, est toujours là.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Link href="/" className="eyebrow rounded-full bg-forest px-8 py-4 text-cream transition-colors duration-300 hover:bg-forest-soft">
            Retour à l’accueil
          </Link>
          <Link href="/#produits" className="eyebrow inline-flex items-center gap-3 py-3 text-forest">
            Voir la gamme
            <span className="h-px w-8 bg-gold" />
          </Link>
        </div>
      </div>
    </main>
  );
}
