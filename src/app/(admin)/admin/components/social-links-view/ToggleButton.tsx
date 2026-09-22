'use client';

import React from 'react';

interface ToggleButtonProps {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
}

/** Bouton bascule compact (emplacements d'affichage d'un réseau). */
export const ToggleButton: React.FC<ToggleButtonProps> = ({ checked, onChange, label }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${checked
            ? 'bg-[#FFE500] text-black'
            : 'bg-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10'
            }`}
        title={label}
    >
        {label}
    </button>
);
