/**
 * Domaine de la page Team Building : replis éditoriaux certifiés et
 * opérations pures sur la copie du hero. Aucun JSX, aucun accès réseau
 * (`AGENTS.md` § 1-2).
 */

/** Copie du hero, résolue (données de page prioritaires, repli certifié sinon). */
export interface TeamBuildingHeroCopy {
    badge: string;
    title: string;
    subtitle: string;
    bgImage: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
}

/** Forme minimale attendue de `site_pages.hero` (structurellement compatible). */
export interface HeroSource {
    badge?: string;
    title?: string;
    subtitle?: string;
    bg_image?: string;
    cta_primary_text?: string;
    cta_primary_link?: string;
    cta_secondary_text?: string;
    cta_secondary_link?: string;
}

/** Replis éditoriaux certifiés — servis tant que le Cockpit n'a rien écrit. */
export const TEAM_BUILDING_HERO_DEFAULTS = {
    badge: 'SÉMINAIRES & ENTREPRISES',
    title: "TEAM BUILDING D'EXCEPTION",
    subtitle:
        "Offrez à vos équipes une immersion inoubliable dans l'univers du cinéma d'action et des cascadeurs professionnels. Ateliers modulables de 10 à 300 personnes sur notre campus ou sur le lieu de votre séminaire.",
    bgImage:
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Team-building-combat-cinema-1.jpg',
    ctaPrimaryText: 'Construire votre Projet Team Building',
    ctaPrimaryLink: '/contact-cuc',
    ctaSecondaryText: 'Découvrir CUC Events',
    ctaSecondaryLink: '/cuc-events-agence',
} as const;

/** Applique les données de page, clé par clé, sur les replis certifiés. */
export function resolveHeroCopy(hero: HeroSource | undefined): TeamBuildingHeroCopy {
    const defaults = TEAM_BUILDING_HERO_DEFAULTS;

    return {
        badge: hero?.badge || defaults.badge,
        title: hero?.title || defaults.title,
        subtitle: hero?.subtitle || defaults.subtitle,
        bgImage: hero?.bg_image || defaults.bgImage,
        ctaPrimaryText: hero?.cta_primary_text || defaults.ctaPrimaryText,
        ctaPrimaryLink: hero?.cta_primary_link || defaults.ctaPrimaryLink,
        ctaSecondaryText: hero?.cta_secondary_text || defaults.ctaSecondaryText,
        ctaSecondaryLink: hero?.cta_secondary_link || defaults.ctaSecondaryLink,
    };
}

/**
 * Découpe un titre de hero sur son **dernier mot** pour n'accentuer que lui.
 * Un titre d'un seul mot n'est jamais scindé (`accent` reste `null`).
 */
export function splitHeroTitle(title: string): { lead: string; accent: string | null } {
    if (!title.includes(' ')) return { lead: title, accent: null };

    const cut = title.lastIndexOf(' ');
    return {
        lead: title.substring(0, cut),
        accent: title.substring(cut + 1),
    };
}
