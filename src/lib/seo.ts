/**
 * Configuration SEO centralisée du site CUC.
 *
 * Source unique de vérité pour l'URL de base, les métadonnées par défaut
 * et les données structurées JSON-LD (schema.org).
 */

export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "https://cuc-new.vercel.app");

export const SITE_NAME = "Campus Univers Cascades";

export const SITE_SHORT_NAME = "CUC";

export const SITE_DESCRIPTION =
    "Centre de formation professionnelle pour cascadeurs de cinéma et spectacle : CUC Tower 21m, chutes de hauteur, câblage. Certification QUALIOPI et prise en charge AFDAS.";

export const SITE_LOCALE = "fr_FR";

/**
 * Image Open Graph par défaut.
 *
 * Hébergée sur Supabase Storage (`cuc-vitrine-assets`) et non plus sur
 * l'ancien site WordPress : toute dépendance à `wp-content` est proscrite
 * (doctrine « Zéro Texte ni Valeur Orpheline »).
 */
export const DEFAULT_OG_IMAGE = {
    url: "https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-8-scaled.jpg",
    width: 1200,
    height: 630,
    alt: "Campus Univers Cascades — Cascadeurs professionnels",
};

/** Coordonnées géographiques du campus (Le Cateau-Cambrésis, 59). */
export const CAMPUS_GEO = {
    latitude: 50.1006,
    longitude: 3.5475,
};

export const CAMPUS_ADDRESS = {
    streetAddress: "Domaine du Campus Univers Cascades",
    addressLocality: "Le Cateau-Cambrésis",
    postalCode: "59360",
    addressRegion: "Hauts-de-France",
    addressCountry: "FR",
};

/** Profils sociaux — utilisés pour `sameAs` dans le JSON-LD. */
export const SOCIAL_PROFILES = [
    "https://www.instagram.com/campus.univers.cascades",
    "https://www.youtube.com/@campusuniverscascades",
    "https://www.tiktok.com/@campusuniverscascades",
    "https://www.facebook.com/campus.univers.cascades",
];

/**
 * Construit une URL canonique absolue à partir d'un chemin relatif.
 * @example canonical('/partenaires') // => 'https://www.campus-universcascades.com/partenaires'
 */
export function canonical(path: string): string {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return normalized === "/" ? SITE_URL : `${SITE_URL}${normalized}`;
}

/**
 * Données structurées schema.org pour l'organisation éducative.
 * À injecter dans le layout racine via un script `application/ld+json`.
 */
export function educationalOrganizationJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: SITE_SHORT_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/images/logos/cuc-logo-yellow.png`,
        description: SITE_DESCRIPTION,
        foundingDate: "2008",
        founder: {
            "@type": "Person",
            name: "Lucas Dollfus",
        },
        address: {
            "@type": "PostalAddress",
            ...CAMPUS_ADDRESS,
        },
        geo: {
            "@type": "GeoCoordinates",
            ...CAMPUS_GEO,
        },
        sameAs: SOCIAL_PROFILES,
        areaServed: {
            "@type": "Country",
            name: "France",
        },
        knowsAbout: [
            "Cascade cinématographique",
            "Parkour",
            "Chutes de hauteur",
            "Combat chorégraphié",
            "Torche humaine",
            "Câblage 3D",
        ],
    };
}

/**
 * Données structurées schema.org pour le site web (avec recherche interne).
 */
export function websiteJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "fr-FR",
        publisher: { "@id": `${SITE_URL}/#organization` },
    };
}

/**
 * Données structurées schema.org pour un cours / une formation.
 */
export function courseJsonLd(params: {
    name: string;
    description: string;
    path: string;
    duration?: string;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "Course",
        name: params.name,
        description: params.description,
        url: canonical(params.path),
        inLanguage: "fr-FR",
        provider: { "@id": `${SITE_URL}/#organization` },
        ...(params.duration ? { timeRequired: params.duration } : {}),
        hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "onsite",
            location: {
                "@type": "Place",
                name: SITE_NAME,
                address: {
                    "@type": "PostalAddress",
                    ...CAMPUS_ADDRESS,
                },
            },
        },
    };
}

/**
 * Données structurées schema.org pour une vidéo (reportage, série TV).
 */
export function videoObjectJsonLd(params: {
    name: string;
    description: string;
    thumbnailUrl: string;
    uploadDate?: string;
    embedUrl?: string;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: params.name,
        description: params.description,
        thumbnailUrl: [params.thumbnailUrl],
        uploadDate: params.uploadDate ?? "2025-12-01",
        ...(params.embedUrl ? { embedUrl: params.embedUrl } : {}),
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "fr-FR",
    };
}
