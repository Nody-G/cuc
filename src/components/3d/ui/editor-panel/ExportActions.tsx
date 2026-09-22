'use client';

import React from 'react';
import { Copy, Check, Download, Upload, RotateCcw } from 'lucide-react';

interface ExportActionsProps {
    onCopyConfiguration: () => void;
    copiedFeedback: boolean;
    onDownloadJson: () => void;
    onOpenJsonStudio: (tab: 'export' | 'import') => void;
    onResetToDefault: () => void;
}

/** Export & reset : copie JSON, téléchargement, import et réinitialisation. */
export const ExportActions: React.FC<ExportActionsProps> = ({
    onCopyConfiguration,
    copiedFeedback,
    onDownloadJson,
    onOpenJsonStudio,
    onResetToDefault,
}) => (
    <div className="pt-2 border-t border-zinc-800 space-y-2">
        <button
            onClick={onCopyConfiguration}
            className="w-full py-3 bg-[#FFE500] hover:bg-white text-black font-display uppercase tracking-wider text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,229,0,0.35)] cursor-pointer"
        >
            {copiedFeedback ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
            <span>{copiedFeedback ? 'COPIÉ DANS LE PRESSE-PAPIER !' : 'COPIER LES POSITIONS (JSON)'}</span>
        </button>

        <div className="grid grid-cols-3 gap-1.5">
            <button
                onClick={onDownloadJson}
                className="py-1.5 bg-[#14141c] hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                title="Télécharger fichier JSON"
            >
                <Download className="w-3 h-3 text-[#00e5ff]" />
                <span>Télécharger</span>
            </button>

            <button
                onClick={() => onOpenJsonStudio('import')}
                className="py-1.5 bg-[#14141c] hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                title="Coller un JSON existant"
            >
                <Upload className="w-3 h-3 text-[#FFE500]" />
                <span>Importer</span>
            </button>

            <button
                onClick={onResetToDefault}
                className="py-1.5 bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-800/80 text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                title="Réinitialiser toutes les positions"
            >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
            </button>
        </div>
    </div>
);
