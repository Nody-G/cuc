import type { ReactNode } from 'react';
import { Bebas_Neue, Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { MobileStickyCTA } from '@/components/layout/MobileStickyCTA';
import { PreviewBridgeClient } from '@/components/preview/PreviewBridgeClient';
import { SpeculationRules } from '@/components/preview/SpeculationRules';
import { educationalOrganizationJsonLd, websiteJsonLd } from '@/lib/seo';

/**
 * Coquille HTML commune (document `<html>`/`<body>`) partagée par les deux
 * layouts racines du site :
 *   - `src/app/(site)/[locale]/layout.tsx` — vitrine bilingue (fr/en) ;
 *   - `src/app/(admin)/layout.tsx` — cockpit (FR).
 *
 * Polices auto-hébergées par next/font (aucune requête vers Google au runtime).
 */
const bebasNeue = Bebas_Neue({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-bebas-neue',
    display: 'swap',
    preload: true,
    adjustFontFallback: false,
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
    preload: true,
});

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space-grotesk',
    display: 'swap',
    preload: false,
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
    display: 'swap',
    preload: false,
});

export function RootShell({
    locale,
    skipLabel = 'Aller au contenu principal',
    children,
}: {
    locale: string;
    skipLabel?: string;
    children: ReactNode;
}) {
    return (
        <html lang={locale} className="dark">
            <body
                className={`${bebasNeue.variable} ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-[#060608] text-white flex flex-col`}
            >
                {/* Lien d'évitement — accessibilité clavier (WCAG 2.4.1) */}
                <a
                    href="#contenu-principal"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[#FFE500] focus:text-black focus:font-bold focus:text-sm focus:border-2 focus:border-black"
                >
                    {skipLabel}
                </a>
                {children}
                <MobileStickyCTA />
                {/* Pont d'aperçu live du Cockpit — inerte hors iframe. */}
                <PreviewBridgeClient />
                {/* Speculation Rules API — préchargement/prérendu instantané. */}
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

export default RootShell;
