/**
 * Contrats & helpers purs de l'édition des crédits (TeamView).
 *
 * Module sans React (aucun JSX, aucun état) : sérialisation de la chaîne
 * « Titre — Rôle » persistée dans `notable_credits`, rôles canoniques et
 * contrats des composants d'édition (`team-view/**`).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import type { FilmCredit } from '@/types';

/** Rôles canoniques proposés pour un crédit film. */
export const ROLE_OPTIONS = [
    'Cascadeur',
    'Doublure',
    'Coordinateur des cascades',
] as const;

export type CanonicalRoleOption = (typeof ROLE_OPTIONS)[number];

/** Construit la chaîne "Titre — Rôle" persistée dans notable_credits. */
export function buildCreditString(title: string, role: string): string {
    const cleanTitle = title.trim();
    const cleanRole = role.trim();
    if (!cleanTitle) return '';
    return cleanRole ? `${cleanTitle} — ${cleanRole}` : cleanTitle;
}

/** Extrait le rôle d'une chaîne "Titre — Rôle" (ou "Titre - Rôle"). */
export function extractRoleFromCredit(raw: string): string {
    const parts = raw.split(/\s+[—–-]\s+/);
    if (parts.length < 2) return '';
    return parts.slice(1).join(' — ').trim();
}

/* ------------------------------------------------------------------ *
 * Contrats des composants d'édition (props minimales, typage structurel)
 * ------------------------------------------------------------------ */

/** Entrée de l'index des crédits (`Map` clé normalisée → crédit). */
export interface TeamCreditIndexEntry {
    raw: string;
    title: string;
    role: string;
}

/** Ligne « Tous les crédits » (catalogue ou hors catalogue). */
export interface TeamCreditRow {
    raw: string;
    title: string;
    role: string;
    key: string;
    year?: string | number | null;
    inCatalogue: boolean;
}

/** Entrée « mise en avant » (l'ordre du tableau fait foi). */
export interface TeamFeaturedEntry {
    key: string;
}

/** Brouillon de création d'une fiche film depuis la recherche sans résultat. */
export interface NewFilmDraft {
    title: string;
    year: string;
    category: FilmCredit['category'];
}
