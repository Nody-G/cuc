'use client';

import React from 'react';
import { Target } from 'lucide-react';
import { EditableFacilityItem } from '../../types/campus3d.types';

interface ObjectSelectorProps {
    facilities: Record<string, EditableFacilityItem>;
    selectedObjectId: string;
    onSelectObjectId: (id: string) => void;
    onFocusFacility: (id: string) => void;
}

/** Sélecteur d'objet (repères et zones) avec cadrage caméra rapide. */
export const ObjectSelector: React.FC<ObjectSelectorProps> = ({
    facilities,
    selectedObjectId,
    onSelectObjectId,
    onFocusFacility,
}) => (
    <div>
        <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                OBJET SÉLECTIONNÉ :
            </label>
            <button
                onClick={() => onFocusFacility(selectedObjectId)}
                className="text-[10px] text-[#00e5ff] hover:underline flex items-center gap-1 cursor-pointer"
                title="Cadrer la caméra sur cet objet"
            >
                <Target className="w-3 h-3" />
                <span>Cadrer</span>
            </button>
        </div>
        <select
            value={selectedObjectId}
            onChange={(e) => {
                onSelectObjectId(e.target.value);
                onFocusFacility(e.target.value);
            }}
            className="w-full bg-[#14141c] border border-zinc-700 p-2 text-xs text-white focus:border-[#00e5ff] focus:outline-none"
        >
            {Object.values(facilities).map((item) => (
                <option key={item.id} value={item.id}>
                    [{item.code}] {item.name}
                </option>
            ))}
        </select>
    </div>
);
