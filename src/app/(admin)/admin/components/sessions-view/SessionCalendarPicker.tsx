'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles, RotateCcw } from 'lucide-react';
import {
    FRENCH_MONTHS,
    FRENCH_WEEKDAYS_SHORT,
    computePresetEndDate,
    formatSessionRange,
    getMonthCalendarGrid,
    toIsoDate,
    type CalendarDay,
    type DateConnector,
} from './session-calendar-domain';

export interface SessionCalendarPickerProps {
    value: string;
    onChange: (formattedDate: string) => void;
}

export const SessionCalendarPicker: React.FC<SessionCalendarPickerProps> = ({
    value,
    onChange,
}) => {
    const today = useMemo(() => new Date(), []);
    const [viewYear, setViewYear] = useState(() => today.getFullYear());
    const [viewMonth, setViewMonth] = useState(() => today.getMonth());

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [connector, setConnector] = useState<DateConnector>('au');

    const calendarGrid = useMemo(
        () => getMonthCalendarGrid(viewYear, viewMonth),
        [viewYear, viewMonth]
    );

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    };

    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    const handleDayClick = (day: CalendarDay) => {
        if (!startDate || (startDate && endDate)) {
            // Premier clic : sélection du début
            setStartDate(day.date);
            setEndDate(null);
            const formatted = formatSessionRange(day.date, null, connector);
            onChange(formatted);
        } else {
            // Deuxième clic : sélection de la fin
            let s = startDate;
            let e = day.date;
            if (e.getTime() < s.getTime()) {
                const temp = s;
                s = e;
                e = temp;
            }
            setStartDate(s);
            setEndDate(e);
            const formatted = formatSessionRange(s, e, connector);
            onChange(formatted);
        }
    };

    const handleApplyPreset = (preset: 'stage12' | 'stage10' | 'stage5' | 'weekend' | '1day') => {
        const base = startDate || new Date(viewYear, viewMonth, 15);
        if (!startDate) setStartDate(base);
        const computedEnd = computePresetEndDate(base, preset);
        setEndDate(computedEnd);
        const activeConn = preset === 'weekend' ? 'et' : connector;
        if (preset === 'weekend') setConnector('et');
        const formatted = formatSessionRange(base, computedEnd, activeConn);
        onChange(formatted);
    };

    const handleConnectorChange = (newConn: DateConnector) => {
        setConnector(newConn);
        if (startDate) {
            const formatted = formatSessionRange(startDate, endDate, newConn);
            onChange(formatted);
        }
    };

    const handleReset = () => {
        setStartDate(null);
        setEndDate(null);
        setHoverDate(null);
        onChange('');
    };

    const startIso = startDate ? toIsoDate(startDate) : null;
    const endIso = endDate ? toIsoDate(endDate) : null;
    const hoverIso = hoverDate ? toIsoDate(hoverDate) : null;

    // Détermination de l'intervalle effectif (incluant le survol si 1 seule date choisie)
    const activeRangeIso = useMemo(() => {
        if (!startIso) return { min: null, max: null };
        if (endIso) {
            return {
                min: startIso <= endIso ? startIso : endIso,
                max: startIso <= endIso ? endIso : startIso,
            };
        }
        if (hoverIso) {
            return {
                min: startIso <= hoverIso ? startIso : hoverIso,
                max: startIso <= hoverIso ? hoverIso : startIso,
            };
        }
        return { min: startIso, max: startIso };
    }, [startIso, endIso, hoverIso]);

    return (
        <div className="bg-[#0e0e15] border border-white/10 rounded-xl p-4 space-y-4 shadow-xl">
            {/* Raccourcis de durée de stage CUC */}
            <div className="flex items-center justify-between gap-1 flex-wrap pb-2 border-b border-white/10">
                <span className="text-[10px] font-mono uppercase text-gray-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#FFE500]" /> Raccourcis durées :
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                        type="button"
                        onClick={() => handleApplyPreset('stage12')}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 hover:bg-[#FFE500] hover:text-black border border-white/10 transition-colors"
                        title="Stage immersif CUC 12 jours"
                    >
                        ⚡ 12 jours (Pro / Découverte)
                    </button>
                    <button
                        type="button"
                        onClick={() => handleApplyPreset('stage10')}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 hover:bg-[#FFE500] hover:text-black border border-white/10 transition-colors"
                        title="Stage AFDAS (10 jours ouvrés / 2 semaines)"
                    >
                        ⚡ 10 jours (AFDAS)
                    </button>
                    <button
                        type="button"
                        onClick={() => handleApplyPreset('weekend')}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 hover:bg-[#FFE500] hover:text-black border border-white/10 transition-colors"
                        title="Formule Week-end 2 jours"
                    >
                        ⚡ Week-end (2j)
                    </button>
                    <button
                        type="button"
                        onClick={() => handleApplyPreset('stage5')}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 hover:bg-[#FFE500] hover:text-black border border-white/10 transition-colors"
                        title="Stage 5 jours ouvrés"
                    >
                        ⚡ 5 jours
                    </button>
                </div>
            </div>

            {/* En-tête de navigation mois / année */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                        {FRENCH_MONTHS[viewMonth]} {viewYear}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={prevMonth}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                        aria-label="Mois précédent"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setViewYear(today.getFullYear());
                            setViewMonth(today.getMonth());
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 hover:bg-white/10 text-gray-400 hover:text-[#FFE500] transition-colors"
                    >
                        Aujourd'hui
                    </button>
                    <button
                        type="button"
                        onClick={nextMonth}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                        aria-label="Mois suivant"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Grille des jours */}
            <div className="select-none">
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                    {FRENCH_WEEKDAYS_SHORT.map((wd) => (
                        <span key={wd} className="text-[10px] font-mono uppercase text-gray-500 font-semibold py-0.5">
                            {wd}
                        </span>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-y-1 gap-x-0.5">
                    {calendarGrid.map((day, idx) => {
                        const isStart = startIso === day.isoDate;
                        const isEnd = endIso === day.isoDate;
                        const inRange =
                            activeRangeIso.min &&
                            activeRangeIso.max &&
                            day.isoDate >= activeRangeIso.min &&
                            day.isoDate <= activeRangeIso.max;

                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleDayClick(day)}
                                onMouseEnter={() => setHoverDate(day.date)}
                                onMouseLeave={() => setHoverDate(null)}
                                className={`h-8 text-xs font-mono transition-all flex items-center justify-center relative cursor-pointer
                                    ${!day.isCurrentMonth ? 'text-gray-600 opacity-40' : 'text-gray-200'}
                                    ${day.isToday && !isStart && !isEnd ? 'font-bold text-[#FFE500] underline' : ''}
                                    ${isStart || isEnd ? 'bg-[#FFE500] text-black font-extrabold rounded-md shadow-md z-10' : ''}
                                    ${inRange && !isStart && !isEnd ? 'bg-[#FFE500]/20 text-yellow-200 border-y border-[#FFE500]/30' : ''}
                                    ${!inRange && !isStart && !isEnd ? 'hover:bg-white/10 rounded-md' : ''}
                                `}
                            >
                                <span>{day.dayNumber}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Barre de liaison & résultat formaté automatique */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Liaison :</span>
                    <button
                        type="button"
                        onClick={() => handleConnectorChange('au')}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${connector === 'au' ? 'bg-[#FFE500] text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                        « au » (stage)
                    </button>
                    <button
                        type="button"
                        onClick={() => handleConnectorChange('et')}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${connector === 'et' ? 'bg-[#FFE500] text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                        « et » (week-end)
                    </button>
                </div>

                {value && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="text-[10px] font-mono text-gray-400 hover:text-red-400 flex items-center gap-1 self-end transition-colors"
                        title="Effacer la sélection"
                    >
                        <RotateCcw className="w-3 h-3" /> Réinitialiser
                    </button>
                )}
            </div>
        </div>
    );
};
