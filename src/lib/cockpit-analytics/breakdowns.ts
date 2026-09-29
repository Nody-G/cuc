/**
 * Décompositions du moteur analytique : entonnoir de conversion des
 * candidatures et répartitions par statut / programme.
 */

import type { SiteInquiry } from '@/lib/data/site-service';
import { PIPELINE_CATALOG } from '@/lib/inquiries/pipelines';
import type { DistributionSlice, FunnelStage } from './types';
import { buildDistribution } from './distribution';

/**
 * Libellés d'étapes pour les décompositions.
 *
 * Les étapes vivent dans le catalogue des pipelines : on y lit leurs libellés
 * plutôt que de figer une liste de statuts ici (un dossier de tournage n'a ni
 * « Admis » ni « Refusé »). Les identifiants partagés entre pipelines
 * (`recue`, `qualification`, `archive`…) gardent la première définition.
 */
const STAGE_LABELS: Record<string, string> = (() => {
    const labels: Record<string, string> = {};
    for (const pipeline of PIPELINE_CATALOG) {
        for (const stage of pipeline.stages) {
            if (!labels[stage.id]) labels[stage.id] = stage.label;
        }
    }
    return labels;
})();

/** Libellé d'une étape, ou son identifiant brut si le catalogue l'ignore. */
export function inquiryStageLabel(stage: string): string {
    return STAGE_LABELS[stage] ?? stage;
}

/** Conservé pour les appelants historiques : libellés des étapes connues. */
export const INQUIRY_STATUS_LABELS = STAGE_LABELS;

export interface FunnelCounts {
    received: number;
    processing: number;
    decided: number;
    admitted: number;
}

export function buildFunnel(counts: FunnelCounts): FunnelStage[] {
    const funnel: FunnelStage[] = [];
    const funnelSteps: Array<{ id: string; label: string; count: number }> = [
        { id: 'received', label: 'Demandes reçues', count: counts.received },
        { id: 'processing', label: 'En cours de traitement', count: counts.processing },
        { id: 'decided', label: 'Décisions rendues', count: counts.decided },
        { id: 'admitted', label: 'Admis', count: counts.admitted },
    ];

    let previousCount = 0;
    const startCount = funnelSteps[0]?.count ?? 0;
    funnelSteps.forEach((step, index) => {
        const conversionFromPrevious =
            index === 0 ? 100 : previousCount > 0 ? Math.round((step.count / previousCount) * 1000) / 10 : 0;
        const conversionFromStart =
            startCount > 0 ? Math.round((step.count / startCount) * 1000) / 10 : 0;
        funnel.push({
            ...step,
            conversionFromPrevious,
            conversionFromStart,
        });
        previousCount = step.count;
    });

    return funnel;
}

export function buildStatusDistribution(
    statusCounts: Record<string, number>
): DistributionSlice[] {
    return buildDistribution(
        Object.keys(statusCounts).map((stage) => ({
            label: inquiryStageLabel(stage),
            value: statusCounts[stage],
        }))
    );
}

export function buildProgramDistribution(inquiries: SiteInquiry[]): DistributionSlice[] {
    const programCounts = new Map<string, number>();
    for (const inq of inquiries) {
        const label = inq.program_title?.trim() || inq.program_id?.trim() || 'Non précisé';
        programCounts.set(label, (programCounts.get(label) || 0) + 1);
    }
    return buildDistribution(
        Array.from(programCounts.entries()).map(([label, value]) => ({ label, value }))
    );
}
