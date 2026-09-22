/**
 * Décompositions du moteur analytique : entonnoir de conversion des
 * candidatures et répartitions par statut / programme.
 */

import type { SiteInquiry } from '@/lib/data/site-service';
import type { DistributionSlice, FunnelStage } from './types';
import { buildDistribution } from './distribution';

export const INQUIRY_STATUS_LABELS: Record<SiteInquiry['status'], string> = {
    nouveau: 'Nouveau',
    en_cours: 'En cours',
    admis: 'Admis',
    refuse: 'Refusé',
    archive: 'Archivé',
};

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
    statusCounts: Record<SiteInquiry['status'], number>
): DistributionSlice[] {
    return buildDistribution(
        (Object.keys(statusCounts) as Array<SiteInquiry['status']>).map((status) => ({
            label: INQUIRY_STATUS_LABELS[status],
            value: statusCounts[status],
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
