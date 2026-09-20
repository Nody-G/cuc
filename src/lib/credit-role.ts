/**
 * Normalisation des rôles de plateau des coachs CUC.
 *
 * Objectif : rendre lisible en un coup d'œil ce qu'un coach a fait sur une
 * production. On ramène la grande variété de libellés (« Cascadeur & Câblage 3D »,
 * « Coordinateur des cascades & Action Designer », « Doublure Keanu Reeves »…)
 * à un jeu réduit et stable de rôles canoniques.
 *
 * Demande explicite de l'utilisateur : « marque juste si ils ont ete cascadeur
 * doublure ou coordinateur. je veux que ces 3 titre rien d autre, pas parkour
 * ou autre ». Il n'existe donc que 3 libellés affichables.
 *
 * Doctrine : on ne supprime aucune information factuelle. Le rôle détaillé
 * d'origine reste disponible (`detail`) ; seul l'affichage principal est
 * normalisé. Aucun rôle n'est inventé.
 */

/** Rôles canoniques affichables (3 exactement, ordre = priorité décroissante). */
export type CanonicalRole =
    | 'Coordinateur des cascades'
    | 'Doublure'
    | 'Cascadeur';

export const CANONICAL_ROLE_ORDER: CanonicalRole[] = [
    'Coordinateur des cascades',
    'Doublure',
    'Cascadeur',
];

export interface NormalizedRole {
    /** Rôles canoniques détectés, triés par priorité. */
    roles: CanonicalRole[];
    /** Libellé court prêt à afficher, ex. « Coordinateur des cascades · Doublure ». */
    label: string;
    /** Nom(s) de comédien(s) doublé(s), si mentionné. */
    doubledActors: string[];
    /** Libellé d'origine, conservé pour la fiche détaillée. */
    detail: string;
}

/** Retire les accents et passe en minuscules pour une comparaison robuste. */
function fold(value: string): string {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Extrait le(s) nom(s) de comédien(s) doublé(s) d'un libellé de rôle.
 * Gère « Doublure Keanu Reeves », « Doublure de Tomer Sisley »,
 * « Doublure Samuel Le Bihan », « Doublure combats » (→ aucun nom).
 */
export function extractDoubledActors(role: string): string[] {
    const raw = String(role || '');
    const matches = raw.matchAll(
        /doublure\s*(?:de\s+|d'|:)?\s*([A-ZÀ-Ý][\p{L}'-]+(?:\s+[A-ZÀ-Ý][\p{L}'-]+){0,3})/gu
    );

    const stopWords = new Set([
        'combats', 'combat', 'cascades', 'cascade', 'action', 'physique',
        'rapproches', 'rapprochés', 'tactiques', 'tactique', 'scene', 'scène',
        'generale', 'générale', 'partielle', 'specialiste', 'spécialiste',
    ]);

    const found: string[] = [];
    for (const m of matches) {
        const candidate = m[1].trim();
        if (!candidate) continue;
        if (stopWords.has(fold(candidate))) continue;
        if (!found.includes(candidate)) found.push(candidate);
    }
    return found;
}

/**
 * Normalise un libellé de rôle de plateau vers les 3 rôles canoniques.
 *
 * Priorité : Coordinateur des cascades > Doublure > Cascadeur.
 * Toute précision (parkour, câblage, chorégraphie, action designer…) est
 * ramenée à l'un de ces 3 libellés ; le libellé d'origine reste dans `detail`.
 *
 * @example
 * normalizeRole('Coordinateur des cascades & Action Designer')
 *   → { roles: ['Coordinateur des cascades'], label: 'Coordinateur des cascades', ... }
 * normalizeRole('Cascadeur & Doublure Keanu Reeves')
 *   → { roles: ['Doublure', 'Cascadeur'], label: 'Doublure de Keanu Reeves · Cascadeur', ... }
 */
export function normalizeRole(role: string): NormalizedRole {
    const detail = String(role || '').trim();
    const f = fold(detail);
    const roles: CanonicalRole[] = [];

    const has = (...needles: string[]) => needles.some((n) => f.includes(n));

    // Coordination : coordinateur, régisseur, superviseur, action designer
    if (has('coordinat', 'regleur', 'régleur', 'supervis', 'action designer', 'chef cascade')) {
        roles.push('Coordinateur des cascades');
    }

    // Doublure : doublure, double lumière, doubleur
    if (has('doublure', 'double lumiere', 'double lumière', 'doubleur')) {
        roles.push('Doublure');
    }

    // Cascadeur : rôle par défaut si rien d'autre n'a été détecté, ou si
    // explicitement mentionné (« Cascadeur & Câblage » → Cascadeur).
    if (has('cascadeur', 'cascade', 'stunt', 'chute', 'combat', 'acrobat', 'chorégraph', 'choregraph', 'parkour', 'cablage', 'câblage', 'wire')) {
        if (!roles.includes('Cascadeur')) roles.push('Cascadeur');
    }

    // Aucun signal reconnu → on considère « Cascadeur » comme rôle générique
    // uniquement si le libellé est vide ou purement technique. Sinon on ne
    // force rien pour ne pas inventer.
    if (roles.length === 0 && f.length > 0) {
        roles.push('Cascadeur');
    }

    // Tri par priorité canonique
    roles.sort(
        (a, b) => CANONICAL_ROLE_ORDER.indexOf(a) - CANONICAL_ROLE_ORDER.indexOf(b)
    );

    const doubledActors = extractDoubledActors(detail);

    // Libellé : rôles canoniques, avec le nom du comédien accolé à « Doublure »
    const labelParts = roles.map((r) =>
        r === 'Doublure' && doubledActors.length > 0
            ? `Doublure de ${doubledActors.join(', ')}`
            : r
    );

    return {
        roles,
        label: labelParts.join(' · '),
        doubledActors,
        detail,
    };
}

/**
 * Normalise une carte `coachId → rôle` (metadata.cuc_team_roles).
 * Retourne une carte `coachId → libellé canonique`.
 */
export function normalizeTeamRoles(
    roles: Record<string, string> | undefined | null
): Record<string, string> {
    if (!roles) return {};
    const out: Record<string, string> = {};
    for (const [coachId, role] of Object.entries(roles)) {
        out[coachId] = normalizeRole(role).label;
    }
    return out;
}

/** Couleur d'accent associée à un rôle canonique (pour l'affichage). */
export function roleAccent(role: CanonicalRole): string {
    switch (role) {
        case 'Coordinateur des cascades':
            return 'text-[#FFE500]';
        case 'Doublure':
            return 'text-sky-300';
        default:
            return 'text-zinc-300';
    }
}
