import React from 'react';
import { Activity, Clock, User } from 'lucide-react';
import { CockpitCard } from '../ui';
import type { AuditStats } from './useAuditLogData';

export interface AuditStatsCardsProps {
    stats: AuditStats;
}

export const AuditStatsCards: React.FC<AuditStatsCardsProps> = ({ stats }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CockpitCard className="p-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#FFE500]/10 text-[#FFE500]">
                    <Activity className="w-4 h-4" />
                </div>
                <div>
                    <div className="text-lg font-bold text-white">{stats.total}</div>
                    <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                        Entrées conservées
                    </div>
                </div>
            </div>
        </CockpitCard>

        <CockpitCard className="p-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Clock className="w-4 h-4" />
                </div>
                <div>
                    <div className="text-lg font-bold text-white">{stats.last24h}</div>
                    <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                        Dernières 24 h
                    </div>
                </div>
            </div>
        </CockpitCard>

        <CockpitCard className="p-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                    <User className="w-4 h-4" />
                </div>
                <div>
                    <div className="text-lg font-bold text-white">{stats.authors}</div>
                    <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                        Auteurs distincts
                    </div>
                </div>
            </div>
        </CockpitCard>
    </div>
);
