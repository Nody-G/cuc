'use client';

import React from 'react';
import { Download, Inbox, RefreshCw } from 'lucide-react';

export interface InquiriesHeaderProps {
    loading: boolean;
    onExport: () => void;
    onRefresh: () => void;
}

/** En-tête du pôle admissions : intitulé + export CSV et rafraîchissement. */
export const InquiriesHeader: React.FC<InquiriesHeaderProps> = ({
    loading,
    onExport,
    onRefresh,
}) => (
    <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                <Inbox className="w-3.5 h-3.5" /> Pôle Admissions & Relations Candidats
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                Candidatures & Demandes de Contact
            </h1>
            <p className="text-sm text-gray-400 mt-1">
                Gérez en temps réel les dossiers de sélection aux formations, inscriptions aux stages et devis d'entreprises.
            </p>
        </div>

        <div className="flex items-center gap-2.5">
            <button
                type="button"
                onClick={onExport}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 flex items-center gap-2 transition-colors cursor-pointer"
            >
                <Download className="w-3.5 h-3.5 text-[#FFE500]" />
                <span>Exporter CSV</span>
            </button>
            <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Rafraîchir"
            >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FFE500]' : ''}`} />
            </button>
        </div>
    </div>
);
