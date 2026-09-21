/*
 * Feuille de style globale de l'application (Tailwind v4 + thème CUC).
 *
 * ATTENTION — cet import est CRITIQUE et doit rester ici :
 * `RootShell` est le seul composant qui rend `<html>`/`<body>` ; il est partagé
 * par les DEUX layouts racines (`(site)/[locale]/layout.tsx` et
 * `(admin)/layout.tsx`). C'est donc le point unique qui garantit que Tailwind
 * et les règles `body { background-color: #060608 }` sont chargés.
 *
 * Régression historique : lors du passage à `[locale]`, l'import qui vivait
 * dans l'ancien `src/app/layout.tsx` avait disparu. Aucun CSS n'était plus
 * émis (hors polices) : logos affichés en taille intrinsèque et page blanche.
 * Un garde-fou automatisé couvre désormais ce point — voir
 * `src/lib/global-styles.test.ts`.
 */
import '@/app/globals.css';
import type { ComponentProps, ReactNode } from 'react';
import { Bebas_Neue, Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { MobileStickyCTA } from '@/components/layout/MobileStickyCTA';
import { SkipLink } from '@/components/layout/SkipLink';
import { PreviewBridgeClient } from '@/components/preview/PreviewBridgeClient';
import { PreviewEditLayer } from '@/components/preview/PreviewEditLayer';
import { SpeculationRules } from '@/components/preview/SpeculationRules';
import { educationalOrganizationJsonLd, websiteJsonLd } from '@/lib/seo';

/**
 * Coquille HTML commune (document `<html>`/`<body>`) partagée par les deux
 * layouts racines du site :
 *   - `src/app/(site)/[locale]/layout.tsx` — vitrine bilingue (fr/en) ;
 *   - `src/app/(admin)/layout.tsx` — cockpit (FR).
 *
 * Elle porte aussi le **provider de traduction** : tout ce que la coquille rend
 * (page, lien d'évitement, `MobileStickyCTA`, pont d'aperçu…) est ainsi dans le
 * contexte next-intl. C'est indispensable, car le `Link` de
 * `@/i18n/navigation` appelle `useLocale()` à chaque rendu et lève une
 * exception — au message vide en production — hors provider :
 *
 *   "No intl context found. Have you configured the provider?"
 *
 * Panne réelle : `MobileStickyCTA` (rendu par cette coquille, donc hors du
 * `NextIntlClientProvider` des layouts) ne monte son `<Link>` localisé qu'au
 * premier défilement (`scrollY > 200`). L'exception partait donc au scroll et
 * remontait à `global-error` — la page entière était remplacée.
 * Le provider est désormais placé ici, à la racine, pour ne plus dépendre de
 * l'ordre de composition des layouts.
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

/** Messages attendus par le provider, dérivés de sa signature. */
type IntlMessages = NonNullable<
    ComponentProps<typeof NextIntlClientProvider>['messages']
>;

export function RootShell({
    locale,
    messages,
    children,
}: {
    locale: string;
    messages?: IntlMessages;
    children: ReactNode;
}) {
    return (
        <html lang={locale} className="dark">
            <body
                className={`${bebasNeue.variable} ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-[#060608] text-white flex flex-col`}
            >
                {/* Provider next-intl à la RACINE de la coquille : il englobe la
                    page ET les composants de coquille (MobileStickyCTA…). */}
                <NextIntlClientProvider locale={locale} messages={messages}>
                    {/* Lien d'évitement — libellé localisé (client, catalogue `common`) */}
                    <SkipLink />
                    {children}
                    <MobileStickyCTA />
                    {/* Pont d'aperçu live du Cockpit — inerte hors iframe. */}
                    <PreviewBridgeClient />
                    {/* Édition en place (Mode Studio) — inerte hors iframe. */}
                    <PreviewEditLayer />
                    {/* Speculation Rules API — préchargement/prérendu instantané. */}
                    <SpeculationRules />
                </NextIntlClientProvider>
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
