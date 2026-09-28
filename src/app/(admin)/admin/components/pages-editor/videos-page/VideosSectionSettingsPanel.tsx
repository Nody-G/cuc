'use client';

import React from 'react';
import { Loader2, Plus, Sparkles, ListFilter, CheckCircle2 } from 'lucide-react';
import { InstagramLogo } from '@/components/ui/logos/SocialLogos';
import {
    DEFAULT_REELS_TITLE,
    REEL_ROWS_OPTIONS,
    formatMillions,
    resolveMode,
    resolveRows,
    type ReelsSectionData,
} from './videos-reels-model';

interface VideosSectionSettingsPanelProps {
    /** Section `sections_data.reels` (titre, intro, mode, rows, colonnes). */
    section: ReelsSectionData;
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

/** Réglages de la section vidéos courtes Instagram du Cockpit (`AGENTS.md` § 1-2). */
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
    const mode = resolveMode(section.mode);
    const rows = resolveRows(section.rows);
    const targetVideoCount = rows * 6;

    return (
        <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-5">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2 text-sm font-semibold text-white">
                <div className="flex items-center gap-2">
                    <InstagramLogo className="w-4 h-4 text-[#FFE500]" />
                    <span>Section Vidéos Courtes Instagram</span>
                    <span className={`text-[10px] uppercase font-mono-tech px-2 py-0.5 rounded-full font-bold border ${mode === 'latest'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                        {mode === 'latest' ? '⚡ Flux Automatique (Dernières)' : '🎯 Sélection Manuelle'}
                    </span>
                </div>
                {totalViews > 0 && (
                    <span className="text-xs font-mono-tech text-[#FFE500] font-normal">
                        {formatMillions(totalViews)} vues cumulées
                    </span>
                )}
            </div>

            {/* Titre et sous-titre de la section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-mono-tech text-gray-400 mb-1">
                        Titre de la section vitrine
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

            {/* 1. Choix du mode d'affichage : Dernières (par défaut) vs Sélection manuelle */}
            <div className="pt-3 border-t border-white/5 space-y-2">
                <label className="block text-xs font-mono-tech text-gray-400">
                    Source des vidéos affichées :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => onSectionChange({ mode: 'latest' })}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${mode === 'latest'
                            ? 'bg-[#FFE500]/10 border-[#FFE500] text-white shadow-[0_0_20px_rgba(255,229,0,0.15)]'
                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                            }`}
                    >
                        <Sparkles className={`w-4 h-4 mt-0.5 shrink-0 ${mode === 'latest' ? 'text-[#FFE500]' : 'text-gray-500'}`} />
                        <div>
                            <div className="text-xs font-bold font-mono-tech uppercase text-white flex items-center gap-1.5">
                                Toujours les dernières vidéos
                                <span className="text-[10px] font-normal text-[#FFE500] lowercase">(par défaut)</span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                                Récupère automatiquement les publications les plus récentes depuis Instagram en temps réel.
                            </p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => onSectionChange({ mode: 'curated' })}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${mode === 'curated'
                            ? 'bg-[#FFE500]/10 border-[#FFE500] text-white shadow-[0_0_20px_rgba(255,229,0,0.15)]'
                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                            }`}
                    >
                        <ListFilter className={`w-4 h-4 mt-0.5 shrink-0 ${mode === 'curated' ? 'text-[#FFE500]' : 'text-gray-500'}`} />
                        <div>
                            <div className="text-xs font-bold font-mono-tech uppercase text-white">
                                Sélection manuelle personnalisée
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                                Choisissez et ordonnez vous-même les vidéos spécifiques à afficher sur la page.
                            </p>
                        </div>
                    </button>
                </div>
            </div>

            {/* 2. Choix du nombre de rangées (1 à 3 rangées de 6 colonnes) */}
            <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono-tech text-gray-400">
                        Format de la grille (6 colonnes fixes) :
                    </label>
                    <span className="text-xs font-mono-tech text-[#FFE500] font-bold">
                        {targetVideoCount} vidéos affichées ({rows} rangée{rows > 1 ? 's' : ''} × 6 colonnes)
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {REEL_ROWS_OPTIONS.map((opt) => (
                        <button
                            key={opt.rows}
                            type="button"
                            onClick={() => onSectionChange({ rows: opt.rows })}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono-tech uppercase font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${rows === opt.rows
                                ? 'bg-[#FFE500] text-black shadow-[0_0_15px_rgba(255,229,0,0.25)]'
                                : 'bg-black/50 border border-white/10 text-gray-400 hover:text-white'
                                }`}
                        >
                            <span>{opt.label}</span>
                            <span className={`text-[10px] font-normal ${rows === opt.rows ? 'text-black/80' : 'text-gray-500'}`}>
                                ({opt.count} vidéos)
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Notice explicative selon le mode sélectionné */}
            {mode === 'latest' ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                        <strong>Mode automatique activé :</strong> La vitrine affiche directement les{' '}
                        <strong>{targetVideoCount} dernières vidéos</strong> publiées sur le compte officiel Instagram
                        du Campus Univers Cascades, disposées sur {rows} rangée{rows > 1 ? 's' : ''} de 6 colonnes.
                    </span>
                </div>
            ) : (
                /* Import rapide pour sélection manuelle */
                <div className="pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-mono-tech text-[#FFE500]">
                            Ajouter un Reel par son lien Instagram à votre sélection :
                        </label>
                        <span className="text-[11px] font-mono-tech text-gray-400">
                            {reelCount} vidéo{reelCount > 1 ? 's' : ''} dans la sélection
                        </span>
                    </div>
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
                            className="px-4 py-2 bg-[#FFE500] hover:bg-yellow-400 text-black text-xs font-bold font-mono-tech rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
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
            )}
        </div>
    );
};
