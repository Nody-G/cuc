'use client';

import React from 'react';
import {
    ArrowUpDown,
    ChevronRight,
    FolderPlus,
    Grid2X2,
    List as ListIcon,
    RefreshCw,
    Search,
    X,
} from 'lucide-react';
import type { MediaKind } from '@/app/(admin)/admin/media-shared';
import { KIND_ICON, KIND_LABEL, type ExplorerView } from './media-explorer-shared';

export interface MediaToolbarProps {
    mode: 'manage' | 'pick';
    search: string;
    onSearchChange: (value: string) => void;
    onClearSearch: () => void;
    sortBy: 'name' | 'created_at' | 'size';
    order: 'asc' | 'desc';
    onChangeSort: () => void;
    onToggleOrder: () => void;
    view: ExplorerView;
    onViewChange: (view: ExplorerView) => void;
    loading: boolean;
    onRefresh: () => void;
    kinds: MediaKind[];
    onToggleKind: (kind: MediaKind) => void;
    newFolder: string;
    onNewFolderChange: (value: string) => void;
    onCreateFolder: () => void;
    segmentation: string[];
    searching: boolean;
    resultCount: number;
    onNavigate: (path: string) => void;
}

/**
 * Barre d'outils de la médiathèque : recherche globale, tri, vue, filtres de
 * nature, création de dossier et fil d'Ariane. Composant de présentation pur.
 */
export const MediaToolbar: React.FC<MediaToolbarProps> = ({
    mode,
    search,
    onSearchChange,
    onClearSearch,
    sortBy,
    order,
    onChangeSort,
    onToggleOrder,
    view,
    onViewChange,
    loading,
    onRefresh,
    kinds,
    onToggleKind,
    newFolder,
    onNewFolderChange,
    onCreateFolder,
    segmentation,
    searching,
    resultCount,
    onNavigate,
}) => (
    <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-3 space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Rechercher dans tout le bucket (nom, dossier)…"
                    className="w-full bg-black/60 border border-white/15 rounded-lg pl-9 pr-9 py-2 text-xs text-white focus:outline-none focus:border-[#FFE500]"
                />
                {search && (
                    <button
                        type="button"
                        onClick={onClearSearch}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        aria-label="Effacer la recherche"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <button
                    type="button"
                    onClick={onChangeSort}
                    className="px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-gray-200 flex items-center gap-1.5"
                    title="Changer le critère de tri"
                >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    {sortBy === 'name' ? 'Nom' : sortBy === 'created_at' ? 'Date' : 'Poids'}
                </button>
                <button
                    type="button"
                    onClick={onToggleOrder}
                    className="px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-gray-200"
                    title="Inverser l'ordre"
                >
                    {order === 'asc' ? 'A→Z' : 'Z→A'}
                </button>
                <div className="flex items-center rounded-lg bg-white/5 p-0.5">
                    <button
                        type="button"
                        onClick={() => onViewChange('grid')}
                        className={`p-1.5 rounded ${view === 'grid' ? 'bg-[#FFE500] text-black' : 'text-gray-300'}`}
                        aria-label="Vue grille"
                    >
                        <Grid2X2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewChange('list')}
                        className={`p-1.5 rounded ${view === 'list' ? 'bg-[#FFE500] text-black' : 'text-gray-300'}`}
                        aria-label="Vue liste"
                    >
                        <ListIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
                <button
                    type="button"
                    onClick={onRefresh}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-[#FFE500]"
                    title="Rafraîchir"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>

        {/* Filtres par type + actions de dossier */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {(Object.keys(KIND_LABEL) as MediaKind[]).map((kind) => {
                const Icon = KIND_ICON[kind];
                const active = kinds.includes(kind);
                return (
                    <button
                        key={kind}
                        type="button"
                        onClick={() => onToggleKind(kind)}
                        className={`px-2.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-colors ${active
                            ? 'border-[#FFE500] text-[#FFE500] bg-[#FFE500]/10'
                            : 'border-white/10 text-gray-300 hover:border-white/30'
                            }`}
                    >
                        <Icon className="w-3 h-3" />
                        {KIND_LABEL[kind]}
                    </button>
                );
            })}

            {mode === 'manage' && (
                <div className="flex items-center gap-2 ml-auto">
                    <input
                        value={newFolder}
                        onChange={(event) => onNewFolderChange(event.target.value)}
                        placeholder="nouveau-dossier"
                        className="w-36 bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFE500]"
                    />
                    <button
                        type="button"
                        onClick={onCreateFolder}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 flex items-center gap-1.5"
                    >
                        <FolderPlus className="w-3.5 h-3.5" /> Créer
                    </button>
                </div>
            )}
        </div>

        {/* Fil d'Ariane */}
        <div className="flex items-center gap-1 text-[11px] font-mono text-gray-400 flex-wrap">
            <button type="button" onClick={() => onNavigate('')} className="hover:text-[#FFE500]">
                cuc-vitrine-assets
            </button>
            {segmentation.map((segment, index) => {
                const path = segmentation.slice(0, index + 1).join('/');
                return (
                    <React.Fragment key={path}>
                        <ChevronRight className="w-3 h-3 text-gray-600" />
                        <button
                            type="button"
                            onClick={() => onNavigate(path)}
                            className={index === segmentation.length - 1 ? 'text-gray-200' : 'hover:text-[#FFE500]'}
                        >
                            {segment}
                        </button>
                    </React.Fragment>
                );
            })}
            {searching && (
                <span className="ml-2 text-[#FFE500]">
                    · recherche globale ({resultCount} résultat(s))
                </span>
            )}
        </div>
    </div>
);
