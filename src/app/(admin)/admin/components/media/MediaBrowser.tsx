'use client';

import React from 'react';
import { FolderTree, Upload } from 'lucide-react';
import { formatBytes, type MediaObject } from '@/app/(admin)/admin/media-shared';
import { KIND_ICON, PAGE_SIZE, type ExplorerView } from './media-explorer-shared';
import { MediaTile } from './MediaTile';

export interface MediaBrowserProps {
    mode: 'manage' | 'pick';
    prefix: string;
    folders: { name: string; path: string }[];
    onNavigate: (path: string) => void;
    searching: boolean;
    loading: boolean;
    visibleFiles: MediaObject[];
    view: ExplorerView;
    selectionSet: Set<string>;
    onToggleSelect: (file: MediaObject, event: React.MouseEvent) => void;
    onTogglePath: (path: string) => void;
    onOpenDetail: (file: MediaObject) => void;
    references: Record<string, string[]> | null;
    onPick: (url: string) => void;
    kindsCount: number;
    catalogueLoading: boolean;
    uploading: boolean;
    uploadCount: { done: number; total: number };
    dragActive: boolean;
    onDragActiveChange: (active: boolean) => void;
    onUpload: (files: FileList | null) => void;
    hasMore: boolean;
    loadingMore: boolean;
    onLoadMore: () => void;
}

/**
 * Zone centrale de la médiathèque : dépôt de fichiers, raccourcis de
 * sous-dossiers, grille ou liste des médias, pagination. Composant de
 * présentation pur (`AGENTS.md` § 1) — aucun accès réseau direct.
 */
export const MediaBrowser: React.FC<MediaBrowserProps> = ({
    mode,
    prefix,
    folders,
    onNavigate,
    searching,
    loading,
    visibleFiles,
    view,
    selectionSet,
    onToggleSelect,
    onTogglePath,
    onOpenDetail,
    references,
    onPick,
    kindsCount,
    catalogueLoading,
    uploading,
    uploadCount,
    dragActive,
    onDragActiveChange,
    onUpload,
    hasMore,
    loadingMore,
    onLoadMore,
}) => (
    <div className="min-w-0 space-y-4">
        {/* Zone de dépôt */}
        {mode === 'manage' && (
            <label
                onDragOver={(event) => {
                    event.preventDefault();
                    onDragActiveChange(true);
                }}
                onDragLeave={() => onDragActiveChange(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    onDragActiveChange(false);
                    onUpload(event.dataTransfer.files);
                }}
                className={`flex items-center justify-center gap-3 border border-dashed rounded-xl px-4 py-3 text-xs cursor-pointer transition-colors ${dragActive
                    ? 'border-[#FFE500] bg-[#FFE500]/5 text-[#FFE500]'
                    : 'border-white/15 text-gray-400 hover:border-white/30'
                    }`}
            >
                <Upload className="w-4 h-4" />
                {uploading ? (
                    <span className="font-mono">
                        Téléversement {uploadCount.done}/{uploadCount.total}…
                    </span>
                ) : (
                    <span>
                        Glissez vos fichiers ici pour les déposer dans{' '}
                        <strong className="text-gray-200">{prefix || 'uploads'}</strong>
                    </span>
                )}
                <input
                    type="file"
                    multiple
                    className="hidden"
                    disabled={uploading}
                    onChange={(event) => onUpload(event.target.files)}
                />
            </label>
        )}

        {/* Sous-dossiers */}
        {!searching && folders.length > 0 && (
            <div className="flex flex-wrap gap-2">
                {folders.map((folder) => (
                    <button
                        key={folder.path}
                        type="button"
                        onClick={() => onNavigate(folder.path)}
                        className="px-3 py-2 rounded-lg bg-[#0D0D12] border border-white/10 hover:border-[#FFE500]/60 text-xs text-gray-200 flex items-center gap-2"
                    >
                        <FolderTree className="w-3.5 h-3.5 text-[#FFE500]" />
                        {folder.name}
                    </button>
                ))}
            </div>
        )}

        {/* Grille / liste */}
        {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="aspect-square rounded-xl bg-white/5 animate-pulse" />
                ))}
            </div>
        ) : visibleFiles.length === 0 ? (
            <div className="border border-white/10 rounded-xl p-10 text-center text-sm text-gray-400">
                {searching || kindsCount > 0 || catalogueLoading
                    ? 'Aucun média ne correspond à ces critères.'
                    : 'Ce dossier est vide — déposez des fichiers ou créez un dossier.'}
            </div>
        ) : view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {visibleFiles.map((file) => (
                    <MediaTile
                        key={file.path}
                        file={file}
                        selected={selectionSet.has(file.path)}
                        onToggle={onToggleSelect}
                        onOpen={onOpenDetail}
                        referenceCount={references?.[file.path]?.length ?? 0}
                        mode={mode}
                        onPick={onPick}
                    />
                ))}
            </div>
        ) : (
            <div className="border border-white/10 rounded-xl divide-y divide-white/5 overflow-hidden">
                {visibleFiles.map((file) => {
                    const Icon = KIND_ICON[file.kind];
                    const selected = selectionSet.has(file.path);
                    return (
                        <div
                            key={file.path}
                            className={`flex items-center gap-3 px-3 py-2 text-xs ${selected ? 'bg-[#FFE500]/5' : 'hover:bg-white/[0.03]'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => onTogglePath(file.path)}
                                className="accent-[#FFE500]"
                            />
                            <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <button
                                type="button"
                                onClick={() => onOpenDetail(file)}
                                className="flex-1 min-w-0 text-left"
                            >
                                <span className="block truncate text-gray-200">{file.name}</span>
                                <span className="block truncate text-[10px] font-mono text-gray-500">
                                    {file.folder || 'racine'}
                                </span>
                            </button>
                            {(references?.[file.path]?.length ?? 0) > 0 && (
                                <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                                    utilisé · {references?.[file.path]?.length}
                                </span>
                            )}
                            <span className="text-[10px] font-mono text-gray-400 w-16 text-right shrink-0">
                                {formatBytes(file.size)}
                            </span>
                            {mode === 'pick' && (
                                <button
                                    type="button"
                                    onClick={() => onPick(file.url)}
                                    className="px-2 py-1 rounded bg-[#FFE500] text-black font-bold text-[10px] uppercase"
                                >
                                    Choisir
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        )}

        {hasMore && !searching && (
            <div className="text-center">
                <button
                    type="button"
                    onClick={onLoadMore}
                    disabled={loadingMore}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-200 disabled:opacity-50"
                >
                    {loadingMore ? 'Chargement…' : `Charger ${PAGE_SIZE} objets de plus`}
                </button>
            </div>
        )}
    </div>
);
