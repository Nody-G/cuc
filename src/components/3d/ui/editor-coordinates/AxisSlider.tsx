'use client';

import React from 'react';

export interface AxisSliderProps {
    label: string;
    dotColor: string;
    accentClass: string;
    value: number;
    min: number;
    max: number;
    step: number;
    decimals?: number;
    unit?: string;
    quickSteps: number[];
    quickFormat?: (delta: number) => string;
    onChange: (value: number) => void;
}

/**
 * Curseur d'un axe : champ numérique + glissière + pas rapides.
 * Composant purement déclaratif, partagé par les trois blocs du panneau.
 */
export const AxisSlider: React.FC<AxisSliderProps> = ({
    label,
    dotColor,
    accentClass,
    value,
    min,
    max,
    step,
    decimals = 1,
    unit = 'm',
    quickSteps,
    quickFormat,
    onChange,
}) => (
    <div>
        <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
                {label}
            </span>
            <div className="flex items-center gap-1">
                <input
                    type="number"
                    step={step}
                    min={min}
                    max={max}
                    value={Number(value.toFixed(decimals))}
                    onChange={(e) => {
                        const parsed = parseFloat(e.target.value);
                        if (Number.isFinite(parsed)) onChange(parsed);
                    }}
                    className="w-20 bg-black border border-zinc-700 px-1.5 py-0.5 text-right text-white font-bold text-xs focus:border-[#00e5ff] focus:outline-none"
                />
                <span className="text-zinc-500 text-[10px] w-4">{unit}</span>
            </div>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className={`w-full cursor-pointer ${accentClass}`}
        />
        <div className="flex items-center justify-between gap-1 pt-1 text-[9px]">
            {quickSteps.map((delta) => (
                <button
                    key={delta}
                    onClick={() => onChange(Number((value + delta).toFixed(decimals + 1)))}
                    className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                >
                    {quickFormat ? quickFormat(delta) : delta > 0 ? `+${delta}` : delta}
                </button>
            ))}
        </div>
    </div>
);
