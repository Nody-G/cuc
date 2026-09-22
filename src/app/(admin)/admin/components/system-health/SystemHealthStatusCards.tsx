'use client';

import React from 'react';
import { Award, Zap } from 'lucide-react';
import { REALTIME_STYLES, type RealtimeStatus } from './health-state';

interface RealtimeStatusCardProps {
    status: RealtimeStatus;
}

/** État du canal Supabase Realtime du Cockpit. */
export const RealtimeStatusCard: React.FC<RealtimeStatusCardProps> = ({ status }) => {
    const style = REALTIME_STYLES[status];
    return (
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-gray-300">
                    <Zap className="w-4 h-4 text-[#FFE500]" />
                    <span>Flux Realtime</span>
                </div>
                <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${style.badge}`}
                >
                    {style.label}
                </span>
            </div>
            <div className="text-gray-400 text-[11px]">
                Canal Supabase Realtime du Cockpit (sessions, leads, contenus).
            </div>
        </div>
    );
};

/** Certification Qualiopi (numéro et financeurs). */
export const QualiopiCard: React.FC = () => (
    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-gray-300">
                <Award className="w-4 h-4 text-purple-400" />
                <span>Label Qualiopi</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                CERTIFIÉ
            </span>
        </div>
        <div className="text-gray-400 text-[11px]">
            N° 21452296 — AFDAS, France Travail & OPCO.
        </div>
    </div>
);

interface ActivityIndicatorsCardProps {
    actualNewInquiries: number;
    inquiriesCount: number;
    fullSessions: number;
    totalSessions: number;
}

/** Indicateurs d'activité immédiate (demandes à traiter, sessions complètes). */
export const ActivityIndicatorsCard: React.FC<ActivityIndicatorsCardProps> = ({
    actualNewInquiries,
    inquiriesCount,
    fullSessions,
    totalSessions,
}) => (
    <div className="p-4 rounded-xl bg-[#08080C] border border-white/10 space-y-3 text-xs">
        <div className="font-mono text-gray-400 uppercase text-[11px] font-bold">
            Indicateurs d'Activité Immédiate
        </div>
        <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
                <span className="text-gray-300">Demandes à traiter :</span>
                <strong className={actualNewInquiries > 0 ? 'text-[#FFE500]' : 'text-gray-400'}>
                    {actualNewInquiries} / {inquiriesCount}
                </strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
                <span className="text-gray-300">Sessions complètes :</span>
                <strong className={fullSessions > 0 ? 'text-amber-400' : 'text-gray-400'}>
                    {fullSessions} / {totalSessions}
                </strong>
            </div>
        </div>
    </div>
);
