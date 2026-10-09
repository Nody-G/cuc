/**
 * ==============================================================================
 * CUC Cockpit — Domaine de résolution des doublures & comédiens doublés
 * ==============================================================================
 * Fonctions pures déterministes pour lever toute ambiguïté sur :
 * - Le comédien / la personnalité doublée (ex: François Civil, Nassim Lyes).
 * - Le cascadeur / coach CUC qui réalise la doublure (ex: Bastien Trouvé, Jérôme Gaspard).
 * - Les notes spécifiques d'intervention (ex: Cascades Action, Combats Rapprochés).
 */

import type { FilmCredit, Instructor } from '@/types';
import { DOUBLED_CELEBRITIES } from '@/data/celebrities';

export interface ResolvedFilmDoubling {
    actorName: string;
    stuntDoubleName?: string;
    note?: string;
    formatted: string;
}

/**
 * Nettoie et extrait le nom d'un cascadeur depuis une chaîne type "Doublé par Bastien Trouvé".
 */
function extractDoubleNameFromText(text?: string): string | undefined {
    if (!text) return undefined;
    const match = text.match(/(?:doublé|doublée|double)\s+par\s+([^,;&()]+)/i);
    return match ? match[1].trim() : undefined;
}

/**
 * Trouve le nom lisible d'un coach à partir de son identifiant.
 */
function getCoachName(coachId: string, team: Instructor[] = []): string {
    const member = team.find((t) => t.id === coachId);
    if (member) return member.name;
    return coachId
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

/**
 * Résout la liste complète et sans ambiguïté des comédiens et de leurs doublures CUC sur un film.
 */
export function resolveFilmDoublings(
    film: FilmCredit,
    team: Instructor[] = []
): ResolvedFilmDoubling[] {
    const rawDoubledList = film.doubledActors || [];
    const results: ResolvedFilmDoubling[] = [];
    const seenActors = new Set<string>();

    for (const raw of rawDoubledList) {
        if (!raw || typeof raw !== 'string') continue;
        const trimmed = raw.trim();
        if (!trimmed) continue;

        let actorName = trimmed;
        let stuntDoubleName: string | undefined;
        let note: string | undefined;

        // 1. Détection format : "Acteur (doublé par Cascadeur)"
        const matchDouble = trimmed.match(/^(.*?)\s*\((?:doublé|doublée|double)\s+par\s+(.*?)\)\s*$/i);
        if (matchDouble) {
            actorName = matchDouble[1].trim();
            stuntDoubleName = matchDouble[2].trim();
        } else {
            // 2. Détection d'une note entre parenthèses, ex: "Adèle Exarchopoulos (Cascades Action)"
            const matchNote = trimmed.match(/^(.*?)\s*\((.*?)\)\s*$/);
            if (matchNote) {
                actorName = matchNote[1].trim();
                note = matchNote[2].trim();
            }
        }

        // 3. Si la doublure n'est pas encore identifiée, chercher dans les rôles CUC du film
        if (!stuntDoubleName && film.cuc_team_roles) {
            for (const [coachId, role] of Object.entries(film.cuc_team_roles)) {
                if (typeof role === 'string' && role.toLowerCase().includes('doublure de')) {
                    const targetActor = role.replace(/doublure de/i, '').trim();
                    if (targetActor.toLowerCase() === actorName.toLowerCase()) {
                        stuntDoubleName = getCoachName(coachId, team);
                        break;
                    }
                }
            }
        }

        // 4. Si toujours non identifiée et sans note explicite, croiser avec la base canonique DOUBLED_CELEBRITIES
        if (!stuntDoubleName && !note) {
            const celeb = DOUBLED_CELEBRITIES.find(
                (c) => c.name.toLowerCase() === actorName.toLowerCase()
            );
            if (celeb && celeb.stuntDoubles) {
                const candidateName = extractDoubleNameFromText(celeb.stuntDoubles);
                if (candidateName) {
                    stuntDoubleName = candidateName;
                }
            }
        }

        // 5. Cas de repli : s'il y a une seule personne avec rôle "Doublure" sur le film
        if (!stuntDoubleName && film.cuc_team_roles) {
            const singleDoubleEntry = Object.entries(film.cuc_team_roles).filter(
                ([, r]) => typeof r === 'string' && r.trim().toLowerCase() === 'doublure'
            );
            if (singleDoubleEntry.length === 1 && rawDoubledList.length === 1) {
                stuntDoubleName = getCoachName(singleDoubleEntry[0][0], team);
            }
        }

        seenActors.add(actorName.toLowerCase());

        const formatted = stuntDoubleName
            ? `${actorName} ➔ doublé par ${stuntDoubleName}${note ? ` (${note})` : ''}`
            : note
                ? `${actorName} (${note})`
                : actorName;

        results.push({
            actorName,
            stuntDoubleName,
            note,
            formatted,
        });
    }

    // 6. Inclure les doublures déclarées dans cuc_team_roles qui ne figureraient pas dans doubledActors
    if (film.cuc_team_roles) {
        for (const [coachId, role] of Object.entries(film.cuc_team_roles)) {
            if (typeof role === 'string' && role.toLowerCase().includes('doublure de')) {
                const targetActor = role.replace(/doublure de/i, '').trim();
                if (!seenActors.has(targetActor.toLowerCase())) {
                    seenActors.add(targetActor.toLowerCase());
                    const stuntDoubleName = getCoachName(coachId, team);
                    results.push({
                        actorName: targetActor,
                        stuntDoubleName,
                        formatted: `${targetActor} ➔ doublé par ${stuntDoubleName}`,
                    });
                }
            }
        }
    }

    return results;
}

/**
 * Enrichit le libellé d'un rôle (ex: "Doublure") pour préciser de quel acteur il s'agit.
 */
export function enrichTeamRoleWithDoubling(
    role: string,
    coachId: string,
    doublings: ResolvedFilmDoubling[],
    team: Instructor[] = []
): string {
    if (role.trim().toLowerCase() !== 'doublure') {
        return role;
    }

    const coachName = getCoachName(coachId, team).toLowerCase();
    const match = doublings.find(
        (d) => d.stuntDoubleName && d.stuntDoubleName.toLowerCase() === coachName
    );

    if (match) {
        return `Doublure de ${match.actorName}`;
    }

    return role;
}
