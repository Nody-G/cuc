import React from 'react';
import { Clock, User } from 'lucide-react';
import type { AuditLogEntry } from '@/lib/data/site-service';
import { CockpitCard, CockpitBadge } from '../ui';
import { formatFullDate } from './audit-format';
import { resolveActionVisual, resolveEntityVisual } from './audit-visuals';

export interface AuditLogEntryCardProps {
    log: AuditLogEntry;
}

export const AuditLogEntryCard: React.FC<AuditLogEntryCardProps> = ({ log }) => {
    const visual = resolveActionVisual(log.action);
    const ActionIcon = visual.icon;
    const entityVisual = resolveEntityVisual(log.entity);
    const EntityIcon = entityVisual.icon;

    return (
        <CockpitCard className="p-3.5">
            <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/5 text-zinc-300 shrink-0 mt-0.5">
                    <ActionIcon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                            {log.action}
                        </span>
                        <CockpitBadge tone={visual.tone}>
                            <span className="inline-flex items-center gap-1">
                                <EntityIcon className="w-3 h-3" />
                                {log.entity}
                            </span>
                        </CockpitBadge>
                    </div>

                    {log.details && (
                        <p className="text-xs text-zinc-400 leading-relaxed break-words">
                            {log.details}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.user_name || 'Administrateur'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatFullDate(log.created_at)}
                        </span>
                    </div>
                </div>
            </div>
        </CockpitCard>
    );
};
