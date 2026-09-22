/**
 * Types et constantes partagés de la fusion FR/EN — chargés des deux côtés de
 * la frontière serveur/client (aucun import `next/*` ni React).
 */

/** Locale éditoriale. `fr` est la source, `en` la traduction. */
export type LocaleCode = 'fr' | 'en';

/**
 * Clés techniques : jamais traduites. `id` sert d'ancre HTML et de clé React,
 * `slug` de segment d'URL — les traduire casserait la page.
 */
export const NEVER_TRANSLATED_KEYS = new Set(['id', 'slug', 'key', 'anchor']);

/** Motifs techniques : médias, liens, ordres, états, mesures. */
export const TECHNICAL_KEY =
    /(url|link|href|image|img|bg_|poster|logo|icon|video_url|_id|order|is_visible|is_active|show|count|number|price|date|phone|email|code)$/i;

/**
 * Racines du contenu de page jamais traduites :
 *   - `layout_sections` : libellés d'administration de la structure des blocs
 *     (leur ordre et leurs `id` pilotent le rendu public) ;
 *   - `og_image` : média ;
 *   - `slug`, `id`, `is_published`, horodatages : identité et état de la ligne.
 */
export const PAGE_LOCKED_ROOTS: readonly string[] = [
    'layout_sections',
    'og_image',
    'slug',
    'id',
    'is_published',
    'created_at',
    'updated_at',
    'published_at',
];

/** Options communes à l'analyse et à la production d'un overlay. */
export interface OverlayOptions {
    /** Racines jamais traduites. Par défaut : `PAGE_LOCKED_ROOTS`. */
    lockedRoots?: readonly string[];
}

/** Un tableau dont la structure a divergé du français (item ajouté ou retiré). */
export interface StaleArray {
    /** Chemin du tableau dans le contenu (ex. `sections_data.stages_catalogue.items`). */
    path: string;
    frLength: number;
    enLength: number;
    /** `true` si un item n'a plus le même `id` à la même position. */
    idMismatch: boolean;
}

/** Mesure de couverture d'une traduction, calculée sur les feuilles éditoriales. */
export interface TranslationCoverage {
    /** Nombre de feuilles à traduire (français + éventuelles feuilles ajoutées en EN). */
    total: number;
    /** Nombre de feuilles effectivement traduites (valeur différente du français). */
    translated: number;
    /** Pourcentage entier, borné à 100. */
    percent: number;
    /** Chemins restant à traduire (tronqués pour ne pas gonfler l'état React). */
    missing: string[];
    /** Tableaux dont la structure FR a bougé depuis la traduction. */
    staleArrays: StaleArray[];
}

/** Nombre maximal de chemins manquants conservés dans l'état du Cockpit. */
export const MISSING_PATHS_LIMIT = 50;
