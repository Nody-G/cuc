/**
 * ==============================================================================
 * CUC — Règles PURES de réparation typographique des textes
 * ==============================================================================
 * Ces fonctions ne touchent ni au réseau ni à la base : elles transforment une
 * chaîne et sont donc vérifiables hors ligne (voir
 * `scripts/selftest_text_repairs.mjs`).
 *
 * ⚠️  RÈGLE ISSUE D'UN INCIDENT RÉEL (2026-09-21)
 * ------------------------------------------------------------------------------
 * Le motif `/\S {2,}\S/` **inclut les caractères de bord** : il est parfait pour
 * DÉTECTER une suite d'espaces, mais catastrophique pour la CORRIGER avec
 * `.replace()`, qui supprime alors ces deux caractères.
 *
 *   'Gloria  needs'.replace(/\S {2,}\S/g, ' ')  →  'Glori eeds'
 *
 * Neuf emplacements de synopsis anglais ont été mutilés ainsi
 * (`family.  She` → `family he`, `brings  together` → `bring ogether`…) sans que
 * l'audit ne puisse le voir : le défaut signalé avait bien disparu.
 *
 * Toute correction d'espacement doit donc utiliser un motif à **regard**
 * (`(?<=\S) {2,}(?=\S)`) qui ne consomme que les espaces, et être validée par
 * `substance()` avant écriture.
 * ==============================================================================
 */

/** « et commercial » — composé, car le canal d'écriture du dépôt décode les entités. */
export const AMP = String.fromCharCode(38);

/** Séquence « et commercial » échappée, telle qu'elle peut arriver en base. */
export const ESCAPED_AMP = `${AMP}amp;`;

/** Détection d'une suite d'espaces entre deux caractères visibles. */
export const DOUBLE_SPACE_DETECT = /\S {2,}\S/g;

/**
 * Correction d'une suite d'espaces : ne consomme QUE les espaces.
 * C'est le seul motif autorisé dans un `.replace()`.
 */
export const DOUBLE_SPACE_RUN = /(?<=\S) {2,}(?=\S)/g;

/** Espace avant ponctuation en anglais — l'ellipse est traitée à part. */
export const PUNCT_EN = / [,.!?;:]/g;

/** Réduit une suite d'espaces à un seul espace, sans perdre aucun caractère. */
export function collapseSpaceRuns(text) {
    return text.replace(DOUBLE_SPACE_RUN, ' ');
}

/**
 * Colle la ponctuation au mot précédent (typographie anglaise), sans toucher à
 * l'ellipse : `unit : Police` → `unit: Police`, mais `indifferent ...` reste tel
 * quel (convention d'écriture admise).
 */
export function fixEnglishPunctuation(text) {
    return text.replace(PUNCT_EN, (match, offset, whole) => {
        const char = match.slice(1);
        if (char === '.' && whole.slice(offset + 1, offset + 4) === '...') return match;
        return char;
    });
}

/** Décode la séquence « et commercial » échappée en un « et commercial » réel. */
export function decodeEscapedAmp(text) {
    return text.split(ESCAPED_AMP).join(AMP);
}

/**
 * Signature de la SUBSTANCE d'un texte : tous les espaces retirés et les entités
 * décodées. Deux textes qui ne diffèrent que par l'espacement (ou par une entité
 * résiduelle) ont la même signature.
 *
 * GARDE-FOU : une correction typographique ne doit jamais modifier cette
 * signature. Si elle le fait, des caractères réels ont été perdus → écriture
 * refusée. C'est exactement le contrôle qui manquait lors de l'incident.
 */
export function substance(value) {
    return decodeEscapedAmp(JSON.stringify(value)).replace(/\s+/g, '');
}

/** Indique si la correction d'un texte a préservé toute sa substance. */
export function preservesSubstance(before, after) {
    return substance(before) === substance(after);
}
