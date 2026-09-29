/**
 * Comptages d'une file de dossiers Contact, par pipeline et par étape.
 *
 * Couche « Domaine » (`AGENTS.md` § 1) : fonctions pures — aucun React, aucun
 * accès réseau. Un tournage et un dossier d'admission n'ont pas les mêmes
 * étapes : les compteurs suivent donc le catalogue du pipeline, jamais des
 * libellés codés en dur.
 */

import {
    PIPELINE_IDS,
    firstStageOf,
    isTerminalStage,
    resolveStage,
    type Pipeline,
    type PipelineId,
} from './pipelines';
import { isNegativeStage, pipelineOfMetadata } from './pipeline-read';

/** Vue minimale d'un dossier — assez pour compter sans dépendre du type complet. */
export interface InquirySummary {
    status: string;
    metadata?: unknown;
}

/** Nombre de dossiers par pipeline. */
export function countByPipeline(
    entries: readonly InquirySummary[]
): Record<PipelineId, number> {
    const counts = PIPELINE_IDS.reduce(
        (acc, id) => ({ ...acc, [id]: 0 }),
        {} as Record<PipelineId, number>
    );
    for (const entry of entries) {
        counts[pipelineOfMetadata(entry.metadata).id] += 1;
    }
    return counts;
}

/** Dossiers appartenant à un pipeline donné. */
export function filterByPipeline<T extends InquirySummary>(
    entries: readonly T[],
    pipelineId: PipelineId
): T[] {
    return entries.filter((entry) => pipelineOfMetadata(entry.metadata).id === pipelineId);
}

export interface PipelineStats {
    total: number;
    /** Étape d'entrée : dossiers non encore traités. */
    toProcess: number;
    /** Étapes ouvertes hors entrée : dossiers en cours d'instruction. */
    inProgress: number;
    /** Clôtures favorables (admis, conclu, réponse apportée…). */
    won: number;
    /** Clôtures défavorables (non retenu, écarté). */
    lost: number;
    /** Détail par étape, toutes les étapes du pipeline présentes. */
    byStage: Record<string, number>;
}

/** Agrège une file de dossiers selon les étapes du pipeline. */
export function computePipelineStats(
    pipeline: Pipeline,
    entries: readonly InquirySummary[]
): PipelineStats {
    const byStage: Record<string, number> = {};
    for (const stage of pipeline.stages) byStage[stage.id] = 0;

    const entryStageId = firstStageOf(pipeline).id;
    let toProcess = 0;
    let inProgress = 0;
    let won = 0;
    let lost = 0;

    for (const entry of entries) {
        const stage = resolveStage(pipeline, entry.status);
        byStage[stage.id] = (byStage[stage.id] ?? 0) + 1;

        if (isTerminalStage(stage)) {
            if (isNegativeStage(pipeline, stage.id)) lost += 1;
            else won += 1;
        } else if (stage.id === entryStageId) {
            toProcess += 1;
        } else {
            inProgress += 1;
        }
    }

    return { total: entries.length, toProcess, inProgress, won, lost, byStage };
}
