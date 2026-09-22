'use client';

import React from 'react';
import { Move3d, RotateCw, Maximize2, Undo2, Redo2 } from 'lucide-react';
import { GizmoMode } from '../../types/campus3d.types';
import { GIZMO_MODE_LABELS } from '../../data/facilityTransform';

const GIZMO_MODE_ICONS: Record<GizmoMode, React.ReactNode> = {
    translate: <Move3d className="w-3.5 h-3.5" />,
    rotate: <RotateCw className="w-3.5 h-3.5" />,
    scale: <Maximize2 className="w-3.5 h-3.5" />,
};

interface GizmoToolBarProps {
    gizmoMode: GizmoMode;
    onSetGizmoMode: (mode: GizmoMode) => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}

/** Outil de manipulation actif (déplacer / tourner / redimensionner) et historique. */
export const GizmoToolBar: React.FC<GizmoToolBarProps> = ({
    gizmoMode,
    onSetGizmoMode,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
}) => (
    <div>
        <div className="text-[9px] text-zinc-400 uppercase font-bold mb-1">
            OUTIL DE MANIPULATION :
        </div>
        <div className="grid grid-cols-3 gap-1.5">
            {(['translate', 'rotate', 'scale'] as GizmoMode[]).map((mode) => (
                <button
                    key={mode}
                    onClick={() => onSetGizmoMode(mode)}
                    className={`py-2 border text-[10px] flex flex-col items-center gap-1 cursor-pointer transition-colors ${gizmoMode === mode
                        ? 'bg-[#00e5ff]/15 border-[#00e5ff] text-[#00e5ff] font-bold'
                        : 'bg-[#14141c] border-zinc-700 text-zinc-400 hover:text-white'
                        }`}
                    title={`Poignées du gizmo : ${GIZMO_MODE_LABELS[mode].toLowerCase()}`}
                >
                    {GIZMO_MODE_ICONS[mode]}
                    <span>{GIZMO_MODE_LABELS[mode]}</span>
                </button>
            ))}
        </div>

        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
            <button
                onClick={onUndo}
                disabled={!canUndo}
                className={`py-1.5 border text-[10px] flex items-center justify-center gap-1 cursor-pointer ${canUndo
                    ? 'bg-[#14141c] border-zinc-700 text-zinc-200 hover:border-[#00e5ff]'
                    : 'bg-[#0f1016] border-zinc-800 text-zinc-600 cursor-not-allowed'
                    }`}
                title="Annuler la dernière modification (Ctrl+Z)"
            >
                <Undo2 className="w-3 h-3" />
                <span>Annuler</span>
            </button>
            <button
                onClick={onRedo}
                disabled={!canRedo}
                className={`py-1.5 border text-[10px] flex items-center justify-center gap-1 cursor-pointer ${canRedo
                    ? 'bg-[#14141c] border-zinc-700 text-zinc-200 hover:border-[#00e5ff]'
                    : 'bg-[#0f1016] border-zinc-800 text-zinc-600 cursor-not-allowed'
                    }`}
                title="Rétablir la modification annulée (Ctrl+Maj+Z)"
            >
                <Redo2 className="w-3 h-3" />
                <span>Rétablir</span>
            </button>
        </div>
    </div>
);
