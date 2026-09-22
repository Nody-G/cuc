'use client';

import React from 'react';
import { Eye, EyeOff, Plus } from 'lucide-react';
import type { EditableFacilityItem } from '../../types/campus3d.types';

interface VisibilityActionsProps {
    selectedItem: EditableFacilityItem;
    onToggleVisible: () => void;
    onAddCustomMarker: () => void;
}

/** Visibilité de l'objet sélectionné et ajout d'un repère personnalisé. */
export const VisibilityActions: React.FC<VisibilityActionsProps> = ({
    selectedItem,
    onToggleVisible,
    onAddCustomMarker,
}) => (
    <div className="flex items-center gap-2">
        <button
            onClick={onToggleVisible}
            className={`flex-1 py-2 px-3 border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${selectedItem.visible
                ? 'bg-[#161822] border-zinc-700 text-zinc-300 hover:text-white'
                : 'bg-red-950/40 border-red-800 text-red-400'
                }`}
        >
            {selectedItem.visible ? <Eye className="w-3.5 h-3.5 text-[#00e5ff]" /> : <EyeOff className="w-3.5 h-3.5 text-red-400" />}
            <span>{selectedItem.visible ? 'Masquer' : 'Afficher'}</span>
        </button>

        <button
            onClick={onAddCustomMarker}
            className="py-2 px-3 bg-[#161822] border border-zinc-700 hover:border-[#00e5ff] text-zinc-200 text-xs flex items-center gap-1 cursor-pointer"
            title="Ajouter un nouveau repère ou zone personnalisée"
        >
            <Plus className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>Ajouter</span>
        </button>
    </div>
);
