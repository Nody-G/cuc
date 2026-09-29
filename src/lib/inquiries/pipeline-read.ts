/**
 * Lecture d'un dossier Contact : à quel pipeline il appartient, où il en est, et
 * ce que son étape implique.
 *
 * Couche « Domaine » (`AGENTS.md` § 1) : fonctions pures, aucun accès réseau.
 * Séparé du catalogue (`./pipelines`) pour un seul rôle par module — le
 * catalogue décrit, ce module interprète.
 */

import {
    getPipeline,
    isTerminalStage,
    resolveStage,
    type Pipeline,
} from './pipelines';

/** Pipeline porté par les métadonnées d'un dossier (repli : `formation`). */
export function pipelineOfMetadata(metadata: unknown): Pipeline {
    const raw =
        typeof metadata === 'object' && metadata !== null
            ? (metadata as { pipeline?: unknown }).pipeline
            : undefined;
    return getPipeline(raw);
}

/** `true` si le verdict favorable de la session Découverte est enregistré. */
export function isDiscoveryValidated(metadata: unknown): boolean {
    const verdict =
        typeof metadata === 'object' && metadata !== null
            ? (metadata as { discovery_verdict?: unknown }).discovery_verdict
            : undefined;
    return verdict === 'favorable';
}

/** `true` si l'étape est une clôture défavorable (dossier écarté / non retenu). */
export function isNegativeStage(pipeline: Pipeline, stageId: string): boolean {
    return pipeline.stages.find((stage) => stage.id === stageId)?.negative === true;
}

/** Libellé d'une étape, résolu et jamais vide. */
export function stageLabel(pipeline: Pipeline, stageId: string): string {
    return resolveStage(pipeline, stageId).label;
}

export function isTerminal(pipeline: Pipeline, stageId: string): boolean {
    return isTerminalStage(resolveStage(pipeline, stageId));
}

/**
 * `true` si l'étape implique une **participation** réelle (stage ou formation).
 *
 * Règle projet : dès qu'une personne participe, elle doit avoir un profil
 * CUC Sign. Une simple demande de renseignement, un devis de tournage ou une
 * sollicitation presse ne créent donc aucun profil.
 */
export function requiresProfileFor(pipeline: Pipeline, stageId: string): boolean {
    return pipeline.stages.find((stage) => stage.id === stageId)?.participates === true;
}

/** Première étape d'un pipeline à exiger un profil CUC Sign, ou `null`. */
export function firstParticipationStage(pipeline: Pipeline): string | null {
    return pipeline.stages.find((stage) => stage.participates === true)?.id ?? null;
}
