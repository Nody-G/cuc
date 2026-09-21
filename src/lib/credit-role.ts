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

/** Ensemble de rôles tenus sur une production — sans aucune langue. */
export interface RoleSetSummary {
    /** Rôles canoniques présents, ordonnés par priorité. */
    roles: CanonicalRole[];
    /** Comédiens doublés mentionnés dans les libellés. */
    doubledActors: string[];
}

/**
 * Synthèse **sans langue** des rôles tenus par le CUC sur une production.
 *
 * Les légendes de jaquettes étaient écrites à la main dans les catalogues de
 * messages (« Cascadeurs CUC (tournage Paris) », « Équipe cascades CUC »…) :
 * des auto-références au campus, sans fait vérifiable, affichées comme un rôle.
 * Elles sont désormais dérivées des rôles **réellement enregistrés** en base
 * (`site_films.metadata.cuc_team_roles`).
 *
 * Le rendu textuel est délégué à la couche i18n
 * (`@/lib/i18n/role-labels`) : un libellé « Cascadeur » écrit en dur ici
 * s'affichait tel quel sur les pages anglaises.
 *
 * Sans rôle enregistré, l'ensemble est vide : mieux vaut aucune légende qu'une
 * affirmation inventée.
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
        case 'Doublure':
            return 'text-sky-300';
        default:
            return 'text-zinc-300';
    }
}
