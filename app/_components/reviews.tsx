"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { whatsappLink } from "../_data";
import type { Product, Review, ReviewMedia } from "../_lib/types";

const PAGE_SIZE = 6;
const VOTES_KEY = "desart-review-votes-v2";
const MAX_FILES = 4;
/** How many customer photos & videos the teaser strip shows at most. */
const MAX_MEDIA_STRIP = 12;
/** Hosting platforms cap request bodies around 4.5 MB */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
/** The formats the review endpoint accepts — the picker and the check must agree. */
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ACCEPTED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

type Sort = "recent" | "highest" | "lowest" | "media" | "helpful";
const sortLabels: Record<Sort, string> = {
  recent: "Plus récents",
  highest: "Note la plus haute",
  lowest: "Note la plus basse",
  media: "Avec photos & vidéos",
  helpful: "Plus utiles",
};

/** Stored per review: the vote and the server count when it was cast, so a refreshed count isn't double-counted. */
type Vote = { dir: "up" | "down" | null; base: number; sent: boolean };

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Flattened list of every media item, so the lightbox can step across reviews */
type MediaRef = { review: Review; media: ReviewMedia; index: number };

/**
 * The height of the viewport that is actually visible.
 *
 * `dvh` does not shrink for the on-screen keyboard on iOS, so a dialog sized
 * with it keeps its full height while the keyboard covers the bottom half —
 * which is where the submit button lives. The visual viewport does report the
 * real height, so the dialog is sized against that instead.
 */
function useVisibleHeight() {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => setHeight(vv.height);
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, []);

  return height;
}

export function ReviewsWidget({ reviews, products, whatsappNumber }: { reviews: Review[]; products: Product[]; whatsappNumber: string }) {
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [productFilter, setProductFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("recent");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [writeOpen, setWriteOpen] = useState(false);
  const [votes, setVotes] = useState<Record<string, Vote>>({});
  /** The votes are also read outside React: a vote callback can still be
      running when the next one starts, and it must not work on a stale copy. */
  const votesRef = useRef<Record<string, Vote>>({});

  const productBySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const reviewedProducts = useMemo(() => products.filter((p) => reviews.some((r) => r.product === p.slug)), [products, reviews]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VOTES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        // The stored value can be stale or hand-edited: keep only what still
        // looks like a vote, so one bad entry cannot poison the rest.
        const clean: Record<string, Vote> = {};
        if (parsed && typeof parsed === "object") {
          for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
            if (!value || typeof value !== "object") continue;
            const v = value as Partial<Vote>;
            if (typeof v.base !== "number") continue;
            clean[id] = {
              dir: v.dir === "up" || v.dir === "down" ? v.dir : null,
              base: v.base,
              sent: v.sent === true,
            };
          }
        }
        votesRef.current = clean;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring persisted votes after hydration
        setVotes(clean);
      }
    } catch {}
  }, []);

  const persistVotes = (next: Record<string, Vote>) => {
    try {
      localStorage.setItem(VOTES_KEY, JSON.stringify(next));
    } catch {}
  };

  const vote = useCallback((review: Review, dir: "up" | "down") => {
    const current = votesRef.current[review.id];
    const nextDir = current?.dir === dir ? null : dir;
    /* "Utile" is the only vote the server counts, and only once per browser.
       It is counted optimistically and taken back if the server refuses it, so
       the number on the card is never a lie the visitor cannot undo. */
    const shouldCount = dir === "up" && nextDir === "up" && !current?.sent;

    const next: Record<string, Vote> = {
      ...votesRef.current,
      [review.id]: {
        dir: nextDir,
        base: current?.base ?? review.helpful,
        sent: shouldCount ? true : (current?.sent ?? false),
      },
    };
    votesRef.current = next;
    setVotes(next);
    persistVotes(next);

    if (!shouldCount) return;

    fetch("/api/reviews/helpful", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: review.id }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`helpful ${res.status}`);
      })
      .catch(() => {
        // The vote never landed: take it back so the count tells the truth.
        const currentVotes = votesRef.current;
        if (!currentVotes[review.id]?.sent) return;
        const rolled: Record<string, Vote> = {
          ...currentVotes,
          [review.id]: { dir: null, base: review.helpful, sent: false },
        };
        votesRef.current = rolled;
        setVotes(rolled);
        persistVotes(rolled);
      });
  }, []);

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    const dist = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));
    const recommend = total ? Math.round((reviews.filter((r) => r.rating >= 4).length / total) * 100) : 0;
    return { total, avg, dist, recommend };
  }, [reviews]);

  const allMedia = useMemo<MediaRef[]>(() => reviews.flatMap((review) => review.media.map((media, index) => ({ review, media, index }))), [reviews]);

  const filtered = useMemo(() => {
    const list = reviews.filter((r) => (ratingFilter ? r.rating === ratingFilter : true) && (productFilter ? r.product === productFilter : true));
    const sorted = [...list];
    switch (sort) {
      case "recent":
        sorted.sort((a, b) => b.date.localeCompare(a.date));
        break;
      case "highest":
        sorted.sort((a, b) => b.rating - a.rating || b.date.localeCompare(a.date));
        break;
      case "lowest":
        sorted.sort((a, b) => a.rating - b.rating || b.date.localeCompare(a.date));
        break;
      case "media":
        sorted.sort((a, b) => b.media.length - a.media.length || b.date.localeCompare(a.date));
        break;
      case "helpful":
        sorted.sort((a, b) => b.helpful - a.helpful || b.date.localeCompare(a.date));
        break;
    }
    return sorted;
  }, [reviews, ratingFilter, productFilter, sort]);

  const openMedia = (review: Review, index: number) => {
    const i = allMedia.findIndex((m) => m.review.id === review.id && m.index === index);
    if (i >= 0) setLightbox(i);
  };

  const resetPaging = () => setVisible(PAGE_SIZE);

  return (
    <div className="mt-14 lg:mt-16">
      {/* Summary header */}
      <div className="grain relative grid gap-10 overflow-hidden rounded-[1.75rem] bg-forest p-7 text-cream sm:p-10 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-14">
        <div className="text-center lg:border-r lg:border-cream/15 lg:pr-14 lg:text-left">
          {stats.total > 0 ? (
            <>
              <p className="font-serif text-7xl leading-none font-light text-cream">{stats.avg.toFixed(1)}</p>
              <Stars rating={stats.avg} className="mt-3 justify-center lg:justify-start" size="size-5" />
              <p className="mt-2 text-sm text-cream/60">
                Basé sur{" "}
                <strong className="font-medium text-cream">
                  {stats.total} avis
                </strong>
              </p>
              <p className="mt-1 text-xs text-cream/60">{stats.recommend} % recommandent ces produits</p>
            </>
          ) : (
            <>
              <Stars rating={0} className="justify-center lg:justify-start" size="size-6" />
              <p className="mt-3 font-serif text-2xl text-cream">Aucun avis pour le moment</p>
              <p className="mt-1 text-sm text-cream/60">Soyez le premier à partager votre expérience.</p>
            </>
          )}
        </div>

        {stats.total > 0 ? (
          <ul className="space-y-2">
            {stats.dist.map(({ star, count }) => {
              const active = ratingFilter === star;
              const pct = stats.total ? (count / stats.total) * 100 : 0;
              return (
                <li key={star}>
                  <button
                    type="button"
                    disabled={count === 0}
                    onClick={() => {
                      setRatingFilter(active ? null : star);
                      resetPaging();
                    }}
                    aria-pressed={active}
                    aria-label={`Filtrer les avis ${star} étoiles (${count})`}
                    className={`group flex w-full items-center gap-3 rounded-md px-2 py-1 text-sm transition-colors disabled:cursor-default ${
                      active ? "bg-cream/10" : "enabled:hover:bg-cream/5"
                    }`}
                  >
                    <Stars rating={star} size="size-3.5" />
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream/15">
                      <span className="bg-foil block h-full rounded-full transition-[width] duration-700 ease-soft" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-6 text-right nums text-cream/65">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          // No reviews yet — show the range that is waiting to be rated.
          // A scroll rail, not a row: four products at 64px plus the gaps are
          // wider than a 320px screen, and the overflow would push the whole
          // page sideways.
          <ul className="-mx-2 flex min-w-0 items-end gap-3 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:justify-start sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0">
            {products.map((p) => (
              <li key={p.slug} className="flex w-16 shrink-0 flex-col items-center gap-3 sm:w-20">
                <span className="flex h-24 w-full items-end justify-center rounded-xl bg-cream/5">
                  <Image src={p.image.url} alt="" width={p.image.width} height={p.image.height} sizes="64px" className="h-20 w-auto" />
                </span>
                <span className="text-center text-[0.6875rem] leading-tight text-cream/60">{p.name}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col items-center gap-3 lg:items-end">
          <button
            type="button"
            onClick={() => setWriteOpen(true)}
            className="eyebrow bg-foil w-full rounded-full px-8 py-4 text-forest transition-[filter] duration-300 hover:brightness-110 lg:w-auto"
          >
            Écrire un avis
          </button>
          <p className="max-w-[14rem] text-center text-xs text-cream/60 lg:text-right">Partagez votre expérience avec la communauté Desart Solis.</p>
        </div>
      </div>

      {/* Customer media strip */}
      {allMedia.length > 0 && (
        <div className="mt-10">
          <p className="eyebrow text-forest/70">Photos & vidéos clients</p>
          {/* Capped: the strip is a teaser. Rendering every media item of every
              review would put hundreds of thumbnails and videos in the page at
              once, on a phone, over mobile data. */}
          <div className="-mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:px-0">
            {allMedia.slice(0, MAX_MEDIA_STRIP).map((m, i) => (
              <button
                key={`${m.review.id}-${m.media.key}`}
                type="button"
                onClick={() => setLightbox(i)}
                className="group relative size-28 shrink-0 snap-start overflow-hidden rounded-xl bg-sand sm:size-32"
                aria-label={`Voir le média de ${m.review.author}`}
              >
                <MediaThumb media={m.media} sizes="128px" />
              </button>
            ))}
          </div>
          {allMedia.length > MAX_MEDIA_STRIP && (
            <p className="mt-2 text-xs text-ink/65">
              {allMedia.length} médias au total — tous sont consultables depuis chaque avis.
            </p>
          )}
        </div>
      )}

      {stats.total > 0 && (
        <>
          {/* Toolbar */}
          <div className="mt-10 flex flex-col gap-4 border-b border-forest/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              <Chip
                active={productFilter === null}
                onClick={() => {
                  setProductFilter(null);
                  resetPaging();
                }}
              >
                Tous les produits
              </Chip>
              {reviewedProducts.map((p) => (
                <Chip
                  key={p.slug}
                  active={productFilter === p.slug}
                  onClick={() => {
                    setProductFilter(productFilter === p.slug ? null : p.slug);
                    resetPaging();
                  }}
                >
                  {p.name}
                </Chip>
              ))}
            </div>
            <label className="flex shrink-0 items-center gap-2 text-xs text-ink/65">
              Trier
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as Sort);
                  resetPaging();
                }}
                className="rounded-full border border-forest/15 bg-cream px-4 py-2 text-sm text-forest outline-none focus:border-forest sm:text-xs"
              >
                {Object.entries(sortLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex min-h-6 items-center gap-3 text-xs text-ink/65">
            <span aria-live="polite">
              {filtered.length} avis{ratingFilter ? ` · ${ratingFilter} étoile${ratingFilter > 1 ? "s" : ""}` : ""}
            </span>
            {(ratingFilter || productFilter) && (
              <button
                type="button"
                onClick={() => {
                  setRatingFilter(null);
                  setProductFilter(null);
                  resetPaging();
                }}
                className="-my-2 px-2 py-2 text-forest underline underline-offset-4"
              >
                Effacer les filtres
              </button>
            )}
          </div>

          {/* Reviews masonry */}
          <div className="mt-6 gap-5 sm:columns-2 lg:columns-3">
            {filtered.slice(0, visible).map((r) => (
              <ReviewCard key={r.id} review={r} product={productBySlug.get(r.product)} vote={votes[r.id]} onVote={vote} onOpenMedia={openMedia} />
            ))}
          </div>
          {filtered.length === 0 && <p className="py-16 text-center text-sm text-ink/65">Aucun avis ne correspond à ces filtres.</p>}

          {visible < filtered.length && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="eyebrow rounded-full border border-forest px-8 py-3.5 text-forest transition-colors hover:bg-forest hover:text-cream"
              >
                Voir plus d’avis ({filtered.length - visible})
              </button>
            </div>
          )}
        </>
      )}

      <Lightbox items={allMedia} index={lightbox} onChange={setLightbox} productBySlug={productBySlug} />
      <WriteReviewDialog open={writeOpen} onClose={() => setWriteOpen(false)} products={products} whatsappNumber={whatsappNumber} />
    </div>
  );
}

function ReviewCard({
  review: r,
  product,
  vote,
  onVote,
  onOpenMedia,
}: {
  review: Review;
  product?: Product;
  vote?: Vote;
  onVote: (review: Review, dir: "up" | "down") => void;
  onOpenMedia: (r: Review, index: number) => void;
}) {
  // Add our own counted vote until the server count catches up with it
  const helpful = r.helpful + (vote?.sent && r.helpful === vote.base ? 1 : 0);
  return (
    <article className="mb-5 break-inside-avoid rounded-2xl border border-forest/10 bg-cream-soft p-6 shadow-[0_1px_2px_rgba(35,49,41,0.04)]">
      <header className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sand font-serif text-base text-forest">{initials(r.author)}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="text-sm font-medium text-forest">{r.author}</p>
            {r.verified && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-forest px-1.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wider text-cream">
                <VerifiedIcon className="size-2.5" />
                Acheteur vérifié
              </span>
            )}
          </div>
          {r.city && <p className="mt-0.5 text-xs text-ink/65">{r.city}</p>}
        </div>
        <time dateTime={r.date} className="shrink-0 text-xs text-ink/65">
          {formatDate(r.date)}
        </time>
      </header>

      <Stars rating={r.rating} size="size-4" className="mt-4" />
      {r.title && <h3 className="mt-2 text-[0.95rem] font-semibold text-forest">{r.title}</h3>}
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/70">{r.body}</p>

      {r.media.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {r.media.map((m, i) => (
            <button
              key={m.key}
              type="button"
              onClick={() => onOpenMedia(r, i)}
              className="group relative size-20 overflow-hidden rounded-lg bg-sand"
              aria-label={m.type === "video" ? "Lire la vidéo" : "Agrandir la photo"}
            >
              <MediaThumb media={m} sizes="80px" />
            </button>
          ))}
        </div>
      )}

      {product && (
        <a href="#produits" className="mt-4 flex items-center gap-2.5 rounded-lg bg-sand/50 px-3 py-2 text-xs text-ink/65 transition-colors hover:bg-sand hover:text-forest">
          <Image src={product.image.url} alt="" width={product.image.width} height={product.image.height} sizes="20px" className="h-7 w-auto" />
          <span className="truncate">{product.name}</span>
        </a>
      )}

      {r.reply && (
        <div className="mt-4 border-l-2 border-gold pl-4">
          <p className="text-xs font-semibold text-forest">Desart Solis a répondu</p>
          <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-ink/65">{r.reply}</p>
        </div>
      )}

      <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-forest/10 pt-4 text-xs text-ink/65">
        <span>Cet avis vous a-t-il été utile ?</span>
        <div className="flex gap-1">
          <VoteButton active={vote?.dir === "up"} onClick={() => onVote(r, "up")} label={`Utile — ${helpful} vote${helpful > 1 ? "s" : ""}`}>
            <Thumb className="size-3.5" />
            {helpful}
          </VoteButton>
          <VoteButton active={vote?.dir === "down"} onClick={() => onVote(r, "down")} label="Pas utile">
            <Thumb className="size-3.5 rotate-180" />
            {vote?.dir === "down" ? 1 : 0}
          </VoteButton>
        </div>
      </footer>
    </article>
  );
}

function MediaThumb({ media, sizes }: { media: ReviewMedia; sizes: string }) {
  if (media.type === "video") {
    return (
      <>
        {/* #t=0.5 makes browsers paint a frame as the thumbnail */}
        <video src={`${media.url}#t=0.5`} muted playsInline preload="metadata" className="absolute inset-0 size-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-forest/20">
          <span className="flex size-9 items-center justify-center rounded-full bg-cream/90 text-forest shadow">
            <PlayIcon className="ml-0.5 size-3.5" />
          </span>
        </span>
      </>
    );
  }
  return <Image src={media.url} alt="" fill sizes={sizes} className="object-cover transition-transform duration-500 ease-soft group-hover:scale-105" />;
}

function Lightbox({
  items,
  index,
  onChange,
  productBySlug,
}: {
  items: MediaRef[];
  index: number | null;
  onChange: (i: number | null) => void;
  productBySlug: Map<string, Product>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;
  const visibleHeight = useVisibleHeight();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (index === null || items.length === 0) return;
      onChange((index + dir + items.length) % items.length);
    },
    [index, items.length, onChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  /* The list can shrink while the lightbox is open — a review is unpublished
     and the live query re-runs. An index past the end would open an empty
     modal. */
  const safeIndex = index !== null && index < items.length ? index : null;
  const current = safeIndex !== null ? items[safeIndex] : null;

  return (
    <dialog
      ref={ref}
      onClose={() => onChange(null)}
      onClick={(e) => e.target === e.currentTarget && onChange(null)}
      aria-label="Aperçu du média"
      style={visibleHeight ? { maxHeight: `${visibleHeight - 32}px` } : undefined}
      className="m-auto max-h-[92dvh] w-[min(64rem,calc(100dvw-2rem))] overflow-hidden rounded-2xl bg-cream p-0 backdrop:bg-forest/80 backdrop:backdrop-blur-sm"
    >
      {current && (
        <div className="grid max-h-[92dvh] md:grid-cols-[1.4fr_1fr]">
          <div className="relative flex min-h-64 items-center justify-center bg-ink">
            {current.media.type === "video" ? (
              <video key={current.media.url} src={current.media.url} controls autoPlay playsInline className="max-h-[60dvh] w-full object-contain md:max-h-[92dvh]" />
            ) : (
              <Image
                key={current.media.url}
                src={current.media.url}
                alt={`Photo de ${current.review.author}`}
                width={current.media.width}
                height={current.media.height}
                sizes="(min-width: 768px) 38rem, 100vw"
                className="max-h-[60dvh] w-full object-contain md:max-h-[92dvh]"
              />
            )}
            {items.length > 1 && (
              <>
                <NavButton side="left" onClick={() => step(-1)} />
                <NavButton side="right" onClick={() => step(1)} />
              </>
            )}
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/60 px-3 py-1 text-xs text-cream" aria-live="polite">
              {(safeIndex ?? 0) + 1} / {items.length}
            </span>
          </div>
          <div className="overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-sand font-serif text-forest">{initials(current.review.author)}</span>
              <div>
                <p className="text-sm font-medium text-forest">{current.review.author}</p>
                <p className="text-xs text-ink/65">{[current.review.city, formatDate(current.review.date)].filter(Boolean).join(" · ")}</p>
              </div>
            </div>
            <Stars rating={current.review.rating} size="size-4" className="mt-5" />
            {current.review.title && <p className="mt-2 font-semibold text-forest">{current.review.title}</p>}
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/70">{current.review.body}</p>
            {productBySlug.get(current.review.product) && (
              <p className="mt-5 text-xs text-ink/65">Produit : {productBySlug.get(current.review.product)!.name}</p>
            )}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-label="Fermer"
        className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-cream/90 text-forest shadow"
      >
        <CloseIcon className="size-4" />
      </button>
    </dialog>
  );
}

type Attachment = { id: string; file: File; url: string; kind: "image" | "video" };

/** Downscale photos in the browser so several fit under the upload limit. */
async function compressImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d")!;
    /* JPEG has no alpha channel. Without a fill, a transparent PNG is flattened
       onto black — a customer with a cut-out photo would upload a black
       rectangle. */
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.82));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/** A unique id for an attachment. `crypto.randomUUID` needs a secure context,
    which a phone on a plain-HTTP preview would not have. */
function attachmentId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function WriteReviewDialog({ open, onClose, products, whatsappNumber }: { open: boolean; onClose: () => void; products: Product[]; whatsappNumber: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const emptyForm = { product: products[0]?.slug ?? "", author: "", city: "", title: "", body: "", company: "" };
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  /** The attachments are also read across `await` boundaries, where the
      React state is already stale. The ref is the source of truth. */
  const filesRef = useRef<Attachment[]>([]);
  const addingRef = useRef(false);
  const sendingRef = useRef(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const visibleHeight = useVisibleHeight();

  /* The form is long on a phone and the error sits at the very bottom of it.
     Without this the visitor taps "Publier" and sees nothing happen. */
  useEffect(() => {
    if (!error) return;
    errorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [error]);

  const updateFiles = (next: Attachment[]) => {
    filesRef.current = next;
    setFiles(next);
  };

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  /* Blob URLs outlive the component unless they are released. */
  useEffect(
    () => () => {
      filesRef.current.forEach((f) => URL.revokeObjectURL(f.url));
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const totalBytes = files.reduce((s, f) => s + f.file.size, 0);

  async function onFiles(list: FileList | null) {
    if (!list || addingRef.current) return;
    addingRef.current = true;
    setError(null);
    try {
      const prepared: Attachment[] = [];
      let rejected = false;
      for (const raw of Array.from(list)) {
        const kind = ACCEPTED_IMAGE_TYPES.has(raw.type) ? "image" : ACCEPTED_VIDEO_TYPES.has(raw.type) ? "video" : null;
        /* The endpoint only accepts these formats. A HEIC straight from an
           iPhone camera would be uploaded in full and then refused, so the
           file is checked here first. */
        if (!kind) {
          rejected = true;
          continue;
        }
        const file = kind === "image" ? await compressImage(raw) : raw;
        prepared.push({ id: attachmentId(), file, url: URL.createObjectURL(file), kind });
      }

      if (prepared.length === 0) {
        setError(rejected ? "Format non accepté (JPG, PNG, WebP, MP4 ou MOV)." : "Aucun fichier sélectionné.");
        return;
      }

      /* Read the list only now: the compression above yields, and another
         batch may have landed in the meantime. */
      const current = filesRef.current;
      const room = MAX_FILES - current.length;
      const accepted = prepared.slice(0, Math.max(room, 0));
      prepared.slice(accepted.length).forEach((f) => URL.revokeObjectURL(f.url));

      const all = [...current, ...accepted];
      const bytes = all.reduce((s, f) => s + f.file.size, 0);
      if (bytes > MAX_UPLOAD_BYTES) {
        all.forEach((f) => URL.revokeObjectURL(f.url));
        updateFiles([]);
        setError("Fichiers trop lourds (4 Mo max au total). Pour une vidéo plus longue, envoyez-la-nous sur WhatsApp.");
        return;
      }

      updateFiles(all);
      if (rejected) setError("Format non accepté (JPG, PNG, WebP, MP4 ou MOV). Les autres fichiers ont été ajoutés.");
    } finally {
      addingRef.current = false;
    }
  }

  function removeFile(id: string) {
    const next = filesRef.current.filter((f) => f.id !== id);
    filesRef.current.filter((f) => f.id === id).forEach((f) => URL.revokeObjectURL(f.url));
    updateFiles(next);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    /* A second Enter or a double tap must not send the review twice. */
    if (sendingRef.current) return;
    if (!rating) return setError("Choisissez une note.");
    if (form.author.trim().length < 2) return setError("Indiquez votre nom.");
    if (form.body.trim().length < 10) return setError("Votre avis doit contenir au moins 10 caractères.");
    setError(null);
    setStatus("sending");
    sendingRef.current = true;

    const data = new FormData();
    data.set("rating", String(rating));
    Object.entries(form).forEach(([k, v]) => data.set(k, v.trim()));
    filesRef.current.forEach((f) => data.append("media", f.file));

    /* On a slow mobile connection an upload can hang for minutes with no
       answer. The abort gives the visitor a way out instead of a dead button. */
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch("/api/reviews", { method: "POST", body: data, signal: controller.signal });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Envoi impossible, réessayez dans un instant.");
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(
        err instanceof DOMException && err.name === "AbortError"
          ? "L’envoi a pris trop de temps. Vérifiez votre connexion et réessayez."
          : (err as Error).message,
      );
    } finally {
      clearTimeout(timeout);
      sendingRef.current = false;
    }
  }

  function close() {
    onClose();
    /* The reset is deferred so the dialog can close first. The timer is
       cleared first: reopening within those 300ms must not wipe the new
       attempt's files and text. */
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      resetTimer.current = null;
      setStatus("idle");
      setRating(0);
      setError(null);
      filesRef.current.forEach((f) => URL.revokeObjectURL(f.url));
      updateFiles([]);
      setForm(emptyForm);
    }, 300);
  }

  const labels = ["", "Décevant", "Moyen", "Bien", "Très bien", "Excellent"];
  const shown = hover || rating;
  /* 16px on a phone: anything smaller makes iOS zoom the page on focus. */
  const field = "w-full rounded-xl border border-forest/15 bg-cream-soft px-4 py-3 text-base outline-none transition-colors focus:border-forest sm:text-sm";
  const titleId = useId();
  const ratingLabelId = useId();

  return (
    <dialog
      ref={ref}
      onClose={close}
      onClick={(e) => e.target === e.currentTarget && close()}
      aria-labelledby={titleId}
      /* `dvh` follows the dynamic viewport, and `useVisibleHeight` follows the
         visual viewport: on a phone with the keyboard up, the dialog shrinks
         instead of keeping its submit button behind the keyboard. */
      style={visibleHeight ? { maxHeight: `${visibleHeight - 32}px` } : undefined}
      className="m-auto max-h-[92dvh] w-[min(36rem,calc(100dvw-2rem))] overflow-y-auto rounded-2xl bg-cream p-0 backdrop:bg-forest/80 backdrop:backdrop-blur-sm"
    >
      <div className="p-5 sm:p-9">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-gold-deep">Votre avis</p>
            <p id={titleId} className="mt-2 font-serif text-3xl text-forest">
              Écrire un avis
            </p>
          </div>
          <button type="button" onClick={close} aria-label="Fermer" className="flex size-11 items-center justify-center rounded-full text-forest hover:bg-sand">
            <CloseIcon className="size-4" />
          </button>
        </div>

        {status === "done" ? (
          <div className="py-10 text-center" role="status">
            <Stars rating={rating} size="size-6" className="justify-center" />
            <p className="mt-5 font-serif text-2xl text-forest">Merci pour votre avis !</p>
            <p className="mx-auto mt-3 max-w-sm text-sm text-ink/65">Il sera publié sur le site après vérification par notre équipe.</p>
            <button type="button" onClick={close} className="eyebrow mt-8 rounded-full bg-forest px-8 py-3.5 text-cream">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-5">
            <div>
              <p id={ratingLabelId} className="mb-2 text-xs font-medium text-forest/80">
                Note
              </p>
              {/* A radio group, not five toggles: the stars are one answer to
                  one question, and a screen reader should say so. */}
              <div
                role="radiogroup"
                aria-labelledby={ratingLabelId}
                className="flex flex-wrap items-center gap-3"
                onMouseLeave={() => setHover(0)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setHover(0);
                }}
              >
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={rating === n}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHover(n)}
                      onFocus={() => setHover(n)}
                      aria-label={`${n} étoile${n > 1 ? "s" : ""} — ${labels[n]}`}
                      className="p-1"
                    >
                      <StarIcon fill={n <= shown ? 1 : 0} className="size-8" />
                    </button>
                  ))}
                </div>
                <span className="text-sm text-ink/65" aria-live="polite">
                  {labels[shown]}
                </span>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-forest/80">Produit</span>
              <select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className={field}>
                {products.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-forest/80">Nom</span>
                <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} maxLength={40} className={field} placeholder="Prénom N." />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-forest/80">Ville</span>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} maxLength={40} className={field} placeholder="Facultatif" />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-forest/80">Titre</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={80} className={field} placeholder="Résumez votre expérience" />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-forest/80">Votre avis</span>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={4}
                maxLength={1500}
                className={`${field} resize-none`}
                placeholder="Qu’avez-vous aimé ?"
              />
            </label>

            {/* Honeypot: hidden from people, filled by bots */}
            <label className="absolute -left-[9999px]" aria-hidden>
              Société
              <input tabIndex={-1} autoComplete="off" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </label>

            <div>
              <span className="mb-2 flex justify-between text-xs font-medium text-forest/80">
                Photos ou vidéos
                <span className="font-normal text-ink/65">
                  {files.length}/{MAX_FILES} · {(totalBytes / 1024 / 1024).toFixed(1)} / 4 Mo
                </span>
              </span>
              <div className="flex flex-wrap gap-2">
                {files.map((f) => (
                  <div key={f.id} className="relative size-20 overflow-hidden rounded-lg bg-sand">
                    {f.kind === "video" ? (
                      <video src={f.url} className="size-full object-cover" muted />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                      <img src={f.url} alt="" className="size-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(f.id)}
                      aria-label={`Retirer ${f.file.name}`}
                      className="absolute right-0.5 top-0.5 flex size-8 items-center justify-center rounded-full bg-cream/90 text-forest"
                    >
                      <CloseIcon className="size-3.5" />
                    </button>
                  </div>
                ))}
                {files.length < MAX_FILES && (
                  /* `peer` carries the focus ring from the hidden file input to
                     the label: the input is clipped to 1px, so a keyboard user
                     would otherwise land on an invisible control. */
                  <label className="peer flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-forest/25 text-forest/70 transition-colors hover:border-forest hover:text-forest peer-focus-visible:border-forest peer-focus-visible:ring-2 peer-focus-visible:ring-forest/40">
                    <CameraIcon className="size-5" />
                    <span className="text-[0.65rem]">Ajouter</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                      multiple
                      className="sr-only"
                      onChange={(e) => {
                        onFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
              <p className="mt-2 text-xs text-ink/65">
                Vidéo trop lourde ?{" "}
                <a href={whatsappLink(whatsappNumber, "Bonjour Desart Solis, voici une vidéo pour mon avis :")} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  Envoyez-la sur WhatsApp
                </a>
                .
              </p>
            </div>

            {error && (
              <p
                ref={errorRef}
                role="alert"
                className="text-xs text-[#b4533a]"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="eyebrow w-full rounded-full bg-forest py-4 text-cream transition-colors hover:bg-forest-soft disabled:opacity-60"
            >
              {status === "sending" ? "Envoi…" : "Publier mon avis"}
            </button>
            <p className="text-center text-xs text-ink/65">Publié après vérification par notre équipe</p>
          </form>
        )}
      </div>
    </dialog>
  );
}

/* ——— Small UI ——— */

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-4 py-2 text-xs transition-colors ${
        active ? "border-forest bg-forest text-cream" : "border-forest/15 text-forest/75 hover:border-forest/40"
      }`}
    >
      {children}
    </button>
  );
}

function VoteButton({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      /* 44px tall: this is one of the most-tapped controls in the section. */
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 nums transition-colors ${active ? "bg-forest text-cream" : "hover:bg-sand"}`}
    >
      {children}
    </button>
  );
}

function NavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Précédent" : "Suivant"}
      className={`absolute top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 text-forest shadow transition-transform hover:scale-105 ${
        side === "left" ? "left-3" : "right-3"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={`size-4 ${side === "left" ? "rotate-180" : ""}`} aria-hidden>
        <path d="m9 6 6 6-6 6" />
      </svg>
    </button>
  );
}

export function Stars({ rating, size = "size-4", className = "" }: { rating: number; size?: string; className?: string }) {
  return (
    <div className={`flex gap-0.5 ${className}`} role="img" aria-label={`${rating.toFixed(1)} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} fill={Math.max(0, Math.min(1, rating - n + 1))} className={size} />
      ))}
    </div>
  );
}

function StarIcon({ fill, className = "" }: { fill: number; className?: string }) {
  const id = `star${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id={id}>
          <stop offset={fill} stopColor="#c9a24f" />
          <stop offset={fill} stopColor="#c9a24f" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"
        fill={`url(#${id})`}
        stroke="#c9a24f"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VerifiedIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className} aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Thumb({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <path d="M7 10v11H3V10h4Zm0 0 4-8c1.7 0 3 1.3 3 3v3h5.5a2 2 0 0 1 2 2.3l-1.3 8A2 2 0 0 1 18.2 21H7" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M7 4.5v15l13-7.5z" />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function CameraIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}
