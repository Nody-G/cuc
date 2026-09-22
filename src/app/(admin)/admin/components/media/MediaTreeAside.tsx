'use client';

import React from 'react';
import { FolderTree } from 'lucide-react';
import { formatBytes, folderLabel, type MediaFolderStat } from '@/app/(admin)/admin/media-shared';

export interface MediaTreeAsideProps {
    tree: MediaFolderStat[];
    total: { files: number; bytes: number };
    prefix: string;
    onNavigate: (path: string) => void;
}

/** Arborescence des dossiers du bucket + totaux du stockage. */
export const MediaTreeAside: React.FC<MediaTreeAsideProps> = ({
    tree,
    total,
    prefix,
    onNavigate,
}) => (
    <aside className="bg-[#0D0D12] border border-white/10 rounded-xl p-3 h-fit lg:sticky lg:top-4">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-3">
            <FolderTree className="w-3.5 h-3.5" /> Dossiers
        </div>
        <button
            type="button"
            onClick={() => onNavigate('')}
            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors ${prefix === '' ? 'bg-[#FFE500]/10 text-[#FFE500]' : 'text-gray-300 hover:bg-white/5'
                }`}
        >
            <span className="flex items-center justify-between gap-2">
                <span className="font-bold">Racine</span>
                <span className="text-[10px] text-gray-500 font-mono">{total.files}</span>
            </span>
        </button>

        <div className="mt-1 space-y-0.5">
            {tree.map((folder) => (
                <button
                    key={folder.path}
                    type="button"
                    onClick={() => onNavigate(folder.path)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors ${prefix === folder.path
                        ? 'bg-[#FFE500]/10 text-[#FFE500]'
                        : 'text-gray-300 hover:bg-white/5'
                        }`}
                    title={folder.path}
                >
                    <span className="flex items-center justify-between gap-2">
                        <span className="truncate">{folderLabel(folder.path)}</span>
                        <span className="text-[10px] text-gray-500 font-mono shrink-0">{folder.files}</span>
                    </span>
                    <span className="block text-[10px] text-gray-500 font-mono">
                        {formatBytes(folder.bytes)}
                    </span>
                </button>
            ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-gray-400 space-y-1">
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
