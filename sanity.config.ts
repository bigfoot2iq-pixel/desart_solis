"use client";

import { createStudioConfig } from "./studio/config";

/**
 * Studio mounted inside the Next.js app at `/admin`.
 *
 * Sanity has no "Sign in with Sanity" OAuth provider for third-party apps, so
 * this is the supported way to keep admin access scoped to the project's
 * members: the Studio's own login issues a project token and Sanity enforces
 * each member's role on every read and write.
 */
export default createStudioConfig({
  basePath: "/admin",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
});
