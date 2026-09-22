'use client';

import React from 'react';
import { Search } from 'lucide-react';
import type { InquiryStatusFilter } from './useInquiryFilters';

export interface InquiryStats {
    total: number;
    nouveau: number;
    en_cours: number;
    admis: number;
}

export interface InquiryListToolbarProps {
    stats: InquiryStats;
    statusFilter: InquiryStatusFilter;
    onStatusFilterChange: (filter: InquiryStatusFilter) => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

/** Bandeau d'état (KPI) + filtres de statut et recherche de la liste. */
export const InquiryListToolbar: React.FC<InquiryListToolbarProps> = ({
    stats,
    statusFilter,
    onStatusFilterChange,
    searchQuery,
    onSearchChange,
}) => (
    <>
        {/* Cartes KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10">
                <div className="text-[11px] font-mono text-gray-400 uppercase">Total Dossiers</div>
                <div className="text-2xl font-black text-white mt-1">{stats.total}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 relative overflow-hidden">
                <div className="text-[11px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FFE500] animate-pulse" /> À Traiter
                </div>
                <div className="text-2xl font-black text-[#FFE500] mt-1">{stats.nouveau}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10">
                <div className="text-[11px] font-mono text-gray-400 uppercase">En Examen / Contactés</div>
                <div className="text-2xl font-black text-white mt-1">{stats.en_cours}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10">
                <div className="text-[11px] font-mono text-gray-400 uppercase">Admis / Conclus</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{stats.admis}</div>
            </div>
        </div>

        {/* Filtres & Recherche */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0D0D12] p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(
                    [
                        { id: 'all' as const, label: 'Toutes', count: stats.total },
                        { id: 'nouveau' as const, label: 'Nouvelles', count: stats.nouveau },
                        { id: 'en_cours' as const, label: 'En cours', count: stats.en_cours },
                        { id: 'admis' as const, label: 'Admis', count: stats.admis },
                        { id: 'refuse' as const, label: 'Refusées', count: undefined },
                        { id: 'archive' as const, label: 'Archivées', count: undefined },
                    ]
                ).map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onStatusFilterChange(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${statusFilter === tab.id
                            ? 'bg-[#FFE500] text-black font-bold'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <span>{tab.label}</span>
                        {tab.count !== undefined && tab.count > 0 && (
                            <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === tab.id ? 'bg-black text-[#FFE500]' : 'bg-white/10 text-gray-300'
                                    }`}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Rechercher par nom, email..."
                    className="w-full bg-[#14141c] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-[#FFE500] focus:outline-hidden"
                />
            </div>
        </div>
    </>
);
