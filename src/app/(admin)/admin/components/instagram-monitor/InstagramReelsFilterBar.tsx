'use client';

import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import type { InstagramReelMetric } from '@/types/instagram-monitor';

export type ReelSortMode = 'views_desc' | 'views_asc' | 'date_desc' | 'date_asc' | 'likes_desc';

interface InstagramReelsFilterBarProps {
    reels: InstagramReelMetric[];
    search: string;
    onSearchChange: (val: string) => void;
    selectedCategory: string;
    onSelectCategory: (cat: string) => void;
    sortMode: ReelSortMode;
    onSortModeChange: (mode: ReelSortMode) => void;
    filteredCount: number;
}

const CATEGORIES: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'Toutes', icon: '🎬' },
    { id: 'fire', label: 'Feu & Torches', icon: '🔥' },
    { id: 'car', label: 'Véhicules & Percussions', icon: '🚗' },
    { id: 'height', label: 'Hauteur & Câblage', icon: '🏢' },
    { id: 'combat', label: 'Combat & Sabres', icon: '🥋' },
    { id: 'parkour', label: 'Parkour & Yamakasi', icon: '🏃' },
    { id: 'workshop', label: 'Campus & Workshops', icon: '🎯' },
];

export const InstagramReelsFilterBar: React.FC<InstagramReelsFilterBarProps> = ({
    reels,
    search,
    onSearchChange,
    selectedCategory,
    onSelectCategory,
    sortMode,
    onSortModeChange,
    filteredCount,
}) => {
    // Calcul du nombre de vidéos par catégorie
    const countsByCategory = React.useMemo(() => {
        const counts: Record<string, number> = { all: reels.length };
        reels.forEach((r) => {
            const cat = r.stuntCategory || 'workshop';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }, [reels]);

    return (
        <div className="space-y-3 pt-2">
            {/* Onglets de filtrage par catégorie de cascade */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {CATEGORIES.map((cat) => {
                    const count = countsByCategory[cat.id] || 0;
                    const isActive = selectedCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => onSelectCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono-tech whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                isActive
                                    ? 'bg-[#FFE500] text-black font-bold shadow-[0_0_12px_rgba(255,229,0,0.3)]'
                                    : 'bg-[#121218] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                            }`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                            <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                    isActive ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-300'
                                }`}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Barre de recherche & Tri */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-grow">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Rechercher par titre, shortcode (#DdEoOcyM-We) ou cascade..."
                        className="w-full bg-[#121218] border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs font-mono-tech text-white placeholder-zinc-500 focus:border-[#FFE500] focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-[#121218] border border-zinc-800 rounded-xl">
                        <ArrowUpDown className="w-3.5 h-3.5 text-[#FFE500]" />
                        <select
                            value={sortMode}
                            onChange={(e) => onSortModeChange(e.target.value as ReelSortMode)}
                            className="bg-transparent text-xs font-mono-tech text-zinc-200 focus:outline-none cursor-pointer"
                        >
                            <option value="views_desc" className="bg-[#121218] text-white">
                                💥 Plus vues d&apos;abord
                            </option>
                            <option value="views_asc" className="bg-[#121218] text-white">
                                📉 Moins vues d&apos;abord
                            </option>
                            <option value="date_desc" className="bg-[#121218] text-white">
                                📅 Plus récentes
                            </option>
                            <option value="date_asc" className="bg-[#121218] text-white">
                                ⏳ Plus anciennes
                            </option>
                            <option value="likes_desc" className="bg-[#121218] text-white">
                                👍 Plus de likes
                            </option>
                        </select>
                    </div>

                    <span className="text-[11px] font-mono-tech text-zinc-500 hidden sm:inline whitespace-nowrap">
                        {filteredCount} / {reels.length} vidéos
                    </span>
                </div>
            </div>
        </div>
    );
};
