/**
 * Domaine de la fiche film : rôle d'un membre CUC pour un film donné.
 * Fonction pure, sans dépendance UI — testable hors du cycle de vie React.
 */

import type { FilmCredit, Instructor } from '@/types';

/**
 * Rôle brut d'un membre pour ce film, par ordre de priorité :
 * 1. rôle qualifié saisi dans le Cockpit (`movie.cuc_team_roles`) ;
 * 2. rôle enregistré dans les métadonnées du membre (`member.metadata.film_roles`) ;
 * 3. crédit notable citant le film au format « Titre — Rôle » ;
 * 4. rôle par défaut du membre.
 *
 * Le résultat est un libellé **brut** : la normalisation puis la traduction
 * restent à la charge de la couche d'affichage.
 */
export function resolveMemberRawRole(movie: FilmCredit, member: Instructor): string {
    const fromMovie = movie.cuc_team_roles?.[member.id];
    if (fromMovie) return fromMovie;

    const fromMetadata = member.metadata?.film_roles?.[movie.id];
    if (fromMetadata) return fromMetadata;

    const matchingCredit = member.notableCredits?.find((credit) =>
        credit.toLowerCase().includes(movie.title.toLowerCase())
    );
    if (matchingCredit && matchingCredit.includes(' — ')) {
        return matchingCredit.split(' — ')[1].trim();
    }

    return member.role;
}
