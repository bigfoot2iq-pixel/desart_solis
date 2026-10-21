import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Desart Solis — Skin · Hair · Care",
    short_name: "Desart Solis",
    description:
      "Soins visage, corps, cheveux et barbe à l’huile d’argan du Maroc. Commande sur WhatsApp, paiement à la livraison.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f0ec",
    theme_color: "#f3f0ec",
    lang: "fr",
    dir: "ltr",
    categories: ["shopping", "lifestyle", "beauty"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
