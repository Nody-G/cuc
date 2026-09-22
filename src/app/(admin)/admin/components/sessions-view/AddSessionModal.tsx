import React from 'react';
import type { StuntProgram } from '@/types';
import type { NewSessionStatus } from './session-form';

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
}) => (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
                Ajouter une session de stage
            </h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Programme</label>
                    <input
                        type="text"
                        disabled
                        value={program.title}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
                    />
                </div>

                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Intitulé de la date</label>
                    <input
                        type="text"
                        required
                        placeholder="ex: 12 au 24 mai 2027"
                        value={date}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                    />
                </div>

                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Statut initial</label>
                    <select
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value as NewSessionStatus)}
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                    >
                        <option value="ouvert">🟢 Ouvert aux inscriptions</option>
                        <option value="dernières places">🟡 Dernières places</option>
                        <option value="complet">🔴 Complet</option>
                    </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider"
                    >
                        Enregistrer
                    </button>
                </div>
            </form>
        </div>
    </div>
);
