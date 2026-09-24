'use client';

import React from 'react';
import Image from 'next/image';
import { Eye, ThumbsUp, RefreshCw, ExternalLink } from 'lucide-react';
import type { InstagramReelMetric } from '@/types/instagram-monitor';

interface InstagramReelCardProps {
    reel: InstagramReelMetric;
    isRefreshing: boolean;
    onRefresh: () => void;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
    fire: { label: 'Feu', icon: '🔥' },
    car: { label: 'Véhicule', icon: '🚗' },
    height: { label: 'Hauteur', icon: '🏢' },
    combat: { label: 'Combat', icon: '🥋' },
    parkour: { label: 'Parkour', icon: '🏃' },
    workshop: { label: 'Atelier', icon: '🎯' },
    general: { label: 'Cascade', icon: '🎬' },
};

export const InstagramReelCard: React.FC<InstagramReelCardProps> = ({
    reel,
    isRefreshing,
    onRefresh,
}) => {
    const isMegaViral = (reel.views || 0) >= 10000000;
    const isViral = (reel.views || 0) >= 1000000 && !isMegaViral;
    const categoryInfo = CATEGORY_LABELS[reel.stuntCategory || 'general'] || CATEGORY_LABELS.general;

    return (
        <div
            className={`p-3 rounded-xl border flex gap-3 items-center bg-[#101017] transition-all duration-200 group hover:bg-[#14141e] ${
                isMegaViral
                    ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(255,229,0,0.08)] hover:border-yellow-400'
                    : isViral
                    ? 'border-zinc-700/80 hover:border-zinc-600'
                    : 'border-zinc-800/80 hover:border-zinc-700'
            }`}
        >
            {/* Miniature */}
            <div className="w-14 h-20 rounded-lg overflow-hidden relative shrink-0 bg-zinc-900 border border-white/5">
                {reel.coverImage ? (
                    <Image
                        src={reel.coverImage}
                        alt={reel.title}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                        9:16
                    </div>
                )}
                <div className="absolute top-1 left-1 bg-black/80 px-1 py-0.2 rounded text-[8px] font-mono-tech text-[#FFE500]">
                    9:16
                </div>
            </div>

            {/* Données & Métriques */}
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono-tech text-zinc-500">#{reel.shortcode}</span>

                    <span className="text-[9px] font-mono-tech px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                        {categoryInfo.icon} {categoryInfo.label}
                    </span>

                    {isMegaViral && (
                        <span className="px-1.5 py-0.2 rounded bg-[#FFE500] text-black text-[9px] font-mono-tech font-bold uppercase shadow-sm">
                            🔥 Méga Hit
                        </span>
                    )}

                    {isViral && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono-tech uppercase">
                            ⚡ 1M+
                        </span>
                    )}
                </div>

                <h4 className="text-xs font-display text-white truncate" title={reel.title}>
                    {reel.title}
                </h4>

                {/* Vues & Likes */}
                <div className="flex items-center gap-3 mt-2 text-[11px] font-mono-tech">
                    <div
                        className="flex items-center gap-1 text-[#FFE500] font-bold"
                        title={`${reel.views.toLocaleString('fr-FR')} vues certifiées`}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{reel.viewsFormatted || reel.views.toLocaleString('fr-FR')}</span>
                    </div>

                    {reel.likes && (
                        <div className="flex items-center gap-1 text-zinc-400" title="J'aime">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{reel.likes}</span>
                        </div>
                    )}

                    {reel.date && (
                        <span className="text-[10px] text-zinc-500 ml-auto hidden sm:inline">
                            {reel.date}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-[#FFE500] transition-colors cursor-pointer disabled:opacity-40"
                    title="Actualiser les vues et likes de ce Reel en direct"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FFE500]' : ''}`} />
                </button>

                <a
                    href={reel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                    title="Ouvrir sur Instagram officiel"
                >
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
};
