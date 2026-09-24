/**
 * ==============================================================================
 * CUC — Bloc de rôle d'une jaquette film (vitrine)
 * ==============================================================================
 * Construit le bloc « Rôle sur cette production » d'une jaquette à partir des
 * rôles CUC **réellement enregistrés** sur la production
 * (`site_films.metadata.cuc_team_roles`).
 *
 * Pourquoi ce module : l'accueil et la vitrine TOURNAGE n'affichent pas un coach
 * unique mais l'ensemble des rôles tenus par l'équipe CUC sur le film. La fiche
 * coach, elle, résout le rôle du coach concerné via `coach-films.ts`. Les deux
 * produisent le même objet `FilmCardRole` : le rendu (`FilmCard`) est donc
 * identique sur toutes les surfaces publiques.
 */

import { summarizeFilmRoleSet } from '@/lib/credit-role';
import { renderRoleSet, type RoleTranslator } from '@/lib/i18n/role-labels';
import type { FilmCardRole } from './FilmCard';

/**
 * Bloc de rôle CUC d'un film, ou `null` si aucun rôle n'est enregistré (mieux
 * vaut aucune affirmation qu'une invention — doctrine « pas de rôle inventé »).
 */
export function buildCucRoleBlock(
    roles: Record<string, string> | null | undefined,
    label: string,
    t: RoleTranslator
): FilmCardRole | null {
    const summary = summarizeFilmRoleSet(roles);
    if (summary.roles.length === 0) return null;

    const variant: FilmCardRole['variant'] = summary.roles.includes('Coordinateur des cascades')
        ? 'coord'
        : summary.roles.includes('Doublure')
            ? 'doublure'
            : 'other';

    return { label, value: renderRoleSet(summary, t), variant };
}
