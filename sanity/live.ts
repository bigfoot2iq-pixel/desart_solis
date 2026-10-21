import { defineLive, type StrictDefinedFetchType } from "next-sanity/live";
import { client } from "./client";

// Dataset is public and the site only shows published content, so no read token is needed.
// Stating it explicitly also tells next-sanity we are not running a live draft preview,
// which is what the missing-token warnings were about.
export const { sanityFetch, SanityLive } = defineLive({
  client,
  strict: true,
  serverToken: false,
  browserToken: false,
});

/** The app's single 'use cache' boundary; sanityFetch tags entries so <SanityLive /> can refresh them. */
export const cachedSanity: StrictDefinedFetchType = async (options) => {
  "use cache";
  return sanityFetch(options);
};
