'use client';

/**
 * Cartes de synthèse du hub Journal.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1). Les chiffres proviennent de
 * comptes exacts calculés en base (`getActivityLogOverview`) : aucun n'est estimé
 * à partir d'un échantillon, conformément au §8 de `durability_health.md`.
 */

import React from 'react';
import { Activity, AlertOctagon, Clock, Database } from 'lucide-react';
import type { LogStats } from '@/lib/logging/types';
import { CockpitCard, CockpitSkeleton } from '../ui';
import { formatFullDate } from '@/lib/format/date';

interface LogHubStatsCardsProps {
    stats: LogStats | null;
    loading: boolean;
}

interface StatCardProps {
    icon: typeof Activity;
    label: string;
    value: string;
    hint: string;
    tone?: 'neutral' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, hint, tone = 'neutral' }) => (
    <CockpitCard padding="sm">
        <div className="flex items-start gap-3">
            <div
                className={
                    tone === 'danger'
                        ? 'w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0'
                        : 'w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0'
                }
            >
                <Icon
                    className={tone === 'danger' ? 'w-4 h-4 text-red-300' : 'w-4 h-4 text-gray-400'}
                    aria-hidden="true"
                />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">{label}</p>
                <p className="text-lg font-bold text-white leading-tight">{value}</p>
                <p className="text-[11px] text-gray-500 truncate">{hint}</p>
            </div>
        </div>
    </CockpitCard>
);

export const LogHubStatsCards: React.FC<LogHubStatsCardsProps> = ({ stats, loading }) => {
    if (loading || !stats) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((index) => (
                    <CockpitCard key={index} padding="sm">
                        <CockpitSkeleton className="h-12 w-full" />
                    </CockpitCard>
                ))}
            </div>
        );
    }

    const incidents = stats.byLevel.error + stats.byLevel.critical;
    const domains = stats.bySource.length;
    const topDomain = stats.bySource[0];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
                icon={Activity}
                label="Événements tracés"
                value={String(stats.total)}
                hint={`${stats.byLevel.info} information(s)`}
            />
            <StatCard
                icon={Clock}
                label="Dernières 24 h"
                value={String(stats.last24h)}
                hint={
                    stats.lastOccurrenceAt
                        ? `Dernier : ${formatFullDate(stats.lastOccurrenceAt)}`
                        : 'Aucun événement'
                }
            />
            <StatCard
                icon={AlertOctagon}
                label="Erreurs & incidents"
                value={String(incidents)}
                hint={`${stats.byLevel.warning} avertissement(s)`}
                tone={incidents > 0 ? 'danger' : 'neutral'}
            />
            <StatCard
                icon={Database}
                label="Domaines actifs"
                value={String(domains)}
                hint={topDomain ? `Plus bavard : ${topDomain.source} (${topDomain.count})` : 'Aucune activité'}
            />
        </div>
    );
};
