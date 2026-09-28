'use client';

import React from 'react';
import { Search, Film, Image as ImageIcon, LayoutGrid } from 'lucide-react';

export type MediaTabFilter = 'all' | 'video' | 'photo';
export type MediaSortOption = 'recent' | 'oldest' | 'views_desc' | 'likes_desc';

interface InstagramMediaFilterBarProps {
    search: string;
    onSearchChange: (val: string) => void;
    activeTab: MediaTabFilter;
    onSelectTab: (tab: MediaTabFilter) => void;
    sortOption: MediaSortOption;
    onSortChange: (sort: MediaSortOption) => void;
    totalCount: number;
    videoCount: number;
    photoCount: number;
    filteredCount: number;
}

export const InstagramMediaFilterBar: React.FC<InstagramMediaFilterBarProps> = ({
    search,
    onSearchChange,
    activeTab,
    onSelectTab,
    sortOption,
    onSortChange,
    totalCount,
    videoCount,
    photoCount,
    filteredCount,
}) => {
    return (
        <div className="space-y-3">
            {/* Onglets de type de média réels Instagram (zéro catégorie inventée) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center bg-[#12121a] p-1 rounded-xl border border-zinc-800 gap-1 flex-wrap">
                    <button
                        type="button"
                        onClick={() => onSelectTab('all')}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                            activeTab === 'all'
                                ? 'bg-[#FFE500] text-black font-bold shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Toutes ({totalCount})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectTab('video')}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                            activeTab === 'video'
                                ? 'bg-[#FFE500] text-black font-bold shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <Film className="w-3.5 h-3.5" />
                        <span>Vidéos & Reels ({videoCount})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectTab('photo')}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                            activeTab === 'photo'
                                ? 'bg-[#FFE500] text-black font-bold shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Photos & Albums ({photoCount})</span>
                    </button>
                </div>

                {/* Sélecteur de tri */}
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono-tech text-zinc-500 uppercase">Trier par :</span>
                    <select
                        value={sortOption}
                        onChange={(e) => onSortChange(e.target.value as MediaSortOption)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono-tech text-white focus:border-[#FFE500] focus:outline-none cursor-pointer"
                    >
                        <option value="recent">Plus récentes</option>
                        <option value="oldest">Plus anciennes</option>
                        <option value="views_desc">Plus de vues (vidéos)</option>
                        <option value="likes_desc">Plus de likes</option>
                    </select>
                </div>
            </div>

            {/* Barre de recherche & Compteur de résultats */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Rechercher dans les légendes ou par #shortcode..."
                        className="w-full bg-[#12121a] border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono-tech text-white placeholder-zinc-500 focus:border-[#FFE500] focus:outline-none"
                    />
                </div>

                <div className="text-xs font-mono-tech text-zinc-500">
                    <span className="text-white font-bold">{filteredCount}</span> publication{filteredCount > 1 ? 's' : ''} affichée{filteredCount > 1 ? 's' : ''}
                </div>
            </div>
        </div>
    );
};
