'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { InfrastructureSpot } from '@/types';

interface FacilitiesSelectorProps {
    facilities: InfrastructureSpot[];
    activeFacilityId: string;
    onSelect: (id: string) => void;
    onPreload: (src: string) => void;
}

/** Liste de sélection des installations (colonne gauche). */
export const FacilitiesSelector: React.FC<FacilitiesSelectorProps> = ({
    facilities,
    activeFacilityId,
    onSelect,
    onPreload,
}) => (
    <div className="lg:col-span-4 space-y-2">
        {facilities.map((facility, index) => {
            const isSelected = facility.id === activeFacilityId;
            return (
                <button
                    key={facility.id}
                    onClick={() => onSelect(facility.id)}
                    onMouseEnter={() => onPreload(facility.image)}
                    onFocus={() => onPreload(facility.image)}
                    aria-pressed={isSelected}
                    className={`w-full text-left p-3.5 border transition-all cursor-pointer flex items-center justify-between ${isSelected
                            ? 'bg-[#14141c] border-[#FFE500] text-white shadow-lg'
                            : 'bg-[#0b0b0f] border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                >
                    <div className="flex items-center gap-3 truncate">
                        <span
                            className={`font-mono-tech text-xs font-bold ${isSelected ? 'text-[#FFE500]' : 'text-zinc-500'
                                }`}
                        >
                            {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="truncate">
                            <span
                                data-cuc-field={`sections_data.installations.items.${index}.name`}
                                className="font-display uppercase text-sm tracking-wide block truncate"
                            >
                                {facility.name}
                            </span>
                            <span
                                data-cuc-field={`sections_data.installations.items.${index}.size`}
                                className="text-[10px] font-mono-tech text-zinc-500 block truncate"
                            >
                                {facility.size}
                            </span>
                        </div>
                    </div>
                    <ChevronRight
                        className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#FFE500] translate-x-1' : 'text-zinc-600'
                            }`}
                    />
                </button>
            );
        })}
    </div>
);
