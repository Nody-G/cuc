'use client';

import React from 'react';
import { Share2, RotateCcw, Save } from 'lucide-react';

interface SocialLinksHeaderProps {
    isPending: boolean;
    onReset: () => void;
    onSave: () => void;
}

/** En-tête de l'éditeur : titre, réinitialisation et enregistrement. */
export const SocialLinksHeader: React.FC<SocialLinksHeaderProps> = ({ isPending, onReset, onSave }) => (
    <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                <Share2 className="w-3.5 h-3.5" /> Présence en ligne
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                Réseaux sociaux
            </h1>
            <p className="text-sm text-gray-400 mt-1">
                Source unique partagée par la barre de navigation, le menu mobile et le pied de page.
            </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
            <button
                onClick={onReset}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors"
            >
                <RotateCcw className="w-4 h-4" />
                Réinitialiser
            </button>
            <button
                onClick={onSave}
                disabled={isPending}
                className="px-5 py-2.5 bg-[#FFE500] hover:bg-[#ffe600e6] disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-lg shadow-yellow-500/10 transition-transform active:scale-95"
            >
                <Save className="w-4 h-4" />
                {isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
        </div>
    </div>
);
