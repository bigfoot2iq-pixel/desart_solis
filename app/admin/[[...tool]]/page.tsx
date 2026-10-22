import { Suspense } from "react";
import { connection } from "next/server";
import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

/**
 * The Studio is a client application behind a login, so there is no useful
 * static shell to cache: `connection()` marks the route as intentionally
 * request-rendered, and the Suspense boundary keeps the rest of the route
 * prerenderable.
 */
async function Studio() {
  await connection();
  return <NextStudio config={config} />;
}

/**
 * Sanity Studio mounted inside the Next.js app.
 *
 * Every sub-route (`/admin/structure/...`, `/admin/vision`, ...) is handled by
 * the optional catch-all segment. Content and the signed-in user are loaded
 * client-side, and Sanity enforces project membership and roles on every
 * request.
 */
export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <Studio />
    </Suspense>
  );
}
