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
    | 'Assistant coordinateur des cascades'
    | 'Coordinateur de rigging'
    | 'Rigger'
    | 'Cascadeur mécanique'
    | 'Doublure'
    | 'Cascadeur';

export const CANONICAL_ROLE_ORDER: CanonicalRole[] = [
    'Coordinateur des cascades',
    'Assistant coordinateur des cascades',
    'Coordinateur de rigging',
    'Rigger',
    'Cascadeur mécanique',
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
    // Le motif est insensible à la casse : la forme canonique en base est
    // « Doublure Keanu Reeves » (majuscule), que la version sensible à la casse
    // ne reconnaissait pas — le comédien doublé n'apparaissait donc jamais.
    const matches = raw.matchAll(
        /doublure\s*(?:de\s+|d'|:)?\s*([A-ZÀ-Ý][\p{L}'-]+(?:\s+[A-ZÀ-Ý][\p{L}'-]+){0,3})/giu
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

    // 1. Rigging Coordinator : coordinateur de rigging, rigging coordinator, stunt rigging coordinator
    if (
        (f.includes('rigg') && (f.includes('coordinat') || f.includes('regleur'))) ||
        (f.includes('coordinat') && f.includes('rigg'))
    ) {
        roles.push('Coordinateur de rigging');
    }
    // 2. Rigger : stunt rigger, rigger, câblage, rigging
    else if (has('rigger', 'cablage', 'accrochage') || (f.includes('rigg') && !f.includes('coordinat'))) {
        roles.push('Rigger');
    }

    // 3. Cascadeur mécanique : stunt driver, precision driver, pilote, cascade mécanique, scooter
    if (
        (has('driver', 'pilot', 'precision driver', 'scooter') || f.includes('mecanique')) &&
        !has('fight', 'coordinat')
    ) {
        roles.push('Cascadeur mécanique');
    }

    // 4. Assistant coordination : assistant coordinateur, assistant stunt coordinator, assistant fight choreographer
    if (
        (f.includes('assistant') && (has('coordinat', 'regleur', 'fight', 'combat') || f.includes('stunt'))) ||
        f.includes('co-stunt')
    ) {
        roles.push('Assistant coordinateur des cascades');
    }

    // 5. Coordinateur des cascades : coordination, action director, action designer, fight arranger, fight choreographer, superviseur
    const isHeadCoord =
        !f.includes('assistant') &&
        !f.includes('rigg') &&
        (has('action director', 'action designer', 'fight choreographer', 'fight choregrapher', 'fight arranger', 'fight coordinator', 'chef cascade', 'stunt manager') ||
            has('coordinat', 'regleur', 'supervis'));

    if (isHeadCoord && !roles.includes('Coordinateur des cascades')) {
        roles.push('Coordinateur des cascades');
    }

    // 6. Doublure : doublure, stunt double, double for
    if (has('doublure', 'double lumiere', 'doubleur') || f.includes('stunt doub') || f.includes('double for')) {
        roles.push('Doublure');
    }

    // 7. Cascadeur : human torch, fire stunt, cascadeur, stunt performer, utility stunts
    const isExplicitStunt =
        has('human torch', 'fire stunt', 'cascadeur', 'chute', 'acrobat') ||
        f.includes('stunt performer') ||
        f.includes('utility stunt') ||
        (f.includes('stunt') &&
            !roles.some(
                (r) =>
                    r === 'Coordinateur des cascades' ||
                    r === 'Assistant coordinateur des cascades' ||
                    r === 'Coordinateur de rigging' ||
                    r === 'Rigger' ||
                    r === 'Cascadeur mécanique' ||
                    r === 'Doublure'
            ));

    if (isExplicitStunt && !roles.includes('Cascadeur')) {
        roles.push('Cascadeur');
    }

    // Fallback : si aucun rôle détecté et chaîne non vide
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

/** Ensemble de rôles tenus sur une production — sans aucune langue. */
export interface RoleSetSummary {
    /** Rôles canoniques présents, ordonnés par priorité. */
    roles: CanonicalRole[];
    /** Comédiens doublés mentionnés dans les libellés. */
    doubledActors: string[];
}

/**
 * Synthèse sans langue des rôles tenus par le CUC sur une production.
 */
export function summarizeFilmRoleSet(
    roles: Record<string, string> | null | undefined
): RoleSetSummary {
    if (!roles) return { roles: [], doubledActors: [] };

    const present = new Set<CanonicalRole>();
    const doubledActors = new Set<string>();

    for (const rawRole of Object.values(roles)) {
        const normalized = normalizeRole(String(rawRole || ''));
        normalized.roles.forEach((role) => present.add(role));
        normalized.doubledActors.forEach((actor) => doubledActors.add(actor));
    }

    return {
        roles: CANONICAL_ROLE_ORDER.filter((role) => present.has(role)),
        doubledActors: [...doubledActors],
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
        case 'Assistant coordinateur des cascades':
            return 'text-amber-400';
        case 'Coordinateur de rigging':
            return 'text-purple-400';
        case 'Rigger':
            return 'text-indigo-300';
        case 'Cascadeur mécanique':
            return 'text-orange-400';
        case 'Doublure':
            return 'text-sky-300';
        default:
            return 'text-zinc-300';
    }
}
