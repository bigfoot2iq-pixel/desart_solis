import type { Metadata, Viewport } from "next";
import { metadata as studioMetadata, viewport as studioViewport } from "next-sanity/studio";

/**
 * Static metadata for the Studio shell. It lives on the `/admin` layout so it
 * applies to every Studio sub-route, and stays cacheable even though the page
 * itself opts into request rendering.
 */
export async function generateMetadata(): Promise<Metadata> {
  "use cache";
  return {
    ...studioMetadata,
    title: "Administration",
    description: "Espace d’édition Desart Solis.",
    alternates: { canonical: "/admin" },
  };
}

export const viewport: Viewport = studioViewport;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
