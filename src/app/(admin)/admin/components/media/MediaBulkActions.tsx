'use client';

import React from 'react';
import { Copy, Trash2 } from 'lucide-react';

export interface MediaBulkActionsProps {
    mode: 'manage' | 'pick';
    selectionCount: number;
    onCopyUrls: () => void;
    onCopyPaths: () => void;
    moveTarget: string;
    onMoveTargetChange: (value: string) => void;
    onMove: () => void;
    onTrash: () => void;
    onDeletePermanent: () => void;
    selectedReferences: number;
    onClearSelection: () => void;
}

/**
 * Barre d'actions groupées : copie des URLs/chemins, déplacement, corbeille et
 * suppression définitive — avec l'avertissement d'usage en base.
 */
export const MediaBulkActions: React.FC<MediaBulkActionsProps> = ({
    mode,
    selectionCount,
    onCopyUrls,
    onCopyPaths,
    moveTarget,
    onMoveTargetChange,
    onMove,
    onTrash,
    onDeletePermanent,
    selectedReferences,
    onClearSelection,
}) => (
    <div className="bg-[#12121A] border border-[#FFE500]/40 rounded-xl p-3 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="font-mono text-[#FFE500] mr-1">{selectionCount} sélectionné(s)</span>
        <button
            type="button"
            onClick={onCopyUrls}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 flex items-center gap-1.5"
        >
            <Copy className="w-3.5 h-3.5" /> URLs
        </button>
        <button
            type="button"
            onClick={onCopyPaths}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200"
        >
            Chemins
        </button>
        {mode === 'manage' && (
            <>
                <div className="flex items-center gap-1.5">
                    <input
                        value={moveTarget}
                        onChange={(event) => onMoveTargetChange(event.target.value)}
                        placeholder="dossier/destination"
                        className="w-40 bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFE500]"
                    />
                    <button
                        type="button"
                        onClick={onMove}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200"
                    >
                        Déplacer
                    </button>
                </div>
                <button
                    type="button"
                    onClick={onTrash}
                    className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 flex items-center gap-1.5"
                >
                    <Trash2 className="w-3.5 h-3.5" /> Corbeille
                </button>
                <button
                    type="button"
                    onClick={onDeletePermanent}
                    className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-200"
                >
                    Effacer définitivement
                </button>
            </>
        )}
        {selectedReferences > 0 && (
            <span className="text-amber-300 font-mono">
                ⚠️ {selectedReferences} référence(s) en base
            </span>
        )}
        <button
            type="button"
            onClick={onClearSelection}
            className="ml-auto px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
        >
            Tout désélectionner
        </button>
    </div>
);
