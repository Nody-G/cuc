import type { FilmCredit } from '@/types';

/**
 * ==============================================================================
 * Fusion de l'overlay EN d'une fiche film (entité `film`)
 * ==============================================================================
 * CONTEXTE — POURQUOI CE FICHIER EXISTE
 * -------------------------------------
 * Les synopsis anglais des films (501 chaînes dans `site_translations`) étaient
 * **semés mais jamais affichés** : aucun écran n'appliquait l'overlay `film`,
 * et `FilmDetailsModal` rendait `movie.description` brut, donc en français même
 * sur les pages anglaises.
 *
 * Le défaut est resté invisible au crawler parce que le synopsis n'apparaît que
 * dans une **modale cliente**, jamais dans le HTML initial. Seule une
 * vérification de câblage — ce fichier et ses appelants — pouvait le révéler.
 *
 * Règles (identiques aux autres overlays du projet) :
 *   - aucune invention : seules les clés présentes et non vides écrasent le FR ;
 *   - repli silencieux : sans overlay (FR, ou anglais non semé), la fiche reste
 *     affichée telle quelle, jamais de chaîne vide ;
 *   - aucune perte de fidélité : un overlay ne touche jamais `title`, `year`,
 *     `director` ni les liens (le titre d'un film est un nom propre).
 *
 * VOLUMÉTÉ : l'entité `film` compte plusieurs centaines de lignes, là où `team`
 * en compte 12. Le chargement est donc fait **côté client** (jamais dans le HTML
 * de toutes les pages) et **jamais en français** (le résolveur ne requête rien
 * en FR — cf. `useEntityOverlays`).
 * ==============================================================================
 */
export function applyFilmOverlay(
    film: FilmCredit,
    overlay?: Record<string, unknown> | null
): FilmCredit {
    if (!overlay) return film;

    const pickString = (value: unknown, fallback: string | undefined): string | undefined =>
        typeof value === 'string' && value.trim().length > 0 ? value : fallback;

    return {
        ...film,
        description: pickString(overlay.description, film.description),
        // La colonne source est `stunt_roles`, le champ public `stuntRoles`.
        stuntRoles: pickString(overlay.stunt_roles, film.stuntRoles) as string,
    };
}

/** Applique les overlays à une liste de films, indexés par identifiant. */
export function applyFilmOverlays(
    films: FilmCredit[],
    overlays?: Record<string, Record<string, unknown>> | null
): FilmCredit[] {
    if (!overlays) return films;
    return films.map((film) => applyFilmOverlay(film, overlays[film.id]));
}
