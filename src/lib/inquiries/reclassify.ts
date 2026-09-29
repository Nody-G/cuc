/**
 * Re-catégorisation d'une demande Contact (correction de pipeline).
 *
 * Couche « Domaine » (`AGENTS.md` § 1) : fonctions pures, aucun accès réseau.
 *
 * Cas d'usage : un visiteur s'est trompé de catégorie (demande de tournage
 * arrivée en « Formation », par exemple). L'équipe déplace le dossier vers le
 * bon pipeline — le parcours est alors repris à sa première étape, et le motif
 * du déplacement est conservé dans l'historique du dossier.
 */

import { firstStageOf, getPipeline, isPipelineId, type PipelineId } from './pipelines';

/** Nombre maximal d'entrées d'historique conservées. */
const HISTORY_LIMIT = 20;

export interface ReclassificationEntry {
    /** Horodatage ISO du déplacement. */
    at: string;
    /** Pipeline d'origine (`formation`, `production`…). */
    from: string;
    /** Pipeline d'arrivée. */
    to: string;
    /** Motif saisi par l'opérateur — jamais vide. */
    reason: string;
}

export interface ReclassificationInput {
    currentPipeline: unknown;
    targetPipeline: unknown;
    /** Motif saisi par l'opérateur. */
    reason: string;
    /** Horodatage injecté (les fonctions pures ne lisent pas l'horloge). */
    at: string;
}

export type ReclassificationDecision =
    | { allowed: true; pipeline: PipelineId; stage: string; entry: ReclassificationEntry }
    | { allowed: false; reason: string };

/** Décide si un déplacement de pipeline est autorisé, et à quelle étape il repart. */
export function evaluateReclassification({
    currentPipeline,
    targetPipeline,
    reason,
    at,
}: ReclassificationInput): ReclassificationDecision {
    if (!isPipelineId(targetPipeline)) {
        return { allowed: false, reason: 'Pipeline cible inconnu.' };
    }

    const currentId = isPipelineId(currentPipeline) ? currentPipeline : 'formation';
    if (currentId === targetPipeline) {
        return { allowed: false, reason: 'La demande se trouve déjà dans ce pipeline.' };
    }

    const cleanReason = reason.trim();
    if (cleanReason.length < 3) {
        return {
            allowed: false,
            reason: 'Un motif est requis pour re-catégoriser une demande.',
        };
    }

    const target = getPipeline(targetPipeline);
    return {
        allowed: true,
        pipeline: targetPipeline,
        stage: firstStageOf(target).id,
        entry: { at, from: currentId, to: targetPipeline, reason: cleanReason },
    };
}

/** Ajoute une entrée d'historique, la plus récente en tête, liste bornée. */
export function appendReclassification(
    existing: unknown,
    entry: ReclassificationEntry
): ReclassificationEntry[] {
    const history = Array.isArray(existing)
        ? existing.filter(
            (item): item is ReclassificationEntry =>
                typeof item === 'object' &&
                item !== null &&
                typeof (item as ReclassificationEntry).at === 'string'
        )
        : [];
    return [entry, ...history].slice(0, HISTORY_LIMIT);
}

/** Lit l'historique de re-catégorisation d'un dossier (jamais `null`). */
export function readReclassificationHistory(metadata: unknown): ReclassificationEntry[] {
    if (typeof metadata !== 'object' || metadata === null) return [];
    return appendReclassification((metadata as { reclassifications?: unknown }).reclassifications, {
        at: '',
        from: '',
        to: '',
        reason: '',
    }).filter((entry) => entry.at !== '');
}
