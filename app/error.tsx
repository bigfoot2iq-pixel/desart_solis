"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Catches a crash in the page and shows a way out.
 *
 * Without this, a render error leaves the visitor on a blank page with no
 * navigation at all — the header, the range and the checkout are all gone.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app] render error", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-cream px-6 py-20 text-center">
      <p className="eyebrow text-gold-deep">Un souci est survenu</p>
      <h1 className="display mt-4 text-[clamp(1.9rem,5.5vw,3rem)] text-forest">
        La page n’a pas pu <em className="text-foil font-normal">se charger.</em>
      </h1>
      <p className="mx-auto mt-5 max-w-md text-[0.95rem] leading-relaxed text-ink/65">
        C’est temporaire. Réessayez — si le problème persiste, écrivez-nous sur WhatsApp, on s’en occupe.
      </p>
      <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
        <button
          type="button"
          onClick={reset}
          className="eyebrow rounded-full bg-forest px-8 py-4 text-cream transition-colors duration-300 hover:bg-forest-soft"
        >
          Réessayer
        </button>
        <Link href="/" className="eyebrow inline-flex items-center gap-3 py-3 text-forest">
          Retour à l’accueil
          <span className="h-px w-8 bg-gold" />
        </Link>
      </div>
      {error.digest && <p className="mt-8 text-[0.65rem] text-ink/40">Référence : {error.digest}</p>}
    </main>
  );
}
