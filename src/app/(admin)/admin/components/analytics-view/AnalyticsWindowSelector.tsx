import React from 'react';
import { WINDOW_OPTIONS } from './analytics-format';

export interface AnalyticsWindowSelectorProps {
    windowDays: number;
    onChange: (days: number) => void;
}

export const AnalyticsWindowSelector: React.FC<AnalyticsWindowSelectorProps> = ({
    windowDays,
    onChange,
}) => (
    <div
        className="flex items-center rounded-lg border border-white/15 overflow-hidden"
        role="group"
        aria-label="Fenêtre d’analyse"
    >
        {WINDOW_OPTIONS.map((option) => (
            <button
                key={option}
                type="button"
                onClick={() => onChange(option)}
                aria-pressed={windowDays === option}
                className={`px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors ${windowDays === option
                    ? 'bg-[#FFE500] text-black font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
            >
                {option} j
            </button>
        ))}
    </div>
);
