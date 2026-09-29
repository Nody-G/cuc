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
    'Assistant coordinateur des cascades',
    'Coordinateur de rigging',
    'Rigger',
    'Cascadeur mécanique',
] as const;

export type CanonicalRoleOption = (typeof ROLE_OPTIONS)[number];

/**
 * Libellés courts des rôles, pour les sélecteurs compacts de la ligne de crédit.
 *
 * Source unique de vérité : chaque rôle possède un libellé **distinct**. Avant,
 * le rendu retombait sur `« Casc. »` dès qu'un rôle n'était ni « Coordinateur
 * des cascades » ni « Doublure », d'où l'affichage « casc. casc. casc. ».
 * Le libellé complet reste porté par l'attribut `title` (tooltip) et n'est donc
 * jamais perdu.
 */
export const ROLE_SHORT_LABELS: Record<CanonicalRoleOption, string> = {
    'Cascadeur': 'Casc.',
    'Doublure': 'Doubl.',
    'Coordinateur des cascades': 'Coord.',
    'Assistant coordinateur des cascades': 'Assist.',
    'Coordinateur de rigging': 'Coord. rig.',
    'Rigger': 'Rigg.',
    'Cascadeur mécanique': 'Méca.',
};

/** Libellé court d'un rôle ; repli sur le libellé complet si le rôle est inconnu. */
export function roleShortLabel(role: string): string {
    return (ROLE_SHORT_LABELS as Record<string, string>)[role] ?? role;
}

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
