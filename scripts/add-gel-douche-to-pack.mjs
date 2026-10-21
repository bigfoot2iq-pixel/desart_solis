/**
 * One-off script: add the Gel Douche to the "Rituel Complet" pack.
 * Run with: node scripts/add-gel-douche-to-pack.mjs
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

await client
  .patch("pack-rituel-complet")
  .set({
    description: "Les quatre soins Desart Solis",
    products: [
      { _type: "reference", _ref: "product-face-wash", _key: "a1" },
      { _type: "reference", _ref: "product-gommage", _key: "a2" },
      { _type: "reference", _ref: "product-serum", _key: "a3" },
      { _type: "reference", _ref: "product-gel-douche", _key: "a4" },
    ],
  })
  .commit({ autoGenerateArrayKeys: true });

const pack = await client.fetch(
  `*[_id == "pack-rituel-complet"][0]{_id, name, description, "items": products[]->{"slug": slug.current, name, price}}`,
);
console.log("pack:", JSON.stringify(pack));
const total = pack.items.reduce((s, i) => s + i.price, 0);
console.log("full price:", total, "-> with 15%:", Math.round(total * 0.85));
