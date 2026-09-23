import type { OgImageOptions, OgLocale } from '@/lib/og-image';

/**
 * ==============================================================================
 * Contenu bilingue des cartes Open Graph de route — source unique
 * ==============================================================================
 * Constat : les 14 `opengraph-image.tsx` des routes publiques portaient leur
 * copie française en dur dans un export sans paramètre. Une page anglaise
 * (`/en/…`) partageait donc une vignette entièrement française.
 *
 * Principe :
 *  - un seul catalogue (`ROUTE_OG_COPY`) décrit chaque carte en FR **et** EN ;
 *  - le FR est repris **verbatim** des fichiers d'origine (aucune retouche) ;
 *  - l'EN réutilise la formulation déjà validée par les overlays
 *    `site_translations` (`scripts/seed_site_translations_en*.mjs`) quand elle
 *    existe — jamais une seconde traduction inventée pour le même fait ;
 *  - les routes ne font plus que lire leurs paramètres et appeler
 *    `routeOgOptions()`, la fabrique de rendu restant `renderOgImage`.
 *
 * Le genre de carte (carte d'équipe générique) est partagé avec
 * `coach-og.ts` : les deux surfaces lisent la même entrée, donc jamais deux
 * formulations concurrentes de la même carte.
 */

/** Contenu d'une carte : sur-titre, titre, accroche, métriques. */
export interface OgImageCopy {
    eyebrow: string;
    title: string;
    subtitle: string;
    metrics: readonly string[];
}

/** Locale d'une carte : deux langues servies par la vitrine, pas plus. */
export function ogLocale(locale: string | undefined): OgLocale {
    return locale === 'en' ? 'en' : 'fr';
}

const COPY = {
    'formation-de-cascadeur': {
        fr: {
            eyebrow: 'FORMATION PROFESSIONNELLE',
            title: 'DEVENIR CASCADEUR DE CINÉMA',
            subtitle: 'Cursus 2 ans / 720 h + Formule Découverte 12 jours',
            metrics: ['720 HEURES', '2 ANS', 'AFDAS', 'QUALIOPI'],
        },
        en: {
            eyebrow: 'PROFESSIONAL TRAINING',
            title: 'PROFESSIONAL STUNT TRAINING',
            subtitle: 'Two-year course / 720 h + 12-day Discovery Programme',
            metrics: ['720 HOURS', '2 YEARS', 'AFDAS', 'QUALIOPI'],
        },
    },
    'stages-cascades-parkour-2': {
        fr: {
            eyebrow: 'STAGES & PARKOUR',
            title: 'STAGES CASCADES & PARKOUR',
            subtitle: 'Week-ends intensifs et stages thématiques ouverts à tous',
            metrics: ['WEEK-ENDS', 'TOUS NIVEAUX', 'PARKOUR', 'CASCADES'],
        },
        en: {
            eyebrow: 'WORKSHOPS',
            title: 'STUNT & PARKOUR WORKSHOPS',
            subtitle: 'Intensive weekends and themed workshops open to everyone',
            metrics: ['WEEKENDS', 'ALL LEVELS', 'PARKOUR', 'STUNTS'],
        },
    },
    'stunt-workshop-cuc': {
        fr: {
            eyebrow: 'STUNT WORKSHOP',
            title: 'STUNT WORKSHOP CUC',
            subtitle: 'Ateliers techniques encadrés par des professionnels',
            metrics: ['ATELIERS', 'PROS', 'TECHNIQUE', 'IMMERSION'],
        },
        en: {
            eyebrow: 'STUNT WORKSHOP',
            title: 'INTERNATIONAL STUNT WORKSHOP',
            subtitle: 'Technical workshops led by working professionals',
            metrics: ['WORKSHOPS', 'PROS', 'TECHNICAL', 'IMMERSION'],
        },
    },
    'visite-guidee': {
        fr: {
            eyebrow: 'VISITE GUIDÉE',
            title: 'VISITEZ LE CAMPUS',
            subtitle: 'Découvrez des installations uniques',
            metrics: ['11 000 M²', 'CUC TOWER', 'SUR RDV', 'GRATUIT'],
        },
        en: {
            eyebrow: 'GUIDED TOUR',
            title: 'THE CAMPUS',
            subtitle: 'Discover the campus training facilities',
            metrics: ['11,000 M²', 'CUC TOWER', 'BY APPOINTMENT', 'FREE'],
        },
    },
    'visite-virtuelle': {
        fr: {
            eyebrow: 'VISITE VIRTUELLE 360°',
            title: 'EXPLOREZ EN 360°',
            subtitle: 'Visite immersive du domaine et du plan 3D',
            metrics: ['360°', 'PLAN 3D', 'IMMERSIF', 'EN LIGNE'],
        },
        en: {
            eyebrow: '360° VIRTUAL TOUR',
            title: 'DISCOVER THE CAMPUS',
            subtitle: 'Immersive tour of the estate and its 3D map',
            metrics: ['360°', '3D MAP', 'IMMERSIVE', 'ONLINE'],
        },
    },
    'equipe-cascadeurs-pro': {
        fr: {
            eyebrow: "L'ÉQUIPE",
            title: "L'ÉQUIPE DU CAMPUS",
            subtitle: 'Formateurs, cascadeurs et encadrement technique',
            metrics: ['FORMATEURS', 'CASCADEURS', 'TECHNIQUE', 'SÉCURITÉ'],
        },
        en: {
            eyebrow: 'THE TEAM',
            title: 'THE CAMPUS TEAM',
            subtitle: 'Instructors, stunt performers and technical supervision',
            metrics: ['INSTRUCTORS', 'STUNT PERFORMERS', 'TECHNIQUE', 'SAFETY'],
        },
    },
    'cuc-team-cascadeur': {
        fr: {
            eyebrow: 'PRESTATIONS & TOURNAGES',
            title: 'TOURNAGE',
            subtitle: 'Coordination de cascades et CUC Stunt Team pour le cinéma',
            metrics: ['CINÉMA', 'SÉRIES', 'PUBLICITÉ', 'LIVE'],
        },
        en: {
            eyebrow: 'STUNT COORDINATION',
            title: 'PRODUCTIONS',
            subtitle:
                'Campus Univers Cascades and CUC Stunt Team support productions with a pool of more than 200 certified stunt performers.',
            metrics: ['FILM', 'TV SERIES', 'ADVERTISING', 'LIVE'],
        },
    },
    'videos-cascadeur': {
        fr: {
            eyebrow: 'VIDÉOS & REPORTAGES',
            title: "LE CUC À L'ÉCRAN",
            subtitle: 'Séries TV, reportages et coulisses du Campus',
            metrics: ['FRANCE 2', 'BFM TV', 'DAILYMOTION', 'COULISSES'],
        },
        en: {
            eyebrow: 'TV REPORTS & VIDEOS',
            title: 'CUC REPORTS & VIDEOS',
            subtitle: 'TV series, reports and behind-the-scenes at the Campus',
            metrics: ['FRANCE 2', 'BFM TV', 'DAILYMOTION', 'BEHIND THE SCENES'],
        },
    },
    'contact-cuc': {
        fr: {
            eyebrow: 'CONTACT',
            title: 'CONTACTEZ LE CUC',
            subtitle: 'Inscriptions, stages et renseignements',
            metrics: ['INSCRIPTIONS', 'STAGES', 'DEVIS', 'RÉPONSE RAPIDE'],
        },
        en: {
            eyebrow: 'CONTACT',
            title: 'CONTACT & PROJECTS',
            subtitle: 'Admissions, workshops and information',
            metrics: ['ADMISSIONS', 'WORKSHOPS', 'QUOTES', 'FAST RESPONSE'],
        },
    },
    'partenaires': {
        fr: {
            eyebrow: 'PARTENAIRES',
            title: 'NOS PARTENAIRES',
            subtitle: 'Les marques et fabricants qui accompagnent le Campus',
            metrics: ['NIKE', 'RXR', 'C17', 'KILOUTOU'],
        },
        en: {
            eyebrow: 'PARTNERS',
            title: 'OUR PARTNERS',
            subtitle: 'The brands and manufacturers supporting the Campus',
            metrics: ['NIKE', 'RXR', 'C17', 'KILOUTOU'],
        },
    },
    'cuc-events-agence': {
        fr: {
            eyebrow: 'AGENCE ÉVÉNEMENTIELLE',
            title: 'CUC EVENTS — AGENCE',
            subtitle: "Production d'événements et de cascades sur mesure",
            metrics: ['PRODUCTION', 'SUR-MESURE', 'CINÉMA', 'LIVE'],
        },
        en: {
            eyebrow: 'EVENTS AGENCY',
            title: 'CUC EVENTS: SHOWS & ANIMATIONS',
            subtitle: 'Custom event and stunt production',
            metrics: ['PRODUCTION', 'CUSTOM', 'FILM', 'LIVE'],
        },
    },
    'spectacles-cascadeurs-yamakasi': {
        fr: {
            eyebrow: 'SPECTACLES',
            title: 'SPECTACLES & YAMAKASI',
            subtitle: 'Shows de cascades et démonstrations live',
            metrics: ['LIVE', 'YAMAKASI', 'PARKOUR', 'ÉVÉNEMENTS'],
        },
        en: {
            eyebrow: 'SHOWS',
            title: 'STUNT & YAMAKASI SHOWS',
            subtitle: 'Stunt shows and live performances',
            metrics: ['LIVE', 'YAMAKASI', 'PARKOUR', 'EVENTS'],
        },
    },
    'team-building-cascades': {
        fr: {
            eyebrow: 'TEAM BUILDING',
            title: 'TEAM BUILDING CASCADES',
            subtitle: "Cohésion d'équipe par l'action et le dépassement",
            metrics: ['ENTREPRISES', 'COHÉSION', 'SUR-MESURE', 'DEPUIS 2008'],
        },
        en: {
            eyebrow: 'TEAM BUILDING',
            title: 'EXCEPTIONAL TEAM BUILDING',
            subtitle: 'Team cohesion through action and physical challenges',
            metrics: ['COMPANIES', 'TEAM COHESION', 'CUSTOM', 'SINCE 2008'],
        },
    },
    'animations-airbag-parkour': {
        fr: {
            eyebrow: 'ANIMATIONS',
            title: 'AIRBAG & PARKOUR',
            subtitle: 'Animations grand public et airbag de réception',
            metrics: ['AIRBAG', 'PARKOUR', 'FAMILLE', 'SÉCURISÉ'],
        },
        en: {
            eyebrow: 'ANIMATION',
            title: 'AIRBAG & PARKOUR ANIMATION',
            subtitle: 'Public events and reception airbag',
            metrics: ['AIRBAG', 'PARKOUR', 'FAMILY', 'SUPERVISED'],
        },
    },
} as const;

/** Slug de route publique admis par le catalogue. */
export type RouteOgSlug = keyof typeof COPY;

/**
 * Catalogue exposé : mêmes valeurs, mais indexables par locale sans cast.
 * `COPY` reste la source des clés (typage strict des slugs).
 */
export const ROUTE_OG_COPY: Record<RouteOgSlug, Record<OgLocale, OgImageCopy>> = COPY;

/** Copie d'une carte, dans la langue demandée (FR par défaut). */
export function routeOgCopy(slug: RouteOgSlug, locale: string | undefined) {
    return ROUTE_OG_COPY[slug][ogLocale(locale)];
}

/**
 * Options prêtes pour `renderOgImage` : copie localisée + locale de la carte
 * (elle décide du repère géographique affiché sous le nom du campus).
 */
export function routeOgOptions(slug: RouteOgSlug, locale: string | undefined): OgImageOptions {
    const safeLocale = ogLocale(locale);
    return { ...ROUTE_OG_COPY[slug][safeLocale], locale: safeLocale };
}
