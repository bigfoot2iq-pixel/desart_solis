import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
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

const SITE_URL = "https://desartbarber.shop";
const TITLE = "Desart Solis — Skin · Hair · Care";
const DESCRIPTION =
  "Soins visage, corps, cheveux et barbe à l’huile d’argan du Maroc. Face Wash Miel & B5, Gommage Visage, Sérum à la protéine végétale et Gel Douche Caramel.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — Desart Solis",
  },
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  applicationName: "Desart Solis",
  // The checkout happens on WhatsApp: a phone number typed into the page is a
  // number the visitor did not mean to dial, so the automatic detection is off.
  formatDetection: { telephone: false, address: false, email: false },
  appleWebApp: {
    capable: true,
    title: "Desart Solis",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "fr_MA",
    url: "/",
    siteName: "Desart Solis",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/brand/logo-full.webp", width: 1600, height: 1600, alt: "Desart Solis — Skin · Hair · Care" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/brand/logo-full.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // `viewport-fit=cover` is what makes `env(safe-area-inset-*)` return a real
  // value on a notched iPhone. Without it the insets are always 0 and the
  // sticky bars sit under the home indicator.
  viewportFit: "cover",
  themeColor: "#f3f0ec",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable} scroll-smooth antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
