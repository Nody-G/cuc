/**
 * Listes séparées par des virgules — analyse, formatage et normalisation.
 *
 * Couche « Domaine » (`AGENTS.md` § 1) : fonctions pures, sans React.
 *
 * Pourquoi ce module existe : plusieurs champs du Cockpit (matériel d'une
 * discipline, spécialités et doublures d'un coach, comédiens doublés d'un film)
 * stockent une liste mais s'éditent dans un seul champ texte. Les réécrire
 * (`join(', ')` → `split(',')`) **à chaque frappe** fait diverger la valeur du
 * texte tapé : React réinjecte alors la valeur et replace le curseur en fin de
 * champ — impossible de corriger le milieu d'une ligne. L'analyse reste donc
 * ici, distincte de l'affichage, pour que la saisie ne soit jamais réécrite.
 */

/** Sépare sur les virgules, retire les espaces superflus et les entrées vides. */
export function parseCommaList(input: string): string[] {
    return input
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}

/** Rend une liste sous sa forme canonique `a, b, c`. */
export function formatCommaList(items: readonly string[] | null | undefined): string {
    if (!Array.isArray(items)) return '';
    return items
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .join(', ');
}

/**
 * Tolère les formes héritées : tableau, chaîne déjà sérialisée, ou valeur
 * inattendue. Évite les `as unknown as string` des éditeurs.
 */
export function coerceStringList(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value
            .filter((item): item is string => typeof item === 'string')
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }
    if (typeof value === 'string') return parseCommaList(value);
    return [];
}
