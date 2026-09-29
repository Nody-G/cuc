'use client';

/**
 * Liste chronologique du hub Journal, groupée par jour.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1). Trois états sont distingués et
 * **ne se confondent jamais** :
 *  - `refused` : la lecture a été refusée (rôle insuffisant) — ce n'est pas une
 *    absence d'activité, et le dire autrement serait un mensonge d'interface ;
 *  - `error` : la lecture a échoué — la cause est affichée telle quelle ;
 *  - liste vide : plus aucune donnée ne correspond, avec un message adapté selon
 *    que des filtres sont actifs ou non.
 */

import React from 'react';
import { Inbox, ShieldAlert, TriangleAlert } from 'lucide-react';
import type { ActivityLogEntry } from '@/lib/logging/types';
import { CockpitCard, CockpitEmptyState, CockpitLoadMore, CockpitSkeletonList } from '../ui';
import { groupLogsByDay } from './log-hub-model';
import { LogEntryRow } from './LogEntryRow';

interface LogHubListProps {
    entries: ActivityLogEntry[];
    visibleEntries: ActivityLogEntry[];
    total: number;
    visibleCount: number;
    loading: boolean;
    loadingMore: boolean;
    refused: boolean;
    error: string | null;
    hasActiveFilters: boolean;
    now: number;
    onLoadMore: () => void;
    onOpenEntry: (entry: ActivityLogEntry) => void;
}

export const LogHubList: React.FC<LogHubListProps> = ({
    entries,
    visibleEntries,
    total,
    visibleCount,
    loading,
    loadingMore,
    refused,
    error,
    hasActiveFilters,
    now,
    onLoadMore,
    onOpenEntry,
}) => {
    if (refused) {
        return (
            <CockpitEmptyState
                icon={ShieldAlert}
                title="Lecture réservée à la Direction"
                description="Le journal technique nomme des tables, des routes et des incidents. Seuls les rôles admin et directeur peuvent le consulter."
            />
        );
    }

    if (loading) {
        return (
            <CockpitCard padding="sm">
                <CockpitSkeletonList rows={6} />
            </CockpitCard>
        );
    }

    if (error) {
        return (
            <CockpitEmptyState
                icon={TriangleAlert}
                title="Lecture impossible"
                description={`La base n’a pas répondu à la demande : ${error}`}
            />
        );
    }

    if (entries.length === 0) {
        return (
            <CockpitEmptyState
                icon={Inbox}
                title={hasActiveFilters ? 'Aucun événement pour ces filtres' : 'Aucun événement technique enregistré'}
                description={
                    hasActiveFilters
                        ? 'Élargissez la période ou retirez un filtre de gravité ou de domaine.'
                        : 'Cette page se remplira d’elle-même : erreurs de base classées, canaux temps réel rompus, e-mails refusés, synchronisations et frontières d’erreur du site.'
                }
            />
        );
    }

    const groups = groupLogsByDay(visibleEntries, now);

    return (
        <div className="space-y-5">
            {groups.map((group) => (
                <div key={group.key} className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h3 className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                            {group.label}
                        </h3>
                        <span className="text-[10px] font-mono text-gray-600">
                            {group.entries.length} événement(s)
                        </span>
                        <span className="flex-1 h-px bg-white/5" />
                    </div>
                    <div className="space-y-1.5">
                        {group.entries.map((entry) => (
                            <LogEntryRow key={entry.id} entry={entry} onOpen={onOpenEntry} />
                        ))}
                    </div>
                </div>
            ))}

            {loadingMore && <CockpitSkeletonList rows={2} />}

            <CockpitLoadMore
                visibleCount={visibleCount}
                total={Math.max(total, entries.length)}
                onLoadMore={onLoadMore}
                label="Afficher les événements suivants"
            />
        </div>
    );
};
