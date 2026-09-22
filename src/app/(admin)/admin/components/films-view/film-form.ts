/**
 * Domaine de l'éditeur de films : normalisation des comédiens doublés et
 * fabrique de nouveau projet. Module pur (`AGENTS.md` § 1).
 */
import type { FilmCredit } from '@/types';

/**
 * Normalise les comédiens doublés : tableau, chaîne CSV héritée (anciennes
 * fiches) ou vide. Aucun nom n'est inventé.
 */
export function normalizeDoubledActors(film: FilmCredit): string[] {
    const raw: unknown = (film as { doubledActors?: unknown }).doubledActors;
    if (Array.isArray(raw)) return raw as string[];
    if (typeof raw === 'string') {
        return raw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }
    return [];
}

/** Nouveau projet pré-rempli (valeurs neutres, jamais publiées telles quelles). */
export function createEmptyFilm(): FilmCredit {
    return {
        id: `film-${Date.now()}`,
        title: '',
        year: '2025',
        category: 'Film',
        stuntRoles: 'Cascades physiques, combats, chutes',
        highlight: false,
        image: '',
        tag: 'NOUVEAU',
        imdbUrl: '',
        allocineUrl: '',
        trailerUrl: '',
    };
}
