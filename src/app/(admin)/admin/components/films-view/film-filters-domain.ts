/**
 * ==============================================================================
 * CUC Cockpit — Domaine de classification et filtrage de la filmographie
 * ==============================================================================
 * Fonctions pures déterministes pour classer les films :
 * - Vue par défaut : films coordonnés / réalisés par Lucas DOLLFUS.
 * - Vue coordonnés CUC : tous les projets avec coordination cascades CUC.
 * - Vue participations Lucas : ensemble des films où Lucas a œuvré (cascades, doublures, etc.).
 * - Vue intégrale : 570+ films en base de données.
 * - Filtrage ciblé par coach (« qui a bossé dans quoi »).
 * - Résolution propre des coordinateurs et des comédiens doublés.
 */

import type { FilmCredit, Instructor } from '@/types';

export type FilmViewPreset = 'lucas-coord' | 'all-coord' | 'lucas-all' | 'all';

export const LUCAS_DOLLFUS_ID = 'lucas-dollfus';

/** Vérifie si un texte contient une mention de coordination ou direction d'action. */
function hasCoordinationKeyword(text?: string): boolean {
    if (!text) return false;
    const lower = text.toLowerCase();
    return (
        lower.includes('coordinat') ||
        lower.includes('action designer') ||
        lower.includes('action director') ||
        lower.includes('directeur des cascades') ||
        lower.includes('responsable cascades') ||
        lower.includes('superviseur des cascades')
    );
}

/**
 * Détermine si le film est coordonné ou réalisé par Lucas DOLLFUS.
 * Vérifie le réalisateur, les rôles d'équipe CUC, et les cascades mentionnées.
 */
export function isLucasCoordinated(film: FilmCredit): boolean {
    // 1. Réalisé par Lucas Dollfus
    const director = (film.director || '').toLowerCase();
    if (director.includes('lucas') && director.includes('dollfus')) {
        return true;
    }

    // 2. Rôle explicite de Lucas Dollfus dans cuc_team_roles
    const lucasRole = film.cuc_team_roles?.[LUCAS_DOLLFUS_ID] || film.cuc_team_roles?.['lucas'];
    if (hasCoordinationKeyword(lucasRole)) {
        return true;
    }

    // 3. Implication de Lucas + cascades contenant "coordination"
    const isLucasInvolved =
        (film.cuc_team_involved && (film.cuc_team_involved.includes(LUCAS_DOLLFUS_ID) || film.cuc_team_involved.includes('lucas'))) ||
        (film.instructor_ids && (film.instructor_ids.includes(LUCAS_DOLLFUS_ID) || film.instructor_ids.includes('lucas')));

    if (isLucasInvolved && hasCoordinationKeyword(film.stuntRoles)) {
        return true;
    }

    return false;
}

/**
 * Détermine si un membre de l'équipe CUC (Lucas ou un autre coach)
 * a assuré la coordination des cascades sur le film.
 */
export function isAnyCucCoordinated(film: FilmCredit): boolean {
    if (isLucasCoordinated(film)) return true;

    // Rôles dans cuc_team_roles
    if (film.cuc_team_roles) {
        for (const role of Object.values(film.cuc_team_roles)) {
            if (hasCoordinationKeyword(role)) return true;
        }
    }

    // Coordination globale déclarée avec une équipe CUC présente
    if (
        (film.cuc_team_involved && film.cuc_team_involved.length > 0) ||
        (film.instructor_ids && film.instructor_ids.length > 0)
    ) {
        if (hasCoordinationKeyword(film.stuntRoles)) return true;
    }

    return false;
}

/**
 * Détermine si Lucas DOLLFUS a participé à la production (tous rôles confondus :
 * coordination, doublure, cascadeur, réglage...).
 */
export function isLucasInvolved(film: FilmCredit): boolean {
    if (isLucasCoordinated(film)) return true;

    if (
        film.cuc_team_involved?.includes(LUCAS_DOLLFUS_ID) ||
        film.cuc_team_involved?.includes('lucas') ||
        film.instructor_ids?.includes(LUCAS_DOLLFUS_ID) ||
        film.instructor_ids?.includes('lucas')
    ) {
        return true;
    }

    if (film.cuc_team_roles?.[LUCAS_DOLLFUS_ID] || film.cuc_team_roles?.['lucas']) {
        return true;
    }

    if (film.doubledActors?.some((a) => a.toLowerCase().includes('lucas'))) {
        return true;
    }

    return false;
}

/**
 * Détermine si un coach spécifique a participé au film.
 */
export function isCoachInvolved(film: FilmCredit, coachId: string): boolean {
    if (!coachId) return true;
    if (coachId === LUCAS_DOLLFUS_ID) {
        return isLucasInvolved(film);
    }
    return Boolean(
        film.cuc_team_involved?.includes(coachId) ||
        film.instructor_ids?.includes(coachId) ||
        film.cuc_team_roles?.[coachId]
    );
}

/**
 * Résout les coordinateurs identifiés sur ce film.
 */
export function resolveCoordinators(film: FilmCredit, team: Instructor[] = []): string[] {
    const coords: string[] = [];

    // Réalisateur si Lucas
    const director = film.director || '';
    if (director.toLowerCase().includes('lucas') && director.toLowerCase().includes('dollfus')) {
        coords.push(director);
    }

    // Rôles dans cuc_team_roles
    if (film.cuc_team_roles) {
        for (const [coachId, role] of Object.entries(film.cuc_team_roles)) {
            if (hasCoordinationKeyword(role)) {
                const member = team.find((t) => t.id === coachId);
                const name = member?.name || (coachId === LUCAS_DOLLFUS_ID ? 'Lucas Dollfus' : coachId);
                if (!coords.includes(name)) {
                    coords.push(name);
                }
            }
        }
    }

    // Si aucun coordinateur explicite dans les rôles d'équipe mais que Lucas est impliqué
    // et que le texte mentionne la coordination
    if (coords.length === 0 && isLucasCoordinated(film)) {
        coords.push('Lucas Dollfus');
    }

    return coords;
}

export interface ResolvedTeamRole {
    coachId: string;
    coachName: string;
    role: string;
    isCoordinator: boolean;
    isDouble: boolean;
}

/**
 * Résout la liste complète et précise des intervenants CUC avec leur rôle
 * sur ce film (« qui a bossé dans quoi »).
 */
export function resolveFilmTeamRoles(
    film: FilmCredit,
    team: Instructor[] = []
): ResolvedTeamRole[] {
    const involvedIds = new Set<string>();

    (film.cuc_team_involved || []).forEach((id) => involvedIds.add(id));
    (film.instructor_ids || []).forEach((id) => involvedIds.add(id));
    if (film.cuc_team_roles) {
        Object.keys(film.cuc_team_roles).forEach((id) => involvedIds.add(id));
    }

    const result: ResolvedTeamRole[] = [];

    for (const coachId of involvedIds) {
        const member = team.find((t) => t.id === coachId);
        const name = member?.name || (coachId === LUCAS_DOLLFUS_ID ? 'Lucas Dollfus' : coachId);
        const role =
            film.cuc_team_roles?.[coachId] ||
            (member?.title.toLowerCase().includes('coordinateur')
                ? 'Coordinateur des cascades'
                : 'Cascadeur');

        const isCoordinator = hasCoordinationKeyword(role);
        const isDouble = role.toLowerCase().includes('doublure');

        result.push({
            coachId,
            coachName: name,
            role,
            isCoordinator,
            isDouble,
        });
    }

    // Trier les coordinateurs en premier, puis les doublures, puis les cascadeurs
    return result.sort((a, b) => {
        if (a.isCoordinator && !b.isCoordinator) return -1;
        if (!a.isCoordinator && b.isCoordinator) return 1;
        if (a.isDouble && !b.isDouble) return -1;
        if (!a.isDouble && b.isDouble) return 1;
        return a.coachName.localeCompare(b.coachName, 'fr');
    });
}
