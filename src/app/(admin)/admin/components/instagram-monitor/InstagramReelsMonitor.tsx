'use client';

import React from 'react';
import Image from 'next/image';
import { RefreshCw, Eye, ThumbsUp, ExternalLink, Flame } from 'lucide-react';
import type { InstagramReelMetric } from '@/types/instagram-monitor';

interface InstagramReelsMonitorProps {
    reels: InstagramReelMetric[];
    isRefreshingAll: boolean;
    refreshingReelId: string | null;
    onRefreshAll: () => void;
    onRefreshSingle: (shortcode: string, id: string) => void;
}

export const InstagramReelsMonitor: React.FC<InstagramReelsMonitorProps> = ({
    reels,
    isRefreshingAll,
    refreshingReelId,
    onRefreshAll,
    onRefreshSingle,
}) => {
    const [search, setSearch] = React.useState('');

    const filteredReels = React.useMemo(() => {
        if (!search.trim()) return reels;
        const q = search.toLowerCase();
        return reels.filter(
            (r) =>
                r.title.toLowerCase().includes(q) ||
                r.shortcode.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q)
        );
    }, [reels, search]);

    return (
        <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-[#FFE500]" />
                        <h3 className="text-base font-display uppercase tracking-wider text-white">
                            Monitoring en Direct des Reels ({reels.length} vidéos)
                        </h3>
                    </div>
                    <p className="text-xs font-tech text-zinc-400 mt-1">
                        Surveillez en temps réel le nombre de vues, la viralité et les interactions de chaque Reel officiel.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onRefreshAll}
                        disabled={isRefreshingAll}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-[#FFE500] text-xs font-mono-tech uppercase text-zinc-200 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAll ? 'animate-spin text-[#FFE500]' : ''}`} />
                        <span>{isRefreshingAll ? 'Actualisation...' : 'Actualiser les Reels phares'}</span>
                    </button>
                </div>
            </div>

            {/* Barre de filtre recherche */}
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filtrer un Reel par titre ou shortcode..."
                    className="w-full bg-[#121218] border border-zinc-800 rounded-xl px-4 py-2 text-xs font-mono-tech text-white placeholder-zinc-500 focus:border-[#FFE500] focus:outline-none"
                />
            </div>

            {/* Grille / Liste des Reels */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[550px] overflow-y-auto pr-1">
                {filteredReels.map((reel) => {
                    const isSingleRefreshing = refreshingReelId === reel.id;
                    const isMegaViral = reel.views >= 10000000;
                    const isViral = reel.views >= 1000000;

                    return (
                        <div
                            key={reel.id}
                            className={`p-3 rounded-xl border flex gap-3 items-center bg-[#101017] transition-all ${
                                isMegaViral
                                    ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(255,229,0,0.1)]'
                                    : isViral
                                    ? 'border-zinc-700'
                                    : 'border-zinc-800/80 hover:border-zinc-700'
                            }`}
                        >
                            {/* Miniature */}
                            <div className="w-14 h-20 rounded-lg overflow-hidden relative shrink-0 bg-zinc-900">
                                {reel.coverImage && (
                                    <Image
                                        src={reel.coverImage}
                                        alt={reel.title}
                                        fill
                                        sizes="80px"
                                        className="object-cover"
                                    />
                                )}
                                <div className="absolute top-1 left-1 bg-black/80 px-1 py-0.2 rounded text-[8px] font-mono-tech text-[#FFE500]">
                                    9:16
                                </div>
                            </div>

                            {/* Données & Métriques */}
                            <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-[10px] font-mono-tech text-zinc-500">#{reel.shortcode}</span>
                                    {isMegaViral && (
                                        <span className="px-1.5 py-0.2 rounded bg-yellow-400 text-black text-[9px] font-mono-tech font-bold uppercase">
                                            🔥 Méga Viral
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-xs font-display text-white truncate" title={reel.title}>
                                    {reel.title}
                                </h4>

                                {/* Badges de métriques en direct */}
                                <div className="flex items-center gap-3 mt-2 text-[11px] font-mono-tech">
                                    <div className="flex items-center gap-1 text-[#FFE500] font-bold">
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>{reel.viewsFormatted || `${reel.views}`}</span>
                                    </div>
                                    {reel.likes && (
                                        <div className="flex items-center gap-1 text-zinc-400">
                                            <ThumbsUp className="w-3 h-3" />
                                            <span>{reel.likes}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col items-center gap-1.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onRefreshSingle(reel.shortcode, reel.id)}
                                    disabled={isSingleRefreshing}
                                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-[#FFE500] transition-colors cursor-pointer"
                                    title="Actualiser les métriques de ce Reel en direct"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isSingleRefreshing ? 'animate-spin text-[#FFE500]' : ''}`} />
                                </button>
                                <a
                                    href={reel.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                                    title="Ouvrir sur Instagram"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
