'use client';

import React from 'react';
import {
    Building2,
    Clapperboard,
    FileText,
    Film,
    GraduationCap,
    Handshake,
    Home,
    Layers,
    LayoutGrid,
    Sparkles,
    Users,
    Video,
} from 'lucide-react';
import { MEDIA_CATEGORIES, type MediaCategory } from '@/app/(admin)/admin/media-shared';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    Home,
    Building2,
    GraduationCap,
    Clapperboard,
    Users,
    Sparkles,
    Film,
    Handshake,
    Video,
    FileText,
    LayoutGrid,
};

export interface MediaCategoryPillsProps {
    selectedCategory: MediaCategory | 'all';
    onSelectCategory: (cat: MediaCategory | 'all') => void;
    categoryCounts: Record<string, number>;
    groupByCategory: boolean;
    onToggleGroupBy: () => void;
}

export const MediaCategoryPills: React.FC<MediaCategoryPillsProps> = ({
    selectedCategory,
    onSelectCategory,
    categoryCounts,
    groupByCategory,
    onToggleGroupBy,
}) => {
    return (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/5">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mr-1">
                Catégorie :
            </span>

            <button
                type="button"
                onClick={() => onSelectCategory('all')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                    selectedCategory === 'all'
                        ? 'bg-[#FFE500] text-black font-bold shadow-sm'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
            >
                <span>Toutes</span>
                <span
                    className={`text-[9px] px-1 rounded font-mono ${
                        selectedCategory === 'all' ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'
                    }`}
                >
                    {categoryCounts.all ?? 0}
                </span>
            </button>

            {MEDIA_CATEGORIES.map((cat) => {
                const count = categoryCounts[cat.id] ?? 0;
                if (count === 0 && selectedCategory !== cat.id) return null;
                const Icon = ICONS[cat.iconName] || LayoutGrid;
                const isSelected = selectedCategory === cat.id;

                return (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                            isSelected
                                ? 'bg-[#FFE500] text-black font-bold shadow-sm'
                                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20'
                        }`}
                        title={cat.description}
                    >
                        <Icon className="w-3 h-3 shrink-0" />
                        <span>{cat.shortLabel}</span>
                        <span
                            className={`text-[9px] px-1 rounded font-mono ${
                                isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'
                            }`}
                        >
                            {count}
                        </span>
                    </button>
                );
            })}

            <div className="ml-auto flex items-center">
                <button
                    type="button"
                    onClick={onToggleGroupBy}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 transition-colors ${
                        groupByCategory
                            ? 'bg-[#FFE500]/20 text-[#FFE500] border border-[#FFE500]/40 font-semibold'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                    }`}
                    title="Organiser et séparer les médias par sections de catégorie"
                >
                    <Layers className="w-3 h-3" />
                    <span>Grouper par catégorie</span>
                </button>
            </div>
        </div>
    );
};
