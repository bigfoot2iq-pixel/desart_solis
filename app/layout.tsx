import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { SanityLive } from "@/sanity/live";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const sans = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://desartbarber.shop"),
  title: "Desart Solis — Skin · Hair · Care",
  description:
    "Soins visage, cheveux et barbe à l’huile d’argan du Maroc. Face Wash Miel & B5, Gommage Visage et Sérum à la protéine végétale.",
  openGraph: {
    title: "Desart Solis — Skin · Hair · Care",
    description: "Soins à l’huile d’argan du Maroc. Commande sur WhatsApp, paiement à la livraison.",
    images: ["/brand/logo-full.webp"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable} scroll-smooth antialiased`}>
      <body className="min-h-full">
        {children}
        <SanityLive includeDrafts={false} />
      </body>
    </html>
  );
}
