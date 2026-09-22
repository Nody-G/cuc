'use client';

import React from 'react';
import { Activity, RefreshCw, X } from 'lucide-react';

interface SystemHealthHeaderProps {
    measuredLabel: string;
    latencyMs?: number | null;
    isProbing: boolean;
    onProbe: () => void;
    onClose: () => void;
}

/** En-tête du moniteur : identité, horodatage de la mesure et actions. */
export const SystemHealthHeader: React.FC<SystemHealthHeaderProps> = ({
    measuredLabel,
    latencyMs,
    isProbing,
    onProbe,
    onClose,
}) => (
    <div className="flex items-start justify-between border-b border-white/10 pb-4">
        <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase mb-1">
                <Activity className="w-3.5 h-3.5" /> Diagnostic & Santé Opérationnelle
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Moniteur Système CUC
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
                Mesure réelle effectuée à {measuredLabel}
                {latencyMs !== null && latencyMs !== undefined
                    ? ` — latence Supabase ${latencyMs} ms`
                    : ''}
                .
            </p>
        </div>
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={onProbe}
                disabled={isProbing}
                title="Relancer la sonde"
                className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            >
                <RefreshCw className={`w-4 h-4 ${isProbing ? 'animate-spin' : ''}`} />
            </button>
            <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    </div>
);
