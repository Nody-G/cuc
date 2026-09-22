'use client';

import React from 'react';
import { RefreshCw, Save, Sparkles } from 'lucide-react';

export interface SettingsHeaderProps {
    isPending: boolean;
    onSave: () => void;
    onReset: () => void;
}

/** En-tête des réglages : intitulé + actions « Valeurs par défaut » / « Enregistrer ». */
export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
    isPending,
    onSave,
    onReset,
}) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                    <Sparkles className="w-3 h-3" /> Configuration Globale & Interconnexion
                </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase">Paramètres Généraux du Campus</h2>
            <p className="text-sm text-zinc-400 mt-1">
                Personnalisez l'identité, les accréditations Qualiopi, les boutons d'action CTA, les alertes d'urgence et les coordonnées vitrine.
            </p>
        </div>

        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={onReset}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer"
            >
                Valeurs par défaut
            </button>
            <button
                type="button"
                onClick={onSave}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-[#FFE500] hover:bg-yellow-400 disabled:opacity-50 transition shadow-lg shadow-yellow-500/10 cursor-pointer"
            >
                {isPending ? (
                    <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Sauvegarde...
                    </>
                ) : (
                    <>
                        <Save className="w-4 h-4" /> Enregistrer
                    </>
                )}
            </button>
        </div>
    </div>
);
