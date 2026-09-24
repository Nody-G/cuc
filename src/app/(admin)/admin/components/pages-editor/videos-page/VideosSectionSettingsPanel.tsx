'use client';

import React from 'react';
import { Loader2, Plus } from 'lucide-react';
import { InstagramLogo } from '@/components/ui/logos/SocialLogos';
import {
    DEFAULT_REELS_TITLE,
    REEL_COLUMNS,
    formatMillions,
    resolveColumns,
} from './videos-reels-model';

interface VideosSectionSettingsPanelProps {
    /** Section `sections_data.reels` (titre, intro, colonnes). */
    section: { title?: string; intro?: string; columns?: number };
    reelCount: number;
    totalViews: number;
    newUrl: string;
    isImporting: boolean;
    importError: string | null;
    onSectionChange: (patch: Record<string, unknown>) => void;
    onUrlChange: (url: string) => void;
    onImport: () => void;
}

const INPUT_CLASS =
    'w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white focus:border-[#FFE500] outline-none';

/** Réglages de la section vidéos : chrome, grille et import d'un Reel. */
export const VideosSectionSettingsPanel: React.FC<VideosSectionSettingsPanelProps> = ({
    section,
    reelCount,
    totalViews,
    newUrl,
    isImporting,
    importError,
    onSectionChange,
    onUrlChange,
    onImport,
}) => {
    const columns = resolveColumns(section.columns);

    return (
        <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-sm font-semibold text-white">
                <div className="flex items-center gap-2">
                    <InstagramLogo className="w-4 h-4 text-[#FFE500]" />
                    <span>Configuration des Vidéos Instagram Reels ({reelCount})</span>
                </div>
                {totalViews > 0 && (
                    <span className="text-xs font-mono-tech text-[#FFE500] font-normal">
                        {formatMillions(totalViews)} vues cumulées
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-mono-tech text-gray-400 mb-1">
                        Titre de la section
                    </label>
                    <input
                        type="text"
                        value={section.title || DEFAULT_REELS_TITLE}
                        onChange={(e) => onSectionChange({ title: e.target.value })}
                        className={INPUT_CLASS}
                    />
                </div>
                <div>
                    <label className="block text-xs font-mono-tech text-gray-400 mb-1">
                        Sous-titre / Introduction
                    </label>
                    <input
                        type="text"
                        value={section.intro || ''}
                        placeholder="Description courte de la section..."
                        onChange={(e) => onSectionChange({ intro: e.target.value })}
                        className={INPUT_CLASS}
                    />
                </div>
            </div>

            {/* Sélecteur de colonnes (2 à 6) */}
            <div className="pt-2 border-t border-white/5">
                <label className="block text-xs font-mono-tech text-gray-400 mb-1.5">
                    Disposition de la grille sur grand écran (2 à 6 colonnes) :
                </label>
                <div className="flex items-center gap-2">
                    {REEL_COLUMNS.map((cols) => (
                        <button
                            key={cols}
                            type="button"
                            onClick={() => onSectionChange({ columns: cols })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech uppercase font-bold transition-all cursor-pointer ${columns === cols
                                    ? 'bg-[#FFE500] text-black shadow-[0_0_15px_rgba(255,229,0,0.3)]'
                                    : 'bg-black/50 border border-white/10 text-gray-400 hover:text-white'
                                }`}
                        >
                            {cols} cols
                        </button>
                    ))}
                </div>
            </div>

            {/* Import rapide depuis Instagram */}
            <div className="pt-3 border-t border-white/5">
                <label className="block text-xs font-mono-tech text-[#FFE500] mb-1.5">
                    Ajouter un Reel par son lien Instagram (récupération automatique de la légende réelle)
                </label>
                <div className="flex gap-2">
                    <input
                        type="url"
                        placeholder="https://www.instagram.com/reel/DJW5wq0MIzt/..."
                        value={newUrl}
                        onChange={(e) => onUrlChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onImport()}
                        className="flex-1 px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-xs text-white focus:border-[#FFE500] outline-none font-mono"
                    />
                    <button
                        type="button"
                        onClick={onImport}
                        disabled={isImporting || !newUrl.trim()}
                        className="px-4 py-2 bg-[#FFE500] hover:bg-yellow-400 text-black text-xs font-bold font-mono-tech rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                        {isImporting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>Importer</span>
                    </button>
                </div>
                {importError && (
                    <p className="text-xs text-rose-400 mt-1 font-mono-tech">{importError}</p>
                )}
            </div>
        </div>
    );
};
