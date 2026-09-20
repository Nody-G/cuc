/**
 * Clé canonique d'un TITRE d'œuvre, partagée par le Cockpit, la fiche publique
 * et la couche de notoriété.
 *
 * Pourquoi un helper unique : la mise en avant (`featured_credits`) est stockée
 * comme une chaîne « Titre (Année) — Rôle », alors que le catalogue
 * (`site_films.title`) ne contient que le titre nu. Sans normalisation
 * commune, AUCUN crédit ne correspond au catalogue — c'est exactement le bug
 * qui rendait la mise en avant inopérante pour Michel Bouis (44 crédits,
 * 0 correspondance).
 *
 * Règles appliquées, dans l'ordre :
 *  1. Retrait du suffixe d'année finale : « Lupin (2021) » → « Lupin ».
 *     Gère aussi « Titre (2021-2023) » et « Titre (2021–2023) ».
 *  2. Suppression des accents (NFD + retrait des diacritiques).
 *  3. Minuscules.
 *  4. Remplacement de toute ponctuation par un espace.
 *  5. Compactage des espaces multiples.
 *
 * Le résultat est volontairement identique pour « Lupin », « Lupin (2021) »
 * et « lupin  » : c'est la garantie que la mise en avant est reconnue partout.
 */
export function creditTitleKey(title: string): string {
    if (!title) return '';
    return title
        .trim()
        // 1. Suffixe d'année finale, avec ou sans plage : (2021) / (2021-2023).
        .replace(/\s*\(\s*\d{4}\s*(?:[-–—]\s*\d{4}\s*)?\)\s*$/, '')
        // 2. Accents.
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // 3. Casse.
        .toLowerCase()
        // 4. Ponctuation → espace (apostrophes, tirets, deux-points, etc.).
        .replace(/[^a-z0-9]+/g, ' ')
        // 5. Espaces multiples.
        .replace(/\s+/g, ' ')
        .trim();
}
