/**
 * Texte court d'une vignette de comédien doublé (vitrine).
 *
 * Couche `Domaine & Services` (`AGENTS.md` § 1) : fonction pure, déterministe
 * et testable hors du cycle de vie UI.
 *
 * Doctrine éditoriale — « Zéro invention » : on n'écrit jamais de description.
 * La spécialité déjà publiée (localisée FR/EN dans les messages) prime ; à
 * défaut, on réutilise la première phrase de la biographie vérifiée, tronquée
 * proprement à la fin d'un mot.
 */

export interface CelebrityCopyInput {
    /** Spécialité éditoriale localisée (messages `teamProduction.celebrities`). */
    specialty?: string;
    /** Biographie publiée du comédien — source de repli, restituée telle quelle. */
    bio?: string;
}

/** Plafond de la vignette : deux lignes sur six colonnes de grille. */
export const CELEBRITY_SHORT_DESCRIPTION_MAX_LENGTH = 110;

/** Première phrase d'un texte (ponctuation forte incluse), ou le texte entier. */
function firstSentence(text: string): string {
    const match = text.match(/^[\s\S]*?[.!?](?=\s|$)/);
    return (match ? match[0] : text).trim();
}

/** Tronque à la fin du dernier mot complet, sans jamais dépasser `max`. */
function truncateAtWord(text: string, max: number): string {
    if (text.length <= max) return text;
    const slice = text.slice(0, max - 1);
    const lastSpace = slice.lastIndexOf(' ');
    const kept = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
    return `${kept.trimEnd()}…`;
}

/**
 * Description courte affichée sur la vignette : spécialité si elle existe, sinon
 * première phrase de la biographie (espaces normalisés, longueur bornée).
 */
export function shortActorDescription({ specialty, bio }: CelebrityCopyInput): string {
    const curated = (specialty ?? '').trim();
    if (curated) return curated;

    const biography = (bio ?? '').replace(/\s+/g, ' ').trim();
    if (!biography) return '';

    return truncateAtWord(firstSentence(biography), CELEBRITY_SHORT_DESCRIPTION_MAX_LENGTH);
}
