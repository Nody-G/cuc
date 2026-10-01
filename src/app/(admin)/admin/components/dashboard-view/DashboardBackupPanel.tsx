'use client';

import React from 'react';
import { Database } from 'lucide-react';

interface DashboardBackupPanelProps {
    onOpenBackupModal?: () => void;
}

/**
 * Panneau « Sauvegardes » du tableau de bord — porte d'entrée de **l'import /
 * export d'un fichier JSON de contenu**.
 *
 * C'est aujourd'hui le **geste de sauvegarde principal** : aucune sauvegarde
 * automatique n'est active (décision du propriétaire). L'outil réécrit les
 * lignes présentes dans le fichier et **ne supprime rien**. Le panneau
 * « Versions & Restauration » (versions chiffrées hors projet Supabase) existe
 * mais reste désactivé par choix.
 */
export const DashboardBackupPanel: React.FC<DashboardBackupPanelProps> = ({ onOpenBackupModal }) => (
    <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-5 space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
            <div className="text-xs font-mono text-white font-bold uppercase flex items-center gap-2 border-b border-white/10 pb-3">
                <Database className="w-4 h-4 text-emerald-400" /> Import / Export JSON de contenu
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
                Télécharge un fichier JSON des contenus de la vitrine, ou recharge un export antérieur.
                Cet outil <strong className="text-gray-200">ne supprime rien</strong> : ce n'est pas un retour
                arrière de version, les éléments créés après l'export subsistent.
            </p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
                Téléchargez régulièrement une sauvegarde : sa fraîcheur est la date de votre
                dernier export. L'import ne touche que les contenus de la vitrine — aucune
                table du produit CUC Sign n'est lue ni écrite.
            </p>
        </div>

        {onOpenBackupModal && (
            <button
                type="button"
                onClick={onOpenBackupModal}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
                <Database className="w-4 h-4 text-[#FFE500]" />
                <span>Ouvrir l'outil Import / Export JSON</span>
            </button>
        )}
    </div>
);
