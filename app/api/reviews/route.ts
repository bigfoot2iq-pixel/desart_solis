import { PRODUCT_ID_BY_SLUG_QUERY } from "@/sanity/queries";
import { writeClient } from "@/sanity/write-client";
import { clientIp, rateLimit } from "../../_lib/rate-limit";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const MAX_FILES = 4;
const MAX_BODY_BYTES = 4.5 * 1024 * 1024;

const text = (form: FormData, key: string, max: number) => String(form.get(key) ?? "").trim().slice(0, max);
const fail = (error: string, status = 400) => Response.json({ error }, { status });

/** Stores a customer review as a draft. It only appears on the site once the admin publishes it in the Studio. */
export async function POST(req: Request) {
  if (!writeClient) return fail("Les avis sont momentanément indisponibles.", 503);

  if (!rateLimit(`review:${clientIp(req)}`, 3, 60 * 60 * 1000)) {
    return fail("Trop d’envois. Réessayez dans une heure.", 429);
  }
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return fail("Fichiers trop lourds (4 Mo max au total).", 413);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Formulaire invalide.");
  }

  // Honeypot filled → bot. Pretend it worked.
  if (text(form, "company", 100)) return Response.json({ ok: true }, { status: 201 });

  const rating = Number(form.get("rating"));
  const author = text(form, "author", 40);
  const city = text(form, "city", 40);
  const title = text(form, "title", 80);
  const body = text(form, "body", 1500);
  const productSlug = text(form, "product", 80);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail("Note invalide.");
  if (author.length < 2) return fail("Indiquez votre nom.");
  if (body.length < 10) return fail("Votre avis doit contenir au moins 10 caractères.");

  const published = writeClient.withConfig({ perspective: "published" });
  const productId = await published.fetch(PRODUCT_ID_BY_SLUG_QUERY, { slug: productSlug });
  if (!productId) return fail("Produit introuvable.");

  const files = form.getAll("media").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_FILES) return fail(`${MAX_FILES} fichiers maximum.`);
  for (const f of files) {
    if (!IMAGE_TYPES.has(f.type) && !VIDEO_TYPES.has(f.type)) return fail("Format de fichier non accepté (JPG, PNG, WebP, MP4, MOV).");
  }

  try {
    const media = [];
    for (const f of files) {
      const isImage = IMAGE_TYPES.has(f.type);
      const asset = await writeClient.assets.upload(isImage ? "image" : "file", Buffer.from(await f.arrayBuffer()), {
        filename: f.name.slice(0, 120),
        contentType: f.type,
        source: { name: "website-review", id: productSlug },
      });
      media.push({
        _type: isImage ? "image" : "video",
        _key: crypto.randomUUID().slice(0, 12),
        asset: { _type: "reference", _ref: asset._id },
      });
    }

    await writeClient.create({
      _id: `drafts.review-${crypto.randomUUID()}`,
      _type: "review",
      rating,
      author,
      ...(city && { city }),
      ...(title && { title }),
      body,
      product: { _type: "reference", _ref: productId },
      media,
      submittedAt: new Date().toISOString().slice(0, 10),
      verification: "unverified",
      helpfulCount: 0,
      source: "website",
    });
  } catch (err) {
    console.error("[reviews] submission failed", err);
    return fail("Envoi impossible, réessayez dans un instant.", 500);
  }

  return Response.json({ ok: true }, { status: 201 });
}
