export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
// Hard-coded on purpose: bump deliberately when adopting new API behaviour.
export const apiVersion = "2026-10-17";

export const STUDIO_URL = "https://desart-solis.sanity.studio";

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}
