import { SanityLive } from "@/sanity/live";

/**
 * The storefront tree. <SanityLive /> lives here rather than in the root layout
 * so it does not run inside the Studio at `/admin`: every publish would
 * otherwise refresh the admin route and interrupt an edit in progress.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SanityLive includeDrafts={false} />
    </>
  );
}
