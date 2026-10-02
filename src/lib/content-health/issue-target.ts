import type { ContentIssue } from './types';

/**
 * Résolution de la cible d'une anomalie de rôle.
 *
 * Les règles 1 à 3 de `checks-roles.ts` produisent une anomalie `scope:
 * 'Filmographie'` dont `value` commence par l'identifiant du film
 * (`<film.id>:<coachId>:<motif>`). Les règles 4 et 5 produisent des anomalies
 * `scope: 'Équipe'` **sans film** (`<member.id>:...`) : elles n'ont donc aucune
 * fiche de film à ouvrir.
 *
 * Ce module reste **pur** (aucune dépendance React, aucun accès réseau) afin
 * d'être testable hors du cycle de vie UI et réutilisable par l'orchestration.
 */

/** Périmètre des anomalies rattachées à un film du catalogue. */
const FILM_SCOPE = 'Filmographie';

/** Séparateur des segments de la valeur fautive (`filmId:coachId:motif`). */
const VALUE_SEPARATOR = ':';

/**
 * Vrai si l'anomalie désigne un film du catalogue.
 *
 * Seules les anomalies `scope: 'Filmographie'` portent un identifiant de film
 * en tête de `value` ; les anomalies « Équipe » en sont dépourvues.
 */
export function isFilmScopedIssue(issue: ContentIssue): boolean {
    return (
        issue.scope === FILM_SCOPE &&
        typeof issue.value === 'string' &&
        issue.value.trim().length > 0
    );
}

/**
 * Identifiant du film visé par une anomalie, ou `null` si l'anomalie ne cible
 * aucun film (anomalie « Équipe », valeur absente ou premier segment vide).
 *
 * On ne parse que le **premier** segment de `value` : les segments suivants
 * (`coachId`, motif) ne font pas partie de l'identifiant de film.
 */
export function resolveIssueFilmId(issue: ContentIssue): string | null {
    if (!isFilmScopedIssue(issue)) return null;

    const filmId = String(issue.value).split(VALUE_SEPARATOR)[0]?.trim() ?? '';
    return filmId.length > 0 ? filmId : null;
}
