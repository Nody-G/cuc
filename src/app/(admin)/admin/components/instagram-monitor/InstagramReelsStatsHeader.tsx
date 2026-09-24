'use client';

import React from 'react';
import { Flame, Eye, RefreshCw, Download, Sparkles, TrendingUp, Video } from 'lucide-react';
import type { InstagramReelMetric } from '@/types/instagram-monitor';

interface InstagramReelsStatsHeaderProps {
    reels: InstagramReelMetric[];
    filteredReels: InstagramReelMetric[];
    isRefreshingAll: boolean;
    onRefreshAll: () => void;
    onExportCsv: () => void;
    selectedCategory: string;
}

export const InstagramReelsStatsHeader: React.FC<InstagramReelsStatsHeaderProps> = ({
    reels,
    filteredReels,
    isRefreshingAll,
    onRefreshAll,
    onExportCsv,
    selectedCategory,
}) => {
    // Calcul dynamique de toutes les vues de la chaîne (exhaustivité)
    const grandTotalViews = React.useMemo(() => {
        return reels.reduce((sum, r) => sum + (r.views || 0), 0);
    }, [reels]);

    // Calcul dynamique sur la sélection actuelle (si filtrée)
    const filteredTotalViews = React.useMemo(() => {
        return filteredReels.reduce((sum, r) => sum + (r.views || 0), 0);
    }, [filteredReels]);

    const isFiltered = selectedCategory !== 'all' || filteredReels.length !== reels.length;

    // Métriques virales
    const megaHitsCount = React.useMemo(() => {
        return reels.filter((r) => r.views >= 10000000).length;
    }, [reels]);

    const viralHitsCount = React.useMemo(() => {
        return reels.filter((r) => r.views >= 1000000).length;
    }, [reels]);

    const avgViews = React.useMemo(() => {
        return reels.length > 0 ? Math.round(grandTotalViews / reels.length) : 0;
    }, [grandTotalViews, reels.length]);

    const formatMillions = (num: number) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1).replace('.', ',')} M`;
        }
        return num.toLocaleString('fr-FR');
    };

    return (
        <div className="space-y-4">
            {/* Titre & Boutons d'action */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-[#FFE500]" />
                        <h3 className="text-base font-display uppercase tracking-wider text-white">
                            Monitoring Exhaustif des Reels Instagram ({reels.length} vidéos)
                        </h3>
                    </div>
                    <p className="text-xs font-tech text-zinc-400 mt-1">
                        Catalogue complet de la chaîne officielle @campus.univers.cascades avec calculatrice de vues cumulées en direct.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        type="button"
                        onClick={onExportCsv}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs font-mono-tech uppercase text-zinc-200 hover:text-white transition-all cursor-pointer"
                        title="Télécharger l'intégralité du catalogue des Reels au format CSV (Excel)"
                    >
                        <Download className="w-3.5 h-3.5 text-[#FFE500]" />
                        <span>Exporter CSV ({reels.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={onRefreshAll}
                        disabled={isRefreshingAll}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-[#FFE500] text-xs font-mono-tech uppercase text-zinc-200 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAll ? 'animate-spin text-[#FFE500]' : ''}`} />
                        <span>{isRefreshingAll ? 'Actualisation...' : 'Actualiser les phares'}</span>
                    </button>
                </div>
            </div>

            {/* Calculateur de Vues & Ratios Viraux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Grand Total Cumulé */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 via-[#121218] to-[#0e0e14] border border-[#FFE500]/40 shadow-[0_0_20px_rgba(255,229,0,0.06)] relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs font-mono-tech text-[#FFE500] uppercase font-bold">
                        <span>Total Vues Cumulées</span>
                        <Eye className="w-4 h-4" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-display text-white tracking-tight">
                            {isFiltered
                                ? formatMillions(filteredTotalViews)
                                : formatMillions(grandTotalViews)}
                        </span>
                        <span className="text-xs font-mono-tech text-zinc-400">vues</span>
                    </div>
                    <p className="text-[11px] font-mono-tech text-zinc-400 mt-1">
                        {isFiltered
                            ? `${filteredTotalViews.toLocaleString('fr-FR')} vues sur la sélection (${formatMillions(grandTotalViews)} total)`
                            : `${grandTotalViews.toLocaleString('fr-FR')} vues certifiées`}
                    </p>
                </div>

                {/* Moyenne par Reel */}
                <div className="p-4 rounded-xl bg-[#121218] border border-zinc-800">
                    <div className="flex items-center justify-between text-xs font-mono-tech text-zinc-400 uppercase">
                        <span>Moyenne par Reel</span>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-display text-white">
                            {formatMillions(avgViews)}
                        </span>
                        <span className="text-xs font-mono-tech text-zinc-500">/ vidéo</span>
                    </div>
                    <p className="text-[11px] font-mono-tech text-emerald-400/90 mt-1">
                        Excellence virale mondiale
                    </p>
                </div>

                {/* Méga Hits (>10M) */}
                <div className="p-4 rounded-xl bg-[#121218] border border-zinc-800">
                    <div className="flex items-center justify-between text-xs font-mono-tech text-zinc-400 uppercase">
                        <span>Méga-Hits (&gt; 10M)</span>
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-display text-yellow-400 font-bold">
                            {megaHitsCount}
                        </span>
                        <span className="text-xs font-mono-tech text-zinc-500">vidéos</span>
                    </div>
                    <p className="text-[11px] font-mono-tech text-zinc-400 mt-1">
                        Cascades à portée planétaire
                    </p>
                </div>

                {/* Total Vidéos Répertoriées */}
                <div className="p-4 rounded-xl bg-[#121218] border border-zinc-800">
                    <div className="flex items-center justify-between text-xs font-mono-tech text-zinc-400 uppercase">
                        <span>Vidéothèque CUC</span>
                        <Video className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-display text-white font-bold">
                            {reels.length}
                        </span>
                        <span className="text-xs font-mono-tech text-zinc-500">Reels</span>
                    </div>
                    <p className="text-[11px] font-mono-tech text-zinc-400 mt-1">
                        {viralHitsCount} vidéos dépassent 1M vues
                    </p>
                </div>
            </div>
        </div>
    );
};
