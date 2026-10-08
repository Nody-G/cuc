'use client';

import React, { useState } from 'react';
import {
    Building2,
    ChevronDown,
    ChevronRight,
    Clapperboard,
    FileText,
    Film,
    FolderTree,
    GraduationCap,
    Handshake,
    Home,
    Layers,
    LayoutGrid,
    Sparkles,
    Users,
    Video,
} from 'lucide-react';
import {
    MEDIA_CATEGORIES,
    formatBytes,
    folderLabel,
    type MediaCategory,
    type MediaFolderStat,
} from '@/app/(admin)/admin/media-shared';

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

export interface MediaTreeAsideProps {
    tree: MediaFolderStat[];
    total: { files: number; bytes: number };
    prefix: string;
    onNavigate: (path: string) => void;
    selectedCategory?: MediaCategory | 'all';
    onSelectCategory?: (cat: MediaCategory | 'all') => void;
    categoryCounts?: Record<string, number>;
}

/**
 * Arborescence de navigation de la médiathèque :
 * 1. Catégories thématiques métier (Accueil, Campus, Équipe, etc.)
 * 2. Arborescence des dossiers techniques du bucket Supabase
 */
export const MediaTreeAside: React.FC<MediaTreeAsideProps> = ({
    tree,
    total,
    prefix,
    onNavigate,
    selectedCategory = 'all',
    onSelectCategory,
    categoryCounts = {},
}) => {
    const [foldersOpen, setFoldersOpen] = useState(false);

    return (
        <aside className="bg-[#0D0D12] border border-white/10 rounded-xl p-3 h-fit lg:sticky lg:top-4 space-y-4">
            {/* 1. Navigation par catégories */}
            <div>
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-2.5">
                    <Layers className="w-3.5 h-3.5 text-[#FFE500]" /> Catégories
                </div>

                <button
                    type="button"
                    onClick={() => onSelectCategory?.('all')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        selectedCategory === 'all'
                            ? 'bg-[#FFE500]/10 text-[#FFE500] font-bold'
                            : 'text-gray-300 hover:bg-white/5'
                    }`}
                >
                    <span className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span>Toutes</span>
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                            {categoryCounts.all ?? total.files}
                        </span>
                    </span>
                </button>

                <div className="mt-1 space-y-0.5">
                    {MEDIA_CATEGORIES.map((cat) => {
                        const Icon = ICONS[cat.iconName] || LayoutGrid;
                        const isSelected = selectedCategory === cat.id;
                        const count = categoryCounts[cat.id] ?? 0;

                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => onSelectCategory?.(cat.id)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                    isSelected
                                        ? 'bg-[#FFE500]/10 text-[#FFE500] font-bold'
                                        : 'text-gray-300 hover:bg-white/5'
                                }`}
                                title={cat.description}
                            >
                                <span className="flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-2 truncate">
                                        <Icon className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                        <span className="truncate">{cat.shortLabel}</span>
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-mono shrink-0">
                                        {count}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Dossiers de stockage physique (repliable) */}
            <div className="pt-3 border-t border-white/10">
                <button
                    type="button"
                    onClick={() => setFoldersOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-gray-400 hover:text-white mb-2"
                >
                    <span className="flex items-center gap-2">
                        <FolderTree className="w-3.5 h-3.5 text-gray-400" /> Dossiers Bucket
                    </span>
                    {foldersOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>

                {foldersOpen && (
                    <div className="mt-1 space-y-0.5 animate-fadeIn">
                        <button
                            type="button"
                            onClick={() => onNavigate('')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                prefix === '' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:bg-white/5'
                            }`}
                        >
                            <span className="flex items-center justify-between gap-2">
                                <span>Racine (tout)</span>
                                <span className="text-[10px] text-gray-500 font-mono">{total.files}</span>
                            </span>
                        </button>

                        {tree.map((folder) => (
                            <button
                                key={folder.path}
                                type="button"
                                onClick={() => onNavigate(folder.path)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                    prefix === folder.path
                                        ? 'bg-white/10 text-white font-medium'
                                        : 'text-gray-400 hover:bg-white/5'
                                }`}
                                title={folder.path}
                            >
                                <span className="flex items-center justify-between gap-2">
                                    <span className="truncate">{folderLabel(folder.path)}</span>
                                    <span className="text-[10px] text-gray-500 font-mono shrink-0">
                                        {folder.files}
                                    </span>
                                </span>
                                <span className="block text-[9px] text-gray-500 font-mono">
                                    {formatBytes(folder.bytes)}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. Totaux de stockage */}
            <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-gray-400 space-y-1">
                <div className="flex items-center justify-between">
                    <span>Objets</span>
                    <span className="text-gray-200">{total.files}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span>Poids</span>
                    <span className="text-gray-200">{formatBytes(total.bytes)}</span>
                </div>
            </div>
        </aside>
    );
};
