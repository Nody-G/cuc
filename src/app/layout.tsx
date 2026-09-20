import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MobileStickyCTA } from "@/components/layout/MobileStickyCTA";
import { PreviewBridgeClient } from "@/components/preview/PreviewBridgeClient";
import { SpeculationRules } from "@/components/preview/SpeculationRules";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  educationalOrganizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

// Polices auto-hébergées par next/font (aucune requête vers Google au runtime).
// `preload: true` uniquement pour les polices critiques (display + body) afin
// de ne pas saturer la bande passante au premier rendu.
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
  preload: true,
  adjustFontFallback: false,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Campus Univers Cascades • École de Cascadeurs",
    template: "%s | CUC",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
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
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [DEFAULT_OG_IMAGE],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAMPUS UNIVERS CASCADES • Stunt Academy & Team",
    description: "Plus grand centre de formation professionnelle de cascadeurs de cinéma au monde.",
    images: [DEFAULT_OG_IMAGE.url],
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
        {/* Lien d'évitement — accessibilité clavier (WCAG 2.4.1) */}
        <a
          href="#contenu-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[#FFE500] focus:text-black focus:font-bold focus:text-sm focus:border-2 focus:border-black"
        >
          Aller au contenu principal
        </a>
        {children}
        <MobileStickyCTA />
        {/* Pont d'aperçu live du Cockpit — inerte hors iframe. Permet l'édition
            inline (clic → focus du champ) et l'injection du brouillon non publié. */}
        <PreviewBridgeClient />
        {/* Speculation Rules API (Phase 5) — préchargement/prérendu instantané
            des navigations internes au survol/clic. Dégradation gracieuse.
            Désactivé dans un cadre embarqué (aperçu Cockpit) : le `prerender`
            de Chrome y est restreint et pouvait remplacer l'aperçu par la page
            d'erreur du navigateur après un affichage fugace. */}
        <SpeculationRules />
        {/* Données structurées schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(educationalOrganizationJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd()),
          }}
        />
      </body>
    </html>
  );
}
