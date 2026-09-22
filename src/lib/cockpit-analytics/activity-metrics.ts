/**
 * Agrégats d'activité : volume du journal d'audit, éditeurs actifs distincts
 * et répartitions par auteur / entité.
 */

import type { AuditLogEntry } from '@/lib/data/site-service';
import type { DistributionSlice } from './types';
import { buildDistribution } from './distribution';

export interface ActivityMetrics {
    auditEvents: number;
    activeEditors: number;
    activityByAuthor: DistributionSlice[];
    activityByEntity: DistributionSlice[];
}

export function computeActivityMetrics(auditLogs: AuditLogEntry[]): ActivityMetrics {
    const authorCounts = new Map<string, number>();
    const entityCounts = new Map<string, number>();
    for (const log of auditLogs) {
        const author = log.user_name?.trim() || 'Inconnu';
        authorCounts.set(author, (authorCounts.get(author) || 0) + 1);
        const entity = log.entity?.trim() || 'Non précisé';
        entityCounts.set(entity, (entityCounts.get(entity) || 0) + 1);
    }

    const activityByAuthor = buildDistribution(
        Array.from(authorCounts.entries()).map(([label, value]) => ({ label, value }))
    );
    const activityByEntity = buildDistribution(
        Array.from(entityCounts.entries()).map(([label, value]) => ({ label, value }))
    );

    return {
        auditEvents: auditLogs.length,
        activeEditors: authorCounts.size,
        activityByAuthor,
        activityByEntity,
    };
}
