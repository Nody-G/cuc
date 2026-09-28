'use client';

import React from 'react';
import Image from 'next/image';
import {
    Star,
    RefreshCw,
    Plus,
    ArrowUp,
    ArrowDown,
    Trash2,
    Eye,
    ThumbsUp,
    ExternalLink,
    Sparkles,
    CheckCircle2,
} from 'lucide-react';
import type { InstagramReelMetric } from '@/types/instagram-monitor';

interface InstagramFeaturedReelsManagerProps {
    featuredReels: InstagramReelMetric[];
    isLoading: boolean;
    isSaving: boolean;
    isSyncingMeta: boolean;
    isImporting: boolean;
    importInput: string;
    onChangeImportInput: (val: string) => void;
    onImportReel: () => void;
    onSyncAllMeta: () => void;
    onMoveReel: (index: number, direction: 'up' | 'down') => void;
    onRemoveReel: (index: number) => void;
}

export const InstagramFeaturedReelsManager: React.FC<InstagramFeaturedReelsManagerProps> = ({
    featuredReels,
    isLoading,
    isSaving,
    isSyncingMeta,
    isImporting,
    importInput,
    onChangeImportInput,
    onImportReel,
    onSyncAllMeta,
    onMoveReel,
    onRemoveReel,
}) => {
    return (
        <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            {/* Header du Manager */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-zinc-800 gap-4">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Star className="w-5 h-5 text-[#FFE500] fill-current" />
                        <h3 className="text-base font-display uppercase tracking-wider text-white">
                            Curateur des Reels Mis en Avant sur la Vitrine
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FFE500]/15 text-[#FFE500] text-xs font-mono-tech font-bold border border-[#FFE500]/30">
                            {featuredReels.length} sélectionné{featuredReels.length > 1 ? 's' : ''}
                        </span>
                        {isSaving && (
                            <span className="text-[11px] font-mono-tech text-amber-400 animate-pulse">
                                Enregistrement...
                            </span>
                        )}
                    </div>
                    <p className="text-xs font-tech text-zinc-400 mt-1">
                        Ces Reels s’affichent en priorité sur la vidéothèque publique (<code>/videos-cascadeur</code>). Toutes les métriques proviennent de l’API officielle Meta.
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        type="button"
                        onClick={onSyncAllMeta}
                        disabled={isSyncingMeta || featuredReels.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-[#FFE500] text-xs font-mono-tech uppercase text-zinc-200 hover:text-white transition-all disabled:opacity-40 cursor-pointer"
                        title="Actualiser en direct les compteurs de vues et likes via l'API officielle Meta Graph"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 text-[#FFE500] ${isSyncingMeta ? 'animate-spin' : ''}`} />
                        <span>{isSyncingMeta ? 'Synchronisation...' : 'Actualiser vues via Meta API'}</span>
                    </button>
                </div>
            </div>

            {/* Barre d'importation directe par URL Meta */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#12121a] p-3 rounded-xl border border-zinc-800">
                <input
                    type="text"
                    value={importInput}
                    onChange={(e) => onChangeImportInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onImportReel()}
                    placeholder="Coller l'URL d'un Reel Instagram officiel (ex: https://www.instagram.com/reel/DQmgL2IjN-8/)..."
                    className="flex-grow bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs font-mono-tech text-white placeholder-zinc-500 focus:border-[#FFE500] focus:outline-none"
                />
                <button
                    type="button"
                    onClick={onImportReel}
                    disabled={isImporting || !importInput.trim()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#FFE500] hover:bg-yellow-400 text-black font-bold text-xs font-mono-tech uppercase transition-all disabled:opacity-40 cursor-pointer shrink-0"
                >
                    {isImporting ? (
                        <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Extraction Meta...</span>
                        </>
                    ) : (
                        <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Mettre à la une</span>
                        </>
                    )}
                </button>
            </div>

            {/* Grille des Reels mis en avant */}
            {isLoading ? (
                <div className="py-8 text-center text-xs font-mono-tech text-zinc-500">
                    Chargement de la sélection vitrine...
                </div>
            ) : featuredReels.length === 0 ? (
                <div className="py-10 text-center rounded-xl bg-[#121218] border border-dashed border-zinc-800 text-zinc-500 text-xs font-mono-tech space-y-2">
                    <Sparkles className="w-6 h-6 mx-auto text-[#FFE500]/60" />
                    <p>Aucun Reel n&apos;est actuellement mis en avant.</p>
                    <p className="text-zinc-600">
                        Importez un lien ci-dessus ou cliquez sur « ★ Mettre en avant » sur un Reel du catalogue ci-dessous.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {featuredReels.map((reel, index) => (
                        <div
                            key={reel.id || reel.shortcode}
                            className="p-3.5 rounded-xl border border-zinc-800 bg-[#101017] hover:border-[#FFE500]/40 transition-all flex gap-3 relative group"
                        >
                            {/* Badge Ordre d'affichage */}
                            <span className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-[#FFE500] text-black font-mono-tech text-xs font-bold flex items-center justify-center shadow-md">
                                {index + 1}
                            </span>

                            {/* Miniature 9:16 */}
                            <div className="w-16 h-24 rounded-lg overflow-hidden relative shrink-0 bg-zinc-900 border border-white/5">
                                {reel.coverImage ? (
                                    <Image
                                        src={reel.coverImage}
                                        alt={reel.title}
                                        fill
                                        sizes="100px"
                                        unoptimized
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-mono-tech">
                                        Reel
                                    </div>
                                )}
                            </div>

                            {/* Données */}
                            <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                                <div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-zinc-500">
                                        <span>#{reel.shortcode}</span>
                                        <span className="text-emerald-400 flex items-center gap-0.5">
                                            <CheckCircle2 className="w-3 h-3" /> En vitrine
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-display text-white truncate mt-1" title={reel.title}>
                                        {reel.title}
                                    </h4>
                                </div>

                                {/* Compteurs certifiés Meta */}
                                <div className="space-y-1.5 pt-2">
                                    <div className="flex items-center gap-3 text-xs font-mono-tech">
                                        <div
                                            className="flex items-center gap-1 text-[#FFE500] font-bold"
                                            title={`${reel.views.toLocaleString('fr-FR')} vues certifiées`}
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>{reel.viewsFormatted || reel.views.toLocaleString('fr-FR')}</span>
                                        </div>
                                        {reel.likes && (
                                            <div className="flex items-center gap-1 text-zinc-400">
                                                <ThumbsUp className="w-3 h-3" />
                                                <span>{reel.likes}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Barre de contrôles */}
                                    <div className="flex items-center gap-1 pt-1 border-t border-zinc-800/80">
                                        <button
                                            type="button"
                                            onClick={() => onMoveReel(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                                            title="Monter dans l'ordre de la vitrine"
                                        >
                                            <ArrowUp className="w-3 h-3" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onMoveReel(index, 'down')}
                                            disabled={index === featuredReels.length - 1}
                                            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                                            title="Descendre dans l'ordre de la vitrine"
                                        >
                                            <ArrowDown className="w-3 h-3" />
                                        </button>
                                        <a
                                            href={reel.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-[#FFE500] ml-auto cursor-pointer"
                                            title="Voir sur Instagram"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => onRemoveReel(index)}
                                            className="p-1 rounded bg-zinc-900 hover:bg-rose-950/60 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                                            title="Retirer de la vitrine"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
