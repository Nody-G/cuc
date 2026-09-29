/**
 * Normalisation des paramètres de lecture du journal — fonctions pures.
 *
 * Extraites de la Server Action pour deux raisons : un fichier marqué
 * `'use server'` n'accepte que des exports **asynchrones** (contrainte appliquée
 * par Next.js au chargement du module), et la validation d'une saisie
 * utilisateur relève de la couche « Domaine » — donc testable sans base ni React
 * (`AGENTS.md` § 1).
 */

import type { LogQuery } from './types';

export const DEFAULT_LOG_LIMIT = 60;
export const MAX_LOG_LIMIT = 200;
const MAX_SEARCH_LENGTH = 80;

/**
 * Nettoie une recherche plein texte.
 *
 * La virgule et les parenthèses délimitent la grammaire du filtre `or=(…)` de
 * PostgREST : les laisser passer provoquait une erreur de syntaxe, donc un écran
 * vide dont la cause était invisible — exactement le genre de panne silencieuse
 * que ce journal doit rendre impossible.
 */
export function sanitizeSearchTerm(term: string): string {
    return term
        .replace(/[,()\\]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, MAX_SEARCH_LENGTH);
}

/** Borne une pagination à un intervalle sûr (jamais 0, jamais l'infini). */
export function clampLogLimit(value: number | undefined): number {
    if (!value || value <= 0) return DEFAULT_LOG_LIMIT;
    return Math.min(Math.floor(value), MAX_LOG_LIMIT);
}

/** Décalage de pagination : jamais négatif, jamais fractionnaire. */
export function clampLogOffset(value: number | undefined): number {
    if (!value || value <= 0) return 0;
    return Math.floor(value);
}

/** Les critères contiennent-ils au moins un filtre actif ? */
export function hasActiveLogFilters(query: LogQuery): boolean {
    return Boolean(
        (query.levels && query.levels.length > 0) ||
        (query.sources && query.sources.length > 0) ||
        (query.categories && query.categories.length > 0) ||
        (query.search && query.search.trim().length > 0) ||
        query.since ||
        query.target,
    );
}
