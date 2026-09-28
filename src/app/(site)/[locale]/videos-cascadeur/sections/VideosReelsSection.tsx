'use client';

import React from 'react';
import Image from 'next/image';
import { Play, ExternalLink, Eye } from 'lucide-react';
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
    totalViews,
    onSelectReel,
    labels,
}) => {
    if (totalCount === 0 || reels.length === 0) return null;

    return (
        <section id="reels" className="py-20 bg-[#060608] border-t border-zinc-800 scroll-mt-28 relative">
            <div className="page-shell">
                {/* Header de section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <InstagramLogo className="w-4 h-4 text-[#FFE500]" />
                            <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider">
                                INSTAGRAM @CAMPUS.UNIVERS.CASCADES
                            </span>
                            {totalViews > 0 && (
                                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono-tech text-zinc-400">
                                    <span className="text-[#FFE500] font-bold">{totalViews.toLocaleString('fr-FR')}</span> vues sur ces vidéos
                                </span>
                            )}
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wide text-white">
                            {labels.title}
                        </h2>
                        <p className="text-sm font-tech text-zinc-400 mt-2 max-w-2xl">
                            {labels.intro}
                        </p>
                    </div>

                    <a
                        href="https://www.instagram.com/campus.univers.cascades/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 border border-zinc-800 bg-[#0c0c10] hover:border-[#FFE500] text-xs font-mono-tech uppercase text-zinc-300 hover:text-white transition-all duration-200 group self-start md:self-auto rounded-lg shadow-sm"
                    >
                        <span>{labels.socialInstagram}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#FFE500] group-hover:translate-x-0.5 transition-transform" />
                    </a>
                </div>

                {/* Grille des 6 vidéos : 3 colonnes desktop, 2 colonnes tablette, 1 colonne mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
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
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        unoptimized={reel.coverImage.startsWith('http')}
                                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#121218] to-black flex items-center justify-center">
                                        <InstagramLogo className="w-12 h-12 text-zinc-800" />
                                    </div>
                                )}

                                {/* Dégradé sombre cinématique */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                                {/* Vues certifiées relevées en direct */}
                                {reel.viewsFormatted && (
                                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono-tech text-white">
                                        <Eye className="w-3.5 h-3.5 text-[#FFE500]" />
                                        <span>{reel.viewsFormatted}</span>
                                    </div>
                                )}

                                {/* Date de publication */}
                                {reel.date && (
                                    <div className="absolute top-3 left-3 z-20 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono-tech text-zinc-400">
                                        {reel.date}
                                    </div>
                                )}

                                {/* Bouton Play central avec halo */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 group-hover:border-[#FFE500] group-hover:scale-110 flex items-center justify-center transition-all duration-300 text-white group-hover:text-[#FFE500] shadow-[0_0_25px_rgba(0,0,0,0.8)]">
                                        <Play className="w-6 h-6 fill-current translate-x-0.5" />
                                    </div>
                                </div>

                                {/* Métadonnées */}
                                <div className="relative z-10 p-5">
                                    <h3 className="text-base font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors mb-1.5 line-clamp-2">
                                        {reel.title}
                                    </h3>
                                    {hasDescription && (
                                        <p className="text-xs font-tech text-zinc-300 leading-relaxed line-clamp-2">
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
