import type { Metadata, Viewport } from 'next';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { RootShell } from '@/components/layout/RootShell';
import { SiteDataProvider } from '@/components/i18n/SiteDataProvider';
import { SiteVisitTracker } from '@/components/analytics/SiteVisitTracker';
import {
    getEntityOverlays,
    getLocalizedFooterChrome,
    getLocalizedNavigation,
    getLocalizedSocialLinks,
} from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/entities';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE } from '@/lib/seo';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: 'Campus Univers Cascades • École de Cascadeurs',
        template: '%s | CUC',
    },
    description: SITE_DESCRIPTION,
    alternates: {
        canonical: '/',
        languages: {
            fr: '/',
            en: '/en',
        },
    },
    keywords: [
        'cascadeur professionnel',
        'école de cascade',
        'Campus Univers Cascades',
        'CUC',
        'Lucas Dollfus',
        'formation cascadeur cinéma',
        'stage cascade afdas',
        'stunt school europe',
        'le cateau-cambresis',
        'parkour yamakasi',
    ],
    authors: [{ name: 'Campus Univers Cascades - CUC Prod' }],
    openGraph: {
        title: 'CAMPUS UNIVERS CASCADES • École Professionnelle de Cascadeurs',
        description:
            "La plus grande école de cascadeurs professionnels au monde. 11 000 m² d'infrastructures, tour d'impact 21m, certification Qualiopi et formations AFDAS.",
        url: SITE_URL,
        siteName: SITE_NAME,
        images: [DEFAULT_OG_IMAGE],
        locale: 'fr_FR',
        type: 'website',
    },
    // Twitter/X : seul le format de carte est déclaré ici — titre, description et
    // image sont volontairement ABSENTS. Next les recopie depuis `openGraph`
    // (`postProcessMetadata` → autoFillProps), qui est localisé par route
    // (`buildRouteMetadata` + `opengraph-image.tsx`). Les redéclarer ici figeait
    // une copie française **et** l'image générique sur toutes les pages `/en/…`.
    twitter: {
        card: 'summary_large_image',
    },
    // Les icônes viennent des conventions de fichiers de `src/app/` : `icon.tsx`
    // (monogramme jaune, lisible à 16 px) et `apple-icon.png`. Les redéclarer ici
    // doublonnait la source de vérité et imposait le logotype complet en onglet.
};

/**
 * Viewport / `themeColor` — parité avec l'ancien `src/app/layout.tsx`.
 * `maximumScale: 5` préserve l'accessibilité (zoom utilisateur autorisé).
 */
export const viewport: Viewport = {
    themeColor: '#FFE500',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
};

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    // Active le rendu statique par locale (recommandé par next-intl).
    setRequestLocale(locale);

    const messages = await getMessages();

    // La localisation de la COQUILLE (navigation + pied de page) est résolue ICI,
    // pour TOUTES les pages : sans cela, seules quelques pages fournissaient le
    // provider et les libellés FR (menu, footer) restaient affichés en mode EN —
    // y compris définitivement sur les vues purement clientes.
    const [
        navigation,
        footer,
        social,
        teamOverlays,
        campusPoiOverlays,
        facilityOverlays,
        disciplineOverlays,
    ] = await Promise.all([
        getLocalizedNavigation('main', locale as Locale),
        getLocalizedFooterChrome('main', locale as Locale),
        getLocalizedSocialLinks(locale as Locale),
        // Données éditoriales EN attendues dès le premier rendu (sinon le HTML
        // servi reste en français jusqu'à l'hydratation — défaut mesuré par le
        // crawler i18n) : coachs de l'annuaire, points du campus, installations
        // du domaine (fiches de la visite guidée) et référentiel des 10
        // disciplines (page Formation).
        getEntityOverlays('team', locale as Locale),
        getEntityOverlays('campus_poi', locale as Locale),
        getEntityOverlays('campus_facility', locale as Locale),
        getEntityOverlays('discipline', locale as Locale),
    ]);

    // Le provider next-intl est porté par RootShell : la page ET les composants
    // de coquille (MobileStickyCTA…) partagent désormais le même contexte i18n.
    return (
        <RootShell locale={locale} messages={messages}>
            <SiteDataProvider
                value={{
                    locale,
                    navigation,
                    footer,
                    social,
                    overlays: {
                        team: teamOverlays,
                        campus_poi: campusPoiOverlays,
                        campus_facility: facilityOverlays,
                        discipline: disciplineOverlays,
                    },
                }}
            >
                <SiteVisitTracker />
                {children}
            </SiteDataProvider>
        </RootShell>
    );
}
