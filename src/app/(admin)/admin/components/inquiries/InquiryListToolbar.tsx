'use client';

import React from 'react';
import { Search } from 'lucide-react';
import {
    PIPELINE_CATALOG,
    type PipelineId,
    type Pipeline,
} from '@/lib/inquiries/pipelines';
import type { PipelineStats } from '@/lib/inquiries/inquiry-stats';
import type { InquiryStageFilter } from './useInquiryFilters';

export interface InquiryListToolbarProps {
    /** Pipeline actif — détermine les onglets d'étape. */
    pipeline: Pipeline;
    pipelineFilter: PipelineId;
    pipelineTotals: Record<PipelineId, number>;
    onPipelineChange: (pipeline: PipelineId) => void;
    stats: PipelineStats;
    stageFilter: InquiryStageFilter;
    onStageFilterChange: (filter: InquiryStageFilter) => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

/** Bandeau d'état (KPI) + sélection du pipeline, filtres d'étape et recherche. */
export const InquiryListToolbar: React.FC<InquiryListToolbarProps> = ({
    pipeline,
    pipelineFilter,
    pipelineTotals,
    onPipelineChange,
    stats,
    stageFilter,
    onStageFilterChange,
    searchQuery,
    onSearchChange,
}) => (
    <>
        {/* Sélection du pipeline : un dossier de tournage n'est pas une admission */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-[#0D0D12] p-2 rounded-xl border border-white/10">
            {PIPELINE_CATALOG.map((item) => {
                const isActive = pipelineFilter === item.id;
                const count = pipelineTotals[item.id] ?? 0;
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onPipelineChange(item.id)}
                        title={item.description}
                        className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${isActive
                                ? 'bg-[#FFE500] text-black'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <span>{item.label}</span>
                        <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black text-[#FFE500]' : 'bg-white/10 text-gray-300'
                                }`}
                        >
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>

        {/* Cartes KPI — vocabulaire du pipeline, jamais « admis » pour un tournage */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10">
                <div className="text-[11px] font-mono text-gray-400 uppercase">Total dossiers</div>
                <div className="text-2xl font-black text-white mt-1">{stats.total}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10">
                <div className="text-[11px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FFE500] animate-pulse" /> À traiter
                </div>
                <div className="text-2xl font-black text-[#FFE500] mt-1">{stats.toProcess}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10">
                <div className="text-[11px] font-mono text-gray-400 uppercase">En cours</div>
                <div className="text-2xl font-black text-white mt-1">{stats.inProgress}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10">
                <div className="text-[11px] font-mono text-gray-400 uppercase">Conclus</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{stats.won}</div>
                {stats.lost > 0 && (
                    <div className="text-[10px] font-mono text-red-400 mt-0.5">
                        {stats.lost} écarté{stats.lost > 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>

        {/* Filtres d'étape du pipeline actif & recherche */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0D0D12] p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                    type="button"
                    onClick={() => onStageFilterChange('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${stageFilter === 'all'
                            ? 'bg-[#FFE500] text-black font-bold'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <span>Toutes</span>
                    <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${stageFilter === 'all' ? 'bg-black text-[#FFE500]' : 'bg-white/10 text-gray-300'
                            }`}
                    >
                        {stats.total}
                    </span>
                </button>
                {pipeline.stages.map((stage) => {
                    const count = stats.byStage[stage.id] ?? 0;
                    const isActive = stageFilter === stage.id;
                    return (
                        <button
                            key={stage.id}
                            type="button"
                            onClick={() => onStageFilterChange(stage.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${isActive
                                    ? 'bg-[#FFE500] text-black font-bold'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span>{stage.label}</span>
                            {count > 0 && (
                                <span
                                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black text-[#FFE500]' : 'bg-white/10 text-gray-300'
                                        }`}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="relative w-full sm:w-64 shrink-0">
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
