import { CANONICAL_ROLE_ORDER, normalizeRole, type CanonicalRole } from '@/lib/credit-role';

/**
 * Options du sélecteur de rôle de plateau (combobox de l'éditeur de film).
 *
 * Toutes les options **dérivent** de `CANONICAL_ROLE_ORDER` : aucune liste de
 * rôles divergente n'est maintenue ici. Seul le **regroupement** (pour la
 * lisibilité de la liste déroulante) est défini localement ; la saisie libre
 * reste possible et n'est jamais normalisée par ce module.
 *
 * Ce module est **pur** : aucune dépendance React, aucun accès réseau.
 */

/** Groupe d'affichage : libellé lisible + rôles canoniques qu'il contient. */
export interface RoleOptionGroup {
    label: string;
    roles: CanonicalRole[];
}

/** Rôle canonique → groupe d'affichage (clé de dérivation, pas une 2e liste). */
const ROLE_GROUP_BY_ROLE: Record<CanonicalRole, string> = {
    'Coordinateur des cascades': 'Coordination',
    'Assistant coordinateur des cascades': 'Coordination',
    'Coordinateur de rigging': 'Rigging',
    Rigger: 'Rigging',
    'Cascadeur mécanique': 'Cascade & doublure',
    Doublure: 'Cascade & doublure',
    Cascadeur: 'Cascade & doublure',
};

/** Ordre d'affichage des groupes dans la liste déroulante. */
const GROUP_ORDER: readonly string[] = ['Coordination', 'Rigging', 'Cascade & doublure'];

/**
 * Groupes de rôles, dérivés de `CANONICAL_ROLE_ORDER` : l'ordre interne de
 * chaque groupe suit l'ordre canonique, et aucun rôle n'est ajouté ni omis.
 */
export const ROLE_OPTION_GROUPS: RoleOptionGroup[] = GROUP_ORDER.map((label) => ({
    label,
    roles: CANONICAL_ROLE_ORDER.filter((role) => ROLE_GROUP_BY_ROLE[role] === label),
})).filter((group) => group.roles.length > 0);

/** Retire accents et casse pour une recherche robuste (ex. « mecanique »). */
function fold(value: string): string {
    return String(value ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

/**
 * Rôles canoniques correspondant à une recherche libre (accents et casse
 * ignorés). Requête vide → tous les rôles canoniques, dans l'ordre canonique.
 */
export function filterRoleOptions(query: string): CanonicalRole[] {
    const needle = fold(query);
    if (!needle) return [...CANONICAL_ROLE_ORDER];
    return CANONICAL_ROLE_ORDER.filter((role) => fold(role).includes(needle));
}

/**
 * Groupes filtrés selon la même recherche, les groupes devenus vides étant
 * retirés (utile pour rendre la liste déroulante sans en-têtes orphelins).
 */
export function filterRoleGroups(query: string): RoleOptionGroup[] {
    const allowed = new Set(filterRoleOptions(query));
    return ROLE_OPTION_GROUPS.map((group) => ({
        label: group.label,
        roles: group.roles.filter((role) => allowed.has(role)),
    })).filter((group) => group.roles.length > 0);
}

/**
 * Vocabulaire du repli « Cascadeur » explicite (`normalizeRole`).
 *
 * `normalizeRole` reconnaît « Cascadeur » explicitement pour ces motifs ; en
 * dehors, il retombe **silencieusement** sur `Cascadeur` pour tout libellé
 * inconnu. On ne peut donc pas distinguer les deux cas par la seule sortie :
 * ce motif sert à lever l'ambiguïté pour l'indice « hors nomenclature ».
 */
const EXPLICIT_CASCADEUR_PATTERN = /stunt|cascadeur|chut|acrobat|human torch/i;

/**
 * Vrai si le libellé est reconnu par la nomenclature canonique.
 *
 * Détecte le **repli silencieux** de `normalizeRole` (un libellé inconnu est
 * forcé en `['Cascadeur']`) : on ne le considère reconnu que s'il porte un
 * motif cascade/stunt explicite. Un libellé vide n'est jamais reconnu.
 *
 * Sert uniquement à un indice d'interface — aucune écriture, aucune
 * normalisation.
 */
export function isRecognizedRole(value: string): boolean {
    const folded = fold(value);
    if (!folded) return false;

    const roles = normalizeRole(value).roles;
    const isPureCascadeur = roles.length === 1 && roles[0] === 'Cascadeur';
    if (!isPureCascadeur) return true;

    return EXPLICIT_CASCADEUR_PATTERN.test(folded);
}
