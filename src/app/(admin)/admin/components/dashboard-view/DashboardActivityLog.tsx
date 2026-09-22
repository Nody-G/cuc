'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import type { AuditLogEntry } from '@/lib/data/site-service';

interface DashboardActivityLogProps {
    logs: AuditLogEntry[];
}

/** Journal d'activités récentes (entrées d'audit, heure locale). */
export const DashboardActivityLog: React.FC<DashboardActivityLogProps> = ({ logs }) => (
    <div className="lg:col-span-2 bg-[#0D0D12] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="text-xs font-mono text-white font-bold uppercase flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FFE500]" /> Historique d'Activités Récentes
            </div>
            <span className="text-[10px] font-mono text-gray-400">Temps réel</span>
        </div>

        <div className="space-y-3">
            {logs.map((log) => (
                <div
                    key={log.id}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs"
                >
                    <div className="space-y-0.5">
                        <div className="font-semibold text-white flex items-center gap-2">
                            <span>{log.action}</span>
                            <span className="text-[10px] font-mono text-[#FFE500] bg-[#FFE500]/10 px-1.5 py-0.5 rounded-sm">
                                {log.entity}
                            </span>
                        </div>
                        {log.details && (
                            <div className="text-gray-400 text-[11px]">{log.details}</div>
                        )}
                        <div className="text-[10px] text-gray-500">Par {log.user_name}</div>
                    </div>

                    <span className="text-[10px] font-mono text-gray-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                </div>
            ))}
        </div>
    </div>
);
