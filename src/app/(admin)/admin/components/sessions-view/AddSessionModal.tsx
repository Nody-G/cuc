'use client';

import React, { useState } from 'react';
import { Calendar, PenLine, CheckCircle2 } from 'lucide-react';
import type { StuntProgram } from '@/types';
import type { NewSessionStatus } from './session-form';
import { SessionCalendarPicker } from './SessionCalendarPicker';

export interface AddSessionModalProps {
    program: StuntProgram;
    date: string;
    status: NewSessionStatus;
    onDateChange: (value: string) => void;
    onStatusChange: (status: NewSessionStatus) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

export const AddSessionModal: React.FC<AddSessionModalProps> = ({
    program,
    date,
    status,
    onDateChange,
    onStatusChange,
    onSubmit,
    onClose,
}) => {
    const [mode, setMode] = useState<'calendar' | 'manual'>('calendar');

    return (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#12121A] border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div>
                        <h3 className="text-base font-bold text-white uppercase tracking-wide">
                            Ajouter une session de formation
                        </h3>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">
                            {program.title}
                        </p>
                    </div>

                    {/* Sélecteur de mode */}
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                            type="button"
                            onClick={() => setMode('calendar')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                                mode === 'calendar'
                                    ? 'bg-[#FFE500] text-black font-bold'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Calendrier</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('manual')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                                mode === 'manual'
                                    ? 'bg-[#FFE500] text-black font-bold'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <PenLine className="w-3.5 h-3.5" />
                            <span>Manuel</span>
                        </button>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    {mode === 'calendar' ? (
                        <div className="space-y-3">
                            <label className="block text-xs font-mono text-gray-400">
                                Cliquez sur les dates (début → fin) ou choisissez un raccourci :
                            </label>
                            <SessionCalendarPicker value={date} onChange={onDateChange} />
                        </div>
                    ) : null}

                    {/* Champ de confirmation & ajustement de l'intitulé */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-mono text-gray-400">
                                Intitulé exact affiché sur le site :
                            </label>
                            {date && (
                                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Zéro faute garanti
                                </span>
                            )}
                        </div>
                        <input
                            type="text"
                            required
                            placeholder="ex: 18 au 30 octobre 2026 ou 12 et 13 septembre 2026"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="w-full bg-black/60 border border-white/20 rounded-lg px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#FFE500] placeholder-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1.5">
                            Statut initial de la session
                        </label>
                        <select
                            value={status}
                            onChange={(e) => onStatusChange(e.target.value as NewSessionStatus)}
                            className="w-full bg-black/60 border border-white/20 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFE500] cursor-pointer"
                        >
                            <option value="ouvert">🟢 Ouvert aux inscriptions</option>
                            <option value="dernières places">🟡 Dernières places</option>
                            <option value="bientôt">🔵 Bientôt disponible</option>
                            <option value="complet">🔴 Complet</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-colors cursor-pointer"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={!date.trim()}
                            className="px-5 py-2.5 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-[0_4px_16px_rgba(255,229,0,0.3)] cursor-pointer"
                        >
                            Enregistrer la session
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
