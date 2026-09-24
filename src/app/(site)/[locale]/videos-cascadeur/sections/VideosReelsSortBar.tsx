'use client';

import React from 'react';
import { Sparkles, Eye, Clock, ArrowDownUp } from 'lucide-react';
import type { ReelSortOption } from '@/data/instagram-reels';

export interface VideosReelsSortBarProps {
    sortBy: ReelSortOption;
    onChangeSort: (option: ReelSortOption) => void;
    totalCount: number;
    labels: {
        sortByFeatured?: string;
        sortByViews?: string;
        sortByDateDesc?: string;
        sortByDateAsc?: string;
    };
}

/**
 * Barre de tri officielle pour la vidéothèque des Reels CUC.
 * Permet d'alterner entre l'ordre mis en avant (Cockpit),
 * les plus viraux (nombre de vues) et la chronologie.
 */
export const VideosReelsSortBar: React.FC<VideosReelsSortBarProps> = ({
    sortBy,
    onChangeSort,
    totalCount,
    labels,
}) => {
    const sortButtons: Array<{
        id: ReelSortOption;
        label: string;
        icon: React.ReactNode;
    }> = [
        {
            id: 'featured',
            label: labels.sortByFeatured || 'Mis en avant',
            icon: <Sparkles className="w-3.5 h-3.5 text-[#FFE500]" />,
        },
        {
            id: 'views',
            label: labels.sortByViews || 'Nombre de vues',
            icon: <Eye className="w-3.5 h-3.5 text-[#FFE500]" />,
        },
        {
            id: 'recent',
            label: labels.sortByDateDesc || 'Plus récentes',
            icon: <Clock className="w-3.5 h-3.5 text-[#FFE500]" />,
        },
        {
            id: 'oldest',
            label: labels.sortByDateAsc || 'Plus anciennes',
            icon: <ArrowDownUp className="w-3.5 h-3.5 text-[#FFE500]" />,
        },
    ];

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-800/80">
            {/* Décompte officiel */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-mono-tech uppercase tracking-wider text-zinc-400">
                    Catalogue vidéo officiel :
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FFE500]/10 border border-[#FFE500]/30 text-xs font-mono-tech text-[#FFE500] font-bold">
                    {totalCount} Reels
                </span>
            </div>

            {/* Boutons de tri */}
            <div className="flex items-center gap-1.5 flex-wrap">
                {sortButtons.map((btn) => {
                    const isActive = sortBy === btn.id;
                    return (
                        <button
                            key={btn.id}
                            type="button"
                            onClick={() => onChangeSort(btn.id)}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono-tech uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                isActive
                                    ? 'bg-[#FFE500] text-black font-bold shadow-[0_0_15px_rgba(255,229,0,0.3)]'
                                    : 'bg-[#0f0f15] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
                            }`}
                        >
                            <span className={isActive ? 'text-black' : ''}>{btn.icon}</span>
                            <span>{btn.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
