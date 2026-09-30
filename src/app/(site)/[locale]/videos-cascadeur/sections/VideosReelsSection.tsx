'use client';

import React from 'react';
import Image from 'next/image';
import { Play, ExternalLink } from 'lucide-react';
import { InstagramFollowerBadge } from '@/components/ui/InstagramFollowerBadge';
import { InstagramLogo } from '@/components/ui/logos/SocialLogos';
import type { InstagramReel, ReelSortOption } from '@/data/instagram-reels';

export interface VideosReelsSectionProps {
    /** Les 6 vidéos les plus récentes */
    reels: InstagramReel[];
    columns?: number;
    totalCount: number;
    totalViews: number;
    onSelectReel: (reel: InstagramReel) => void;
    labels: {
        title: string;
        intro: string;
        socialInstagram: string;
        seeMore?: string;
        sortByFeatured?: string;
        sortByViews?: string;
        sortByDateDesc?: string;
        sortByDateAsc?: string;
    };
    // Rétro-compatibilité optionnelle
    sortBy?: ReelSortOption;
    onChangeSort?: (option: ReelSortOption) => void;
    remaining?: number;
    hasMore?: boolean;
    onLoadMore?: () => void;
}

/**
 * Section des 6 vidéos & Reels les plus récents du Campus Univers Cascades.
 * Présentation directe sans barre de tri superflue, connectée à l'API en direct.
 */
export const VideosReelsSection: React.FC<VideosReelsSectionProps> = ({
    reels,
    totalCount,
    onSelectReel,
    labels,
}) => {
    if (totalCount === 0 || reels.length === 0) return null;

    return (
        <section id="reels" className="py-20 bg-[#060608] border-t border-zinc-800 scroll-mt-28 relative">
            <div className="page-shell">
                {/* Header de section */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <InstagramFollowerBadge variant="pill" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wide text-white">
                        {labels.title}
                    </h2>
                    <p className="text-sm font-tech text-zinc-400 mt-2 max-w-2xl">
                        {labels.intro}
                    </p>
                </div>

                {/* Grille des vidéos : 6 colonnes desktop, 4 tablette, 2 mobile */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 max-w-[1720px] mx-auto">
                    {reels.map((reel) => {
                        const hasDescription = Boolean(reel.description && reel.description.trim().length > 0);
                        return (
                            <article
                                key={reel.id}
                                onClick={() => onSelectReel(reel)}
                                className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-[#0c0c10] border border-zinc-800/80 hover:border-[#FFE500]/70 cursor-pointer shadow-lg hover:shadow-[0_10px_35px_rgba(255,229,0,0.15)] transition-all duration-300 flex flex-col justify-end"
                            >
                                {/* Miniature réelle */}
                                {reel.coverImage ? (
                                    <Image
                                        src={reel.coverImage}
                                        alt={reel.title}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                                        unoptimized={reel.coverImage.startsWith('http')}
                                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#121218] to-black flex items-center justify-center">
                                        <InstagramLogo className="w-10 h-10 text-zinc-800" />
                                    </div>
                                )}

                                {/* Dégradé sombre cinématique */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                                {/* Date de publication */}
                                {reel.date && (
                                    <div className="absolute top-2.5 left-2.5 z-20 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono-tech text-zinc-400">
                                        {reel.date}
                                    </div>
                                )}

                                {/* Bouton Play central avec halo */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 group-hover:border-[#FFE500] group-hover:scale-110 flex items-center justify-center transition-all duration-300 text-white group-hover:text-[#FFE500] shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                                        <Play className="w-4 h-4 fill-current translate-x-0.5" />
                                    </div>
                                </div>

                                {/* Métadonnées */}
                                <div className="relative z-10 p-3 sm:p-3.5">
                                    <h3 className="text-xs sm:text-sm font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors mb-1 line-clamp-2">
                                        {reel.title}
                                    </h3>
                                    {hasDescription && (
                                        <p className="text-[11px] font-tech text-zinc-300 leading-snug line-clamp-2 opacity-90">
                                            {reel.description}
                                        </p>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* Lien direct pour découvrir toutes les vidéos sur Instagram */}
                <div className="mt-12 text-center">
                    <a
                        href="https://www.instagram.com/campus.univers.cascades/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-3.5 border border-zinc-700 hover:border-[#FFE500] bg-[#0e0e14] hover:bg-[#14141c] text-xs font-mono-tech uppercase text-zinc-200 hover:text-white rounded-xl shadow-lg transition-all duration-200 group"
                    >
                        <InstagramLogo className="w-4 h-4 text-[#FFE500]" />
                        <span>Découvrir toutes nos vidéos sur Instagram</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#FFE500] group-hover:translate-x-0.5 transition-transform" />
                    </a>
                </div>
            </div>
        </section>
    );
};
