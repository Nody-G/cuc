import type { Instructor } from '@/types';
import type { OgImageOptions } from '@/lib/og-image';
import type { Locale } from '@/lib/i18n/entities';
import { routeOgOptions } from '@/lib/og/route-og-copy';

/**
 * ==============================================================================
 * Contenu des images Open Graph des fiches coachs
 * (`/equipe-cascadeurs-pro/[slug]/opengraph-image.tsx`)
 * ==============================================================================
 * Fonction pure : mêmes entrées → même carte. Le chargement (catalogue + overlay
 * EN) vit dans la route OG ; ici, seul l'assemblage du visuel — nom, fonction et
 * spécialités du coach. Slug inconnu → repli générique, **la carte de la route
 * parente** (`route-og-copy.ts`) : une seule formulation par carte, jamais deux.
 */

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
    if (!member) return routeOgOptions('equipe-cascadeurs-pro', locale);

    const specialties = member.specialties
        .filter((item) => item.trim().length > 0)
        .slice(0, 4);

    return {
        eyebrow: locale === 'en' ? 'STUNT PERFORMER PROFILE' : 'FICHE CASCADEUR',
        title: member.name,
        subtitle: member.title,
        metrics: specialties.length > 0 ? specialties : [member.role],
        locale,
    };
}
