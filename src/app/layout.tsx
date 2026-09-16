import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MobileStickyCTA } from "@/components/layout/MobileStickyCTA";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CAMPUS UNIVERS CASCADES (CUC) • Plus Grande École de Cascadeurs au Monde",
  description:
    "Centre d'entraînement d'élite pour cascadeurs professionnels de cinéma et spectacle. 6 hectares d'installations, CUC Tower 21m, chutes de hauteur, torche humaine, câblage 3D, agrément QUALIOPI et prise en charge AFDAS. Fondé en 2008 par Lucas Dollfus au Cateau-Cambrésis.",
  keywords: [
    "cascadeur professionnel",
    "école de cascade",
    "Campus Univers Cascades",
    "CUC",
    "Lucas Dollfus",
    "formation cascadeur cinéma",
    "stage cascade afdas",
    "stunt school europe",
    "le cateau-cambresis",
    "parkour yamakasi"
  ],
  authors: [{ name: "Campus Univers Cascades - CUC Prod" }],
  openGraph: {
    title: "CAMPUS UNIVERS CASCADES • École Professionnelle de Cascadeurs",
    description:
      "La plus grande école de cascadeurs professionnels au monde. 6 hectares d'infrastructures, tour d'impact 21m, certification Qualiopi et formations AFDAS.",
    url: "https://www.campus-universcascades.com",
    siteName: "Campus Univers Cascades",
    images: [
      {
        url: "https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-8-scaled.jpg",
        width: 1200,
        height: 630,
        alt: "Campus Univers Cascades - Cascadeurs professionnels",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAMPUS UNIVERS CASCADES • Stunt Academy & Team",
    description: "Plus grand centre de formation professionnelle de cascadeurs de cinéma au monde.",
    images: ["https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-8-scaled.jpg"],
  },
  icons: {
    icon: [
      { url: '/images/logos/cuc-logo-yellow.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#FFE500",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${bebasNeue.variable} ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-[#060608] text-white flex flex-col`}
      >
        {children}
        <MobileStickyCTA />
      </body>
    </html>
  );
}
