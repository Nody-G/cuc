'use client';

import React from 'react';
import { Move3d, Maximize2, Redo2, RotateCw, Undo2 } from 'lucide-react';
import { GizmoMode } from '../types/campus3d.types';

interface CampusStudioToolbarProps {
    gizmoMode: GizmoMode;
    onSetGizmoMode: (mode: GizmoMode) => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}

/** Raccourci clavier affiché sur chaque outil (voir `CampusPlan3D`). */
const TOOL_SHORTCUT: Record<GizmoMode, string> = {
    translate: '1',
    rotate: '2',
    scale: '3',
};

const TOOL_LABEL: Record<GizmoMode, string> = {
    translate: 'Déplacer',
    rotate: 'Tourner',
    scale: 'Redimensionner',
};

const TOOL_ICON: Record<GizmoMode, React.ReactNode> = {
    translate: <Move3d className="w-3.5 h-3.5" />,
    rotate: <RotateCw className="w-3.5 h-3.5" />,
    scale: <Maximize2 className="w-3.5 h-3.5" />,
};

const TOOL_HINT: Record<GizmoMode, string> = {
    translate: 'Glisser les flèches X / Z ou le disque central (touche 1)',
    rotate: "Glisser l'anneau de lacet — disponible dans tous les outils (touche 2)",
    scale: 'Glisser un axe ou le cube central pour une échelle uniforme (touche 3)',
};

/**
 * Barre d'outils du studio, superposée au viewport 3D.
 *
 * Elle existe parce que l'outil de manipulation doit être visible **là où le
 * regard se trouve** : le panneau latéral peut être hors champ (fenêtre
 * étroite, défilement), ce qui rendait la rotation introuvable.
 */
export const CampusStudioToolbar: React.FC<CampusStudioToolbarProps> = ({
    gizmoMode,
    onSetGizmoMode,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
}) => {
    return (
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 p-1.5 bg-[#0a0b10]/90 backdrop-blur-sm border border-zinc-700/80 shadow-lg">
            <span className="px-1 text-[9px] uppercase tracking-widest text-zinc-500 font-bold">
                Outil
            </span>

            {(['translate', 'rotate', 'scale'] as GizmoMode[]).map((tool) => (
                <button
                    key={tool}
                    onClick={() => onSetGizmoMode(tool)}
                    title={TOOL_HINT[tool]}
                    aria-pressed={gizmoMode === tool}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-[10px] font-bold uppercase tracking-wide cursor-pointer transition-colors ${gizmoMode === tool
                            ? 'bg-[#00e5ff]/15 border-[#00e5ff] text-[#00e5ff]'
                            : 'bg-transparent border-transparent text-zinc-400 hover:text-white hover:border-zinc-600'
                        }`}
                >
                    {TOOL_ICON[tool]}
                    <span>{TOOL_LABEL[tool]}</span>
                    <kbd className="ml-0.5 text-[9px] text-zinc-500 font-normal">
                        {TOOL_SHORTCUT[tool]}
                    </kbd>
                </button>
            ))}

            <span className="w-px h-5 bg-zinc-700" />

            <button
                onClick={onUndo}
                disabled={!canUndo}
                title="Annuler la dernière modification (Ctrl+Z)"
                className={`p-1.5 border border-transparent cursor-pointer ${canUndo ? 'text-zinc-300 hover:text-white hover:border-zinc-600' : 'text-zinc-700 cursor-not-allowed'
                    }`}
            >
                <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
                onClick={onRedo}
                disabled={!canRedo}
                title="Rétablir la modification annulée (Ctrl+Maj+Z)"
                className={`p-1.5 border border-transparent cursor-pointer ${canRedo ? 'text-zinc-300 hover:text-white hover:border-zinc-600' : 'text-zinc-700 cursor-not-allowed'
                    }`}
            >
                <Redo2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};
