'use client';

import React from 'react';
import { Search, Film, Image as ImageIcon, LayoutGrid, List, Star, Zap } from 'lucide-react';

export type MediaTabFilter = 'all' | 'video' | 'photo' | 'featured';
export type MediaSortOption = 'recent' | 'oldest' | 'views_desc' | 'likes_desc' | 'comments_desc' | 'engagement_desc';
export type MediaViewMode = 'grid' | 'table';

interface InstagramMediaFilterBarProps {
    search: string;
    onSearchChange: (val: string) => void;
    activeTab: MediaTabFilter;
    onSelectTab: (tab: MediaTabFilter) => void;
    sortOption: MediaSortOption;
    onSortChange: (sort: MediaSortOption) => void;
    viewMode: MediaViewMode;
    onViewModeChange: (mode: MediaViewMode) => void;
    totalCount: number;
    videoCount: number;
    photoCount: number;
    featuredCount: number;
    filteredCount: number;
}

export const InstagramMediaFilterBar: React.FC<InstagramMediaFilterBarProps> = ({
    search,
    onSearchChange,
    activeTab,
    onSelectTab,
    sortOption,
    onSortChange,
    viewMode,
    onViewModeChange,
    totalCount,
    videoCount,
    photoCount,
    featuredCount,
    filteredCount,
}) => {
    return (
        <div className="space-y-3.5">
            {/* Barre supérieure : Onglets réels + Sélecteur de tri + Toggle Vue */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Onglets réels de filtrage */}
                <div className="flex items-center bg-[#12121a] p-1 rounded-xl border border-zinc-800 gap-1 flex-wrap">
                    <button
                        type="button"
                        onClick={() => onSelectTab('all')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
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
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                            activeTab === 'video'
                                ? 'bg-[#FFE500] text-black font-bold shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <Film className="w-3.5 h-3.5" />
                        <span>Vidéos ({videoCount})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectTab('photo')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                            activeTab === 'photo'
                                ? 'bg-[#FFE500] text-black font-bold shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Photos ({photoCount})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectTab('featured')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                            activeTab === 'featured'
                                ? 'bg-[#FFE500] text-black font-bold shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                        title="Vidéos mises en avant sur le site vitrine"
                    >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>En vitrine ({featuredCount})</span>
                    </button>
                </div>

                <div className="flex items-center gap-3 self-end lg:self-center flex-wrap">
                    {/* Sélecteur de tri */}
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono-tech text-zinc-500 uppercase">Trier :</span>
                        <select
                            value={sortOption}
                            onChange={(e) => onSortChange(e.target.value as MediaSortOption)}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono-tech text-white focus:border-[#FFE500] focus:outline-none cursor-pointer"
                        >
                            <option value="recent">Plus récentes</option>
                            <option value="oldest">Plus anciennes</option>
                            <option value="views_desc">Top Vues (Vidéos)</option>
                            <option value="likes_desc">Top J'aime</option>
                            <option value="comments_desc">Top Commentaires</option>
                            <option value="engagement_desc">Taux d'engagement (%)</option>
                        </select>
                    </div>

                    {/* Toggle Vue Grille / Table */}
                    <div className="flex items-center bg-[#12121a] p-1 rounded-xl border border-zinc-800 gap-1">
                        <button
                            type="button"
                            onClick={() => onViewModeChange('grid')}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                viewMode === 'grid'
                                    ? 'bg-[#FFE500] text-black font-bold'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                            title="Affichage en grille visuelle"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onViewModeChange('table')}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                viewMode === 'table'
                                    ? 'bg-[#FFE500] text-black font-bold'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                            title="Affichage en tableau de suivi dense"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Barre de recherche & Compteur de résultats */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-0.5">
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

                <div className="text-xs font-mono-tech text-zinc-500 flex items-center gap-2">
                    <span>
                        <strong className="text-white font-bold">{filteredCount}</strong> publication{filteredCount > 1 ? 's' : ''} affichée{filteredCount > 1 ? 's' : ''}
                    </span>
                    {sortOption === 'engagement_desc' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono-tech">
                            <Zap className="w-3 h-3" /> Tri par engagement
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
