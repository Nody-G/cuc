import type { CanonicalRole, RoleSetSummary } from '@/lib/credit-role';

/**
 * ==============================================================================
 * CUC — Rendu traduit des rôles de plateau
 * ==============================================================================
 * Les trois rôles canoniques (« Coordinateur des cascades », « Doublure »,
 * « Cascadeur ») sont calculés sans langue par `@/lib/credit-role`. Leur rendu
 * passe ici, sur les clés déjà traduites du namespace `team`
 * (`roleCoordination`, `roleDouble`, `roleStunt`, `roleDoubleOf`).
 *
 * Pourquoi cette séparation : les libellés étaient écrits en dur en français et
 * s'affichaient tels quels sur les pages anglaises (fiche film, fiche coach,
 * légendes de jaquettes de l'accueil).
 */

/** Signature minimale d'un traducteur `next-intl` du namespace `team`. */
export type RoleTranslator = (
    key:
        | 'roleCoordination'
        | 'roleAssistantCoordination'
        | 'roleRiggingCoordination'
        | 'roleRigger'
        | 'roleMechanicalStunt'
        | 'roleDouble'
        | 'roleStunt'
        | 'roleDoubleOf',
    values?: { names: string }
) => string;

/** Libellé traduit d'un rôle canonique, comédiens doublés inclus. */
export function roleLabel(
    role: CanonicalRole,
    doubledActors: string[],
    t: RoleTranslator
): string {
    switch (role) {
        case 'Coordinateur des cascades':
            return t('roleCoordination');
        case 'Assistant coordinateur des cascades':
            return t('roleAssistantCoordination');
        case 'Coordinateur de rigging':
            return t('roleRiggingCoordination');
        case 'Rigger':
            return t('roleRigger');
        case 'Cascadeur mécanique':
            return t('roleMechanicalStunt');
        case 'Doublure':
            return doubledActors.length > 0
                ? t('roleDoubleOf', { names: doubledActors.join(', ') })
                : t('roleDouble');
        default:
            return t('roleStunt');
    }
}

/**
 * Légende traduite d'une production, à partir des rôles enregistrés.
 * Renvoie une chaîne vide si aucun rôle n'est enregistré.
 */
export function renderRoleSet(summary: RoleSetSummary, t: RoleTranslator): string {
    return summary.roles.map((role) => roleLabel(role, summary.doubledActors, t)).join(' · ');
}
