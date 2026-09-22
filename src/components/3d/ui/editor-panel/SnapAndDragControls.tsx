'use client';

import React from 'react';

interface SnapAndDragControlsProps {
    snapGrid: number;
    onSetSnapGrid: (snap: number) => void;
    dragMode: 'gizmo' | 'orbit';
    onSetDragMode: (mode: 'gizmo' | 'orbit') => void;
}

/** Aimantation de la grille et action du clic gauche (gizmo ou caméra). */
export const SnapAndDragControls: React.FC<SnapAndDragControlsProps> = ({
    snapGrid,
    onSetSnapGrid,
    dragMode,
    onSetDragMode,
}) => (
    <div className="grid grid-cols-2 gap-2 bg-[#12131b] border border-zinc-800 p-2.5">
        <div>
            <div className="text-[9px] text-zinc-400 uppercase font-bold mb-1">AIMANTATION GRILLE :</div>
            <div className="flex border border-zinc-700 bg-black">
                {[0.1, 0.5, 1.0, 5.0].map((stepVal) => (
                    <button
                        key={stepVal}
                        onClick={() => onSetSnapGrid(stepVal)}
                        className={`flex-1 py-1 text-[10px] cursor-pointer transition-colors ${snapGrid === stepVal
                            ? 'bg-[#00e5ff] text-black font-bold'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        {stepVal}m
                    </button>
                ))}
            </div>
        </div>

        <div>
            <div className="text-[9px] text-zinc-400 uppercase font-bold mb-1">CLIC GAUCHE SOURIS :</div>
            <div className="flex border border-zinc-700 bg-black">
                <button
                    onClick={() => onSetDragMode('gizmo')}
                    className={`flex-1 py-1 text-[10px] cursor-pointer transition-colors ${dragMode === 'gizmo'
                        ? 'bg-[#FFE500] text-black font-bold'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                    title="Manipuler via les flèches du Gizmo"
                >
                    Gizmo 3D
                </button>
                <button
                    onClick={() => onSetDragMode('orbit')}
                    className={`flex-1 py-1 text-[10px] cursor-pointer transition-colors ${dragMode === 'orbit'
                        ? 'bg-[#FFE500] text-black font-bold'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                    title="Pivoter la vue"
                >
                    Caméra
                </button>
            </div>
        </div>
    </div>
);
