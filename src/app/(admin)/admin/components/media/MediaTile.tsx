'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check, Info } from 'lucide-react';
import { formatBytes, type MediaObject } from '@/app/(admin)/admin/media-shared';
import { KIND_ICON } from './media-explorer-shared';

export interface MediaTileProps {
    file: MediaObject;
    selected: boolean;
    referenceCount: number;
    mode: 'manage' | 'pick';
    onToggle: (file: MediaObject, event: React.MouseEvent) => void;
    onOpen: (file: MediaObject) => void;
    onPick: (url: string) => void;
}

/**
 * Vignette d'un média : aperçu (repli icône si l'image échoue), sélection,
 * badge d'usage et action « Choisir » en mode sélecteur.
 */
export const MediaTile: React.FC<MediaTileProps> = ({
    file,
    selected,
    referenceCount,
    mode,
    onToggle,
    onOpen,
    onPick,
}) => {
    const Icon = KIND_ICON[file.kind];
    const [failed, setFailed] = useState(false);
    const showImage = file.kind === 'image' && !failed;

    return (
        <div
            className={`group bg-[#0D0D12] border rounded-xl overflow-hidden flex flex-col transition-colors ${selected ? 'border-[#FFE500]' : 'border-white/10 hover:border-white/30'
                }`}
        >
            <button
                type="button"
                onClick={(event) => onToggle(file, event)}
                onDoubleClick={() => onOpen(file)}
                className="relative aspect-square w-full bg-black/60 overflow-hidden"
                title={`${file.name} — clic : sélectionner · double-clic : détails`}
            >
                {showImage ? (
                    <Image
                        src={file.url}
                        alt={file.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        loading="lazy"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        onError={() => setFailed(true)}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-500">
                        <Icon className="w-6 h-6" />
                        <span className="text-[10px] font-mono uppercase">{file.kind}</span>
                    </div>
                )}
                {selected && (
                    <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#FFE500] text-black flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                    </span>
                )}
                {referenceCount > 0 && (
                    <span
                        className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-emerald-300"
                        title={`Utilisé par ${referenceCount} ressource(s)`}
                    >
                        utilisé · {referenceCount}
                    </span>
                )}
            </button>

            <div className="p-2 space-y-1 min-w-0">
                <div className="text-[11px] text-gray-200 truncate" title={file.path}>
                    {file.name}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                    <span>{formatBytes(file.size)}</span>
                    <button
                        type="button"
                        onClick={() => onOpen(file)}
                        className="hover:text-[#FFE500] flex items-center gap-1"
                    >
                        <Info className="w-3 h-3" /> détail
                    </button>
                </div>
                {mode === 'pick' && (
                    <button
                        type="button"
                        onClick={() => onPick(file.url)}
                        className="w-full mt-1 px-2 py-1.5 rounded bg-[#FFE500] text-black text-[10px] font-bold uppercase tracking-wider"
                    >
                        Choisir
                    </button>
                )}
            </div>
        </div>
    );
};
