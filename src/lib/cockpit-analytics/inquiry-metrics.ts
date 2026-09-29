/**
 * Agrégats des dossiers Contact : comptage par étape et par pipeline, taux
 * d'admission (Formation uniquement) et délai moyen de traitement.
 *
 * Deux vérités que ce module ne confond plus :
 *  - une **étape** appartient à un pipeline ; les compteurs suivent donc le
 *    catalogue (`@/lib/inquiries/pipelines`) et non une liste de statuts figée ;
 *  - le **taux d'admission** n'a de sens que pour la Formation : un tournage
 *    n'est ni « admis » ni « refusé ». Le restreindre évite un chiffre faux
 *    (cf. `durability_health.md` § 8 : un chiffre sans source mesurée s'affiche
 *    comme un repère, ou ne s'affiche pas).
 */

import type { SiteInquiry } from '@/lib/data/site-service';
import {
    LONG_PROGRAM_STAGE,
    firstStageOf,
    getPipeline,
    resolveStage,
    type PipelineId,
} from '@/lib/inquiries/pipelines';
import { pipelineOfMetadata } from '@/lib/inquiries/pipeline-read';
import { countByPipeline } from '@/lib/inquiries/inquiry-stats';
import { safeDate } from './time';

export interface InquiryMetrics {
    /** Dossiers par étape (toutes étapes confondues, tous pipelines). */
    statusCounts: Record<string, number>;
    total: number;
    /** Dossiers encore à l'étape d'entrée de leur pipeline. */
    newCount: number;
    /** Admission au cursus long — pipeline Formation uniquement. */
    admitted: number;
    refused: number;
    decided: number;
    admissionRate: number;
    avgResponseHours: number | null;
    /** Répartition par pipeline (Formation, Production, Événementiel, Presse). */
    byPipeline: Record<PipelineId, number>;
}

export function computeInquiryMetrics(inquiries: SiteInquiry[]): InquiryMetrics {
    const statusCounts: Record<string, number> = {};
    let newCount = 0;

    for (const inq of inquiries) {
        const pipeline = pipelineOfMetadata(inq.metadata);
        const stage = resolveStage(pipeline, inq.status);
        statusCounts[stage.id] = (statusCounts[stage.id] ?? 0) + 1;
        if (stage.id === firstStageOf(pipeline).id) newCount += 1;
    }

    const formation = getPipeline('formation');
    let admitted = 0;
    let refused = 0;
    for (const inq of inquiries) {
        if (pipelineOfMetadata(inq.metadata).id !== 'formation') continue;
        const stage = resolveStage(formation, inq.status);
        if (stage.id === LONG_PROGRAM_STAGE) admitted += 1;
        else if (stage.id === 'refuse') refused += 1;
    }

    const decided = admitted + refused;
    const admissionRate = decided > 0 ? Math.round((admitted / decided) * 1000) / 10 : 0;

    // Délai moyen de traitement : écart création → dernière mise à jour pour les
    // dossiers déjà sortis de l'étape d'entrée de leur pipeline.
    const responseDurations: number[] = [];
    for (const inq of inquiries) {
        const pipeline = pipelineOfMetadata(inq.metadata);
        if (resolveStage(pipeline, inq.status).id === firstStageOf(pipeline).id) continue;
        const created = safeDate(inq.created_at);
        const updated = safeDate(inq.updated_at);
        if (!created || !updated) continue;
        const hours = (updated.getTime() - created.getTime()) / 3_600_000;
        if (hours >= 0) responseDurations.push(hours);
    }
    const avgResponseHours =
        responseDurations.length > 0
            ? Math.round(
                (responseDurations.reduce((a, b) => a + b, 0) / responseDurations.length) * 10
            ) / 10
            : null;

    return {
        statusCounts,
        total: inquiries.length,
        newCount,
        admitted,
        refused,
        decided,
        admissionRate,
        avgResponseHours,
        byPipeline: countByPipeline(inquiries),
    };
}
