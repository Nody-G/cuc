'use client';

import React from 'react';
import { PARTNER_FILTERS } from './partners-model';

interface PartnerCategoryFilterProps {
    active: string;
    onChange: (category: string) => void;
}

/** Barre de filtres par catégorie. */
export const PartnerCategoryFilter: React.FC<PartnerCategoryFilterProps> = ({ active, onChange }) => (
    <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {PARTNER_FILTERS.map((cat) => (
            <button
                key={cat.id}
                onClick={() => onChange(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${active === cat.id
                        ? 'bg-[#FFE500] text-black'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
            >
                {cat.label}
            </button>
        ))}
    </div>
);
