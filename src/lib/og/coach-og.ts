import type { Instructor } from '@/types';
import type { OgImageOptions } from '@/lib/og-image';
import type { Locale } from '@/lib/i18n/entities';

/**
 * ==============================================================================
 * Contenu des images Open Graph des fiches coachs
 * (`/equipe-cascadeurs-pro/[slug]/opengraph-image.tsx`)
 * ==============================================================================
 * Fonction pure : mêmes entrées → même carte. Le chargement (catalogue + overlay
 * EN) vit dans la route OG ; ici, seul l'assemblage du visuel — nom, fonction et
 * spécialités du coach. Slug inconnu → repli générique, identique à la carte du
 * parent `/equipe-cascadeurs-pro` (jamais de carte vide).
 */

/** Carte de repli : la même que la route parente, dans la langue demandée. */
const GENERIC_CARD: Record<Locale, OgImageOptions> = {
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
};

/**
 * Options de rendu pour `renderOgImage`.
 *
 * @param member Coach résolu du catalogue (overlay EN déjà appliqué), ou
 *               `undefined` si le slug n'existe pas.
 * @param locale Locale de la fiche — l'anglais a ses propres intitulés.
 */
export function coachOgOptions(
    member: Instructor | undefined,
    locale: Locale
): OgImageOptions {
    if (!member) return GENERIC_CARD[locale];

    const specialties = member.specialties
        .filter((item) => item.trim().length > 0)
        .slice(0, 4);

    return {
        eyebrow: locale === 'en' ? 'STUNT PERFORMER PROFILE' : 'FICHE CASCADEUR',
        title: member.name,
        subtitle: member.title,
        metrics: specialties.length > 0 ? specialties : [member.role],
    };
}
