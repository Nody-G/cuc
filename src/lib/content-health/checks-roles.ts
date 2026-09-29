/**
 * Famille `incomplete-roles` — compléments éditoriaux à saisir.
 *
 * Objectif : donner à la direction un endroit **unique et en lecture seule** où
 * voir ce qui manque sur les rôles CUC dans les films (qui a fait quoi, quelle
 * doublure pour quel comédien), sans rien modifier ni dégrader le score
 * technique — la famille est exemptée du score (voir `SCORE_EXEMPT_KINDS`).
 *
 * Cinq règles, toutes calculées à partir de données existantes :
 *   1. Coach cité par un film mais sans rôle renseigné.
 *   2. Libellé « Doublure » nu : on sait qu'il a doublé, jamais qui.
 *   3. Identifiant de coach cité par un film mais absent de l'équipe.
 *   4. Côté coach : doublures déclarées, mais aucun crédit de doublure en film.
 *   5. Côté coach : comédien doublé sans fiche au catalogue.
 *
 * Aucun contenu n'est inventé : ce module ne fait que constater l'absence.
 */

import { normalizeRole } from '@/lib/credit-role';
import {
    buildCelebrityIndex,
    isNonActorDoubledEntry,
    resolveCelebrityByActorName,
} from '@/lib/celebrity-match';
import type { DoubledCelebrity, FilmCredit, Instructor } from '@/types';
import type { PushIssue } from './types';

export interface CheckRolesArgs {
    pushIssue: PushIssue;
    films?: FilmCredit[];
    team?: Instructor[];
    celebrities?: DoubledCelebrity[];
}

/**
 * « Doublure » ou « Doublure de », sans comédien nommé.
 *
 * On ne signale QUE ce libellé nu : « Doublure combats » désigne une
 * spécialité, pas un comédien manquant — le confondre créerait du bruit.
 */
const BARE_DOUBLURE_LABEL = /^doublure(\s+de)?$/i;

/** 1 à 5 : rôles et doublures manquants dans le catalogue éditorial. */
export function checkContentRoles({
    pushIssue,
    films = [],
    team = [],
    celebrities = [],
}: CheckRolesArgs): void {
    if (films.length === 0 && team.length === 0) return;

    const coachNames = new Map(team.map((member) => [member.id, member.name]));
    const celebrityIndex = buildCelebrityIndex(celebrities);
    /** Nombre de crédits de doublure réellement présents, par coach. */
    const doublureCreditsByCoach = new Map<string, number>();

    films.forEach((film) => {
        const roles = film.cuc_team_roles ?? {};
        const involved = film.cuc_team_involved ?? [];
        const label = film.title || film.id;

        involved.forEach((coachId) => {
            const coachName = coachNames.get(coachId);
            if (!coachName) {
                // Règle 3 : identifiant inconnu — donnée à corriger, pas à compléter.
                pushIssue({
                    kind: 'incomplete-roles',
                    severity: 'error',
                    scope: 'Filmographie',
                    label,
                    message: `Film « ${label} » : intervenant « ${coachId} » absent de l'équipe.`,
                    value: `${film.id}:${coachId}:intervenant-inconnu`,
                    hint: "Corrigez l'identifiant du formateur ou rattachez-le à l'équipe.",
                });
                return;
            }

            if (!roles[coachId]) {
                // Règle 1 : on sait qu'il est intervenu, on ignore à quel titre.
                pushIssue({
                    kind: 'incomplete-roles',
                    severity: 'warning',
                    scope: 'Filmographie',
                    label,
                    message: `Rôle inconnu pour ${coachName} sur « ${label} ».`,
                    value: `${film.id}:${coachId}:role-manquant`,
                    hint: 'Renseignez le rôle CUC (Cascadeur, Coordinateur des cascades, Doublure de X…).',
                });
            }
        });

        Object.entries(roles).forEach(([coachId, value]) => {
            const coachName = coachNames.get(coachId);
            if (!coachName) {
                pushIssue({
                    kind: 'incomplete-roles',
                    severity: 'error',
                    scope: 'Filmographie',
                    label,
                    message: `Film « ${label} » : rôle attribué à « ${coachId} », inconnu de l'équipe.`,
                    value: `${film.id}:${coachId}:role-inconnu`,
                    hint: "Corrigez l'identifiant du formateur ou rattachez-le à l'équipe.",
                });
                return;
            }

            const normalized = normalizeRole(value);
            if (!normalized.roles.includes('Doublure')) return;

            doublureCreditsByCoach.set(coachId, (doublureCreditsByCoach.get(coachId) ?? 0) + 1);

            if (normalized.doubledActors.length === 0 && BARE_DOUBLURE_LABEL.test(String(value).trim())) {
                // Règle 2 : doublure sans comédien nommé.
                pushIssue({
                    kind: 'incomplete-roles',
                    severity: 'info',
                    scope: 'Filmographie',
                    label,
                    message: `Doublure non nommée pour ${coachName} sur « ${label} » (rôle « ${value} »).`,
                    value: `${film.id}:${coachId}:doublure-sans-comedien`,
                    hint: 'Précisez le comédien doublé (ex. « Doublure de Tomer Sisley »).',
                });
            }
        });
    });

    team.forEach((member) => {
        const declared = (member.doubledActors ?? []).filter((name) => !isNonActorDoubledEntry(name));
        const label = member.name || member.id;

        if (declared.length > 0 && (doublureCreditsByCoach.get(member.id) ?? 0) === 0) {
            // Règle 4 : les deux sources ne racontent pas la même chose.
            pushIssue({
                kind: 'incomplete-roles',
                severity: 'info',
                scope: 'Équipe',
                label,
                message: `${label} déclare ${declared.length} comédien(s) doublé(s), mais aucun crédit de doublure dans les films.`,
                value: `${member.id}:coherence-doublures`,
                hint: 'Ajoutez le crédit « Doublure de X » sur le film concerné, ou retirez la mention de la fiche.',
            });
        }

        declared.forEach((name) => {
            if (resolveCelebrityByActorName(name, celebrityIndex)) return;
            // Règle 5 : le comédien existe côté coach, pas au catalogue.
            pushIssue({
                kind: 'incomplete-roles',
                severity: 'info',
                scope: 'Équipe',
                label,
                message: `Comédien « ${name} », doublé par ${label}, sans fiche au catalogue.`,
                value: `${member.id}:${name}`,
                hint: 'Créez la fiche du comédien au catalogue (photo, IMDb et biographie vérifiés).',
            });
        });
    });
}
