'use client';

import React from 'react';
import { Database } from 'lucide-react';

interface DashboardBackupPanelProps {
    onOpenBackupModal?: () => void;
}

/** Panneau Sécurité & Sauvegardes : ouverture de l'outil de sauvegarde/restauration. */
export const DashboardBackupPanel: React.FC<DashboardBackupPanelProps> = ({ onOpenBackupModal }) => (
    <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-5 space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
            <div className="text-xs font-mono text-white font-bold uppercase flex items-center gap-2 border-b border-white/10 pb-3">
                <Database className="w-4 h-4 text-emerald-400" /> Sauvegarde Intégrale
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
                Téléchargez un instantané complet de votre site CUC (15 pages, ateliers, dates, instructeurs et partenaires) ou restaurez une configuration précédente.
            </p>
        </div>

        {onOpenBackupModal && (
            <button
                type="button"
                onClick={onOpenBackupModal}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
                <Database className="w-4 h-4 text-[#FFE500]" />
                <span>Ouvrir l'outil Sauvegarde & Restauration</span>
            </button>
        )}
    </div>
);
