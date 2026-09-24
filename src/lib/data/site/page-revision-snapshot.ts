/**
 * ==============================================================================
 * CUC — Instantané de révision de page (domaine, pur)
 * ==============================================================================
 * Ce module décide **ce qu'est** une révision : les champs conservés, le numéro
 * suivant, le libellé lisible. Il ne touche ni à la base ni à React, ce qui
 * permet de vérifier par test le contrat réellement nécessaire à la
 * restauration — c'est là que se joue la vérité du panneau « Historique des
 * versions » du Cockpit.
 *
 * Invariant : **tout champ restauré doit être dans l'instantané**. Un champ
 * conservé nulle part ne pourra jamais être restitué, quelle que soit
 * l'interface.
 */

/**
 * Champs réellement conservés dans un instantané — **la même liste pilote la
 * restauration** (`restorePageRevision`) : un champ ajouté ici est restaurable,
 * un champ oublié ici ne le sera jamais. Une seule source, donc aucun écart
 * possible entre ce qu'on sauvegarde et ce qu'on rend.
 */
export const PAGE_REVISION_FIELDS = [
    'title',
    'meta_title',
    'meta_description',
    'og_image',
    'hero',
    'sections',
    'layout_sections',
    'sections_data',
    'is_published',
] as const;

export type PageRevisionField = (typeof PAGE_REVISION_FIELDS)[number];

/**
 * Entrée d'un instantané : la forme **telle qu'elle arrive réellement**, aussi
 * bien depuis une page lue en base que depuis la charge utile d'un
 * enregistrement (où `hero` est un objet brut). Aucune contrainte plus forte que
 * la réalité : un type plus strict que les données fait écrire du bricolage au
 * point d'appel.
 */
export interface PageRevisionSource {
    title: string;
    meta_title?: string;
    meta_description?: string;
    og_image?: string;
    hero?: object | null;
    sections?: unknown[] | null;
    layout_sections?: unknown[] | null;
    sections_data?: object | null;
    is_published?: boolean;
}

/** Champs d'une page conservés dans un instantané (mêmes clés qu'à la restauration). */
export interface PageRevisionSnapshot {
    title: string;
    meta_title?: string;
    meta_description?: string;
    og_image?: string;
    hero: object;
    sections: unknown[];
    layout_sections: unknown[];
    sections_data: object;
    is_published: boolean;
}

/**
 * Construit l'instantané d'une page enregistrée.
 *
 * Tous les champs que la restauration réécrit sont présents — y compris
 * `sections_data` et `layout_sections`, longtemps oubliés : une restauration
 * incomplète laissait les textes de sections dans leur état récent, ce qui donne
 * un « version précédente » qui n'en est pas une.
 */
export function buildRevisionSnapshot(page: PageRevisionSource): PageRevisionSnapshot {
    return {
        title: page.title,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        og_image: page.og_image,
        hero: page.hero && typeof page.hero === 'object' ? page.hero : {},
        sections: Array.isArray(page.sections) ? page.sections : [],
        layout_sections: Array.isArray(page.layout_sections) ? page.layout_sections : [],
        sections_data:
            page.sections_data && typeof page.sections_data === 'object'
                ? page.sections_data
                : {},
        is_published: page.is_published ?? true,
    };
}

/**
 * Libellé lisible d'une révision. Déterministe pour une date donnée (donc
 * testable) : « Enregistrement du 24/09/2026 à 13:24 ».
 */
export function buildRevisionLabel(date: Date = new Date()): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `Enregistrement du ${day}/${month}/${date.getFullYear()} à ${hours}:${minutes}`;
}

/** Numéro suivant d'une page : jamais un doublon, jamais zéro. */
export function nextRevisionNumber(existingNumbers: readonly number[]): number {
    const highest = existingNumbers.reduce(
        (max, value) => (Number.isFinite(value) && value > max ? value : max),
        0
    );
    return highest + 1;
}
