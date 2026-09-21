/**
 * ==============================================================================
 * CUC — Catégories de films : SOURCE UNIQUE DE VÉRITÉ
 * ==============================================================================
 * Doctrine éditoriale — « Zéro gadget UI creux » et « Zéro invention ».
 *
 * Le site n'affiche plus qu'une **seule distinction factuelle** entre les
 * œuvres du catalogue :
 *
 *     Film · Série · Court métrage
 *
 * L'ancien vocabulaire marketing (`Blockbuster`, `Cinéma International`,
 * `Cinéma Français`, `Film Culte`, `Streaming Global`, `Série / Plateforme`,
 * `Show & Événement`) est **banni**. `normalizeFilmCategory()` le convertit
 * silencieusement en catégorie factuelle afin qu'une valeur héritée encore
 * présente en base ne puisse jamais réapparaître à l'écran.
 *
 * Cas particulier assumé : une œuvre peut n'avoir **aucune** catégorie
 * (`''`). `metadata.title_type` d'IMDb distingue en effet des natures qui
 * n'ont pas d'équivalent honnête dans la seule distinction autorisée :
 * clips musicaux (`musicVideo`), jeux vidéo (`videoGame`), podcasts
 * (`podcastSeries`). Plutôt que de forcer une étiquette fausse, on n'affiche
 * aucun badge — « une valeur fausse est pire qu'une valeur absente ».
 */

export const FILM_CATEGORIES = ['Film', 'Série', 'Court métrage'] as const;

export type FilmCategory = (typeof FILM_CATEGORIES)[number];

/** Catégorie non renseignée : aucun badge n'est affiché. */
export type FilmCategoryOrEmpty = FilmCategory | '';

/** Ancien vocabulaire → catégorie factuelle (repli explicite, jamais inventé). */
const LEGACY_TO_CATEGORY: Record<string, FilmCategory> = {
    Blockbuster: 'Film',
    'Blockbuster US': 'Film',
    Cinéma: 'Film',
    'Cinéma Français': 'Film',
    'Cinéma International': 'Film',
    'Film Culte': 'Film',
    'Streaming Global': 'Film',
    'Show & Événement': 'Film',
    Téléfilm: 'Film',
    Vidéo: 'Film',
    'Série / Plateforme': 'Série',
    'Série télévisée': 'Série',
    'Court-métrage': 'Court métrage',
    'Court métrage': 'Court métrage',
};

/** Clé de comparaison : sans accents, minuscules, espaces compactés. */
function comparisonKey(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

const NORMALIZED_LOOKUP: Record<string, FilmCategory> = Object.fromEntries(
    Object.entries(LEGACY_TO_CATEGORY).map(([legacy, category]) => [
        comparisonKey(legacy),
        category,
    ])
);

/** Vrai si la valeur appartient déjà au vocabulaire autorisé. */
export function isFilmCategory(value: unknown): value is FilmCategory {
    return typeof value === 'string' && (FILM_CATEGORIES as readonly string[]).includes(value);
}

/**
 * Vrai si la valeur appartient à l'ancien vocabulaire marketing (détection
 * réservée aux garde-fous et aux audits — jamais à l'affichage).
 */
export function isLegacyFilmCategory(value: unknown): boolean {
    if (typeof value !== 'string' || value.trim() === '') return false;
    if (isFilmCategory(value)) return false;
    return comparisonKey(value) in NORMALIZED_LOOKUP;
}

/**
 * Convertit n'importe quelle valeur en catégorie autorisée.
 * Renvoie `''` lorsque aucune correspondance factuelle n'existe.
 */
export function normalizeFilmCategory(value: unknown): FilmCategoryOrEmpty {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (trimmed === '') return '';
    if (isFilmCategory(trimmed)) return trimmed;
    return NORMALIZED_LOOKUP[comparisonKey(trimmed)] ?? '';
}
