/**
 * Agrégats des candidatures : comptage par statut, taux d'admission sur les
 * décisions rendues et délai moyen de traitement.
 */

import type { SiteInquiry } from '@/lib/data/site-service';
import { safeDate } from './time';

export interface InquiryMetrics {
    statusCounts: Record<SiteInquiry['status'], number>;
    total: number;
    newCount: number;
    admitted: number;
    refused: number;
    decided: number;
    admissionRate: number;
    avgResponseHours: number | null;
}

export function computeInquiryMetrics(inquiries: SiteInquiry[]): InquiryMetrics {
    const statusCounts: Record<SiteInquiry['status'], number> = {
        nouveau: 0,
        en_cours: 0,
        admis: 0,
        refuse: 0,
        archive: 0,
    };
    for (const inq of inquiries) {
        if (statusCounts[inq.status] !== undefined) {
            statusCounts[inq.status] += 1;
        }
    }

    const total = inquiries.length;
    const newCount = statusCounts.nouveau;
    const admitted = statusCounts.admis;
    const refused = statusCounts.refuse;
    const decided = admitted + refused;
    const admissionRate = decided > 0 ? Math.round((admitted / decided) * 1000) / 10 : 0;

    // Délai moyen de traitement : écart entre création et dernière mise à jour
    // pour les dossiers déjà traités (statut ≠ nouveau).
    const responseDurations: number[] = [];
    for (const inq of inquiries) {
        if (inq.status === 'nouveau') continue;
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
        total,
        newCount,
        admitted,
        refused,
        decided,
        admissionRate,
        avgResponseHours,
    };
}
