/**
 * One-off script: upload the Gel Douche cutout to Sanity and publish the product doc.
 * Run with: node scripts/add-gel-douche.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const ROOT = path.resolve(process.cwd());
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(ROOT, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-10-17",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// 1. upload the image -------------------------------------------------------
const file = path.join(ROOT, "public", "brand", "gel-douche.png");
const asset = await client.assets.upload("image", fs.readFileSync(file), {
  filename: "gel-douche.png",
  contentType: "image/png",
});
console.log("asset:", asset._id, asset.url);

// 2. create / update the product --------------------------------------------
const doc = {
  _id: "product-gel-douche",
  _type: "product",
  name: "Gel Douche Caramel",
  slug: { _type: "slug", current: "gel-douche" },
  price: 79,
  size: "400 ml",
  tagline: "Senteur caramel chaud",
  description:
    "Un gel douche crémeux à la fragrance caramel chaud. Il nettoie la peau en douceur et la laisse souple, lisse et délicatement parfumée.",
  notes: ["Argan", "Caramel", "Sans sulfate"],
  category: "corps",
  availability: "available",
  sortOrder: 40,
  image: {
    _type: "image",
    alt: "Flacon Desart Gel Douche Caramel, 400 ml",
    asset: { _type: "reference", _ref: asset._id },
  },
};

await client.createOrReplace(doc);
console.log("product written:", doc._id);

await client.action({
  actionType: "sanity.action.document.publish",
  draftId: doc._id,
  publishedId: doc._id,
});
console.log("published:", doc._id);

const check = await client.fetch(`*[_id == $id][0]{_id, name, "slug": slug.current, price, size, category, "url": image.asset->url, w: image.asset->metadata.dimensions.width, h: image.asset->metadata.dimensions.height}`, { id: doc._id });
console.log("verified:", JSON.stringify(check));
