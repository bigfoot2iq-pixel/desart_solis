import type { MetadataRoute } from "next";
import { defineQuery } from "next-sanity";
import { cachedSanity } from "@/sanity/live";

const SITE_URL = "https://desartbarber.shop";

/** The last time anything on the site was actually changed. */
const LAST_UPDATED_QUERY = defineQuery(
  `*[_type in ["product", "pack", "review", "faq", "siteSettings"]] | order(_updatedAt desc)[0]._updatedAt`,
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let lastModified: Date | undefined;
  try {
    const { data } = await cachedSanity({ query: LAST_UPDATED_QUERY, perspective: "published", stega: false });
    // The query is not part of the generated types yet, so the value is
    // narrowed by hand: it is an ISO timestamp or nothing.
    const value = data as string | null | undefined;
    if (value) lastModified = new Date(value);
  } catch {
    // A sitemap without a date is still valid — better than a 500.
  }

  return [
    {
      url: SITE_URL,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
