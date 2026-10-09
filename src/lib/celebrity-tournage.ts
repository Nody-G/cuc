/**
 * Sélection et ordre canonique des comédiens doublés pour la page TOURNAGES
 * (/cuc-team-cascadeur).
 *
 * Règle demandée : afficher exclusivement la sélection de 16 comédiens coordonnés
 * par Lucas Dollfus / CUC Team, dans l'ordre strict validé, sans supprimer les
 * autres comédiens du catalogue général (conservés pour les fiches coachs et l'annuaire).
 */

import type { DoubledCelebrity } from '@/types';

/**
 * Identifiants canoniques des 16 comédiens doublés de la page Tournages,
 * dans l'ordre strict demandé par Lucas Dollfus.
 */
export const CUC_TOURNAGE_CELEBRITIES_ORDER: readonly string[] = [
    'gilles-lellouche',
    'adele-exarchopoulos',
    'francois-civil',
    'pio-marmai',
    'nassim-lyes',
    'zoe-marchal',
    'sabrina-ouazani',
    'ramzy-bedia',
    'francois-cluzet',
    'eric-cantona',
    'jeanne-goursaud',
    'ichem-bougheraba',
    'romain-duris',
    'fadily-camara',
    'alice-isaaz',
    'camille-razat',
] as const;

/**
 * Productions spécifiques associées au contexte de tournage de Lucas.
 */
export const CUC_TOURNAGE_PROJECTS_OVERRIDE: Readonly<Record<string, readonly string[]>> = {
    'gilles-lellouche': ["L'Amour ouf"],
    'adele-exarchopoulos': ["L'Amour ouf", 'Chien 51'],
    'francois-civil': ["L'Amour ouf"],
    'pio-marmai': ['Néro (Netflix)'],
    'nassim-lyes': ['Nouveaux riches', 'Bagarre'],
    'zoe-marchal': ['Nouveaux riches', 'Coka Chicas'],
    'sabrina-ouazani': ['Stunts (série France TV)'],
    'ramzy-bedia': ['Bagarre'],
    'francois-cluzet': ['Pour le plaisir'],
    'eric-cantona': ['La nirvana'],
    'jeanne-goursaud': ['Stunts (série France TV)'],
    'ichem-bougheraba': ['Sous écrous', 'La nirvana'],
    'romain-duris': ['Chien 51'],
    'fadily-camara': ['Coka Chicas'],
    'alice-isaaz': ['Néro (Netflix)'],
    'camille-razat': ['Néro (Netflix)'],
};

/**
 * Filtre et ordonne la liste des comédiens pour la page Tournages.
 *
 * Fonction pure et déterministe (SRP) : ne mute pas le tableau d'entrée.
 * Si un comédien du catalogue possède des productions adaptées au tournage,
 * elles sont substituées pour la vue Tournages.
 */
export function selectTournageCelebrities(
    allCelebrities: readonly DoubledCelebrity[]
): DoubledCelebrity[] {
    if (!allCelebrities || allCelebrities.length === 0) return [];

    const map = new Map<string, DoubledCelebrity>();
    for (const celeb of allCelebrities) {
        if (!celeb?.id) continue;
        map.set(celeb.id, celeb);
        if (celeb.id === 'camille-razat') {
            map.set('camille-rozat', celeb);
        }
    }

    const selected: DoubledCelebrity[] = [];
    for (const id of CUC_TOURNAGE_CELEBRITIES_ORDER) {
        const found = map.get(id);
        if (found) {
            const overrideProds = CUC_TOURNAGE_PROJECTS_OVERRIDE[id];
            selected.push(
                overrideProds
                    ? { ...found, productions: [...overrideProds] }
                    : { ...found }
            );
        }
    }

    return selected;
}
