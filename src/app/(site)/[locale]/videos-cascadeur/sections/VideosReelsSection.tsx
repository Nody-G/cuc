'use client';

import React from 'react';
import Image from 'next/image';
import { Play, ExternalLink, Eye, ChevronDown } from 'lucide-react';
import { InstagramLogo } from '@/components/ui/logos/SocialLogos';
import {
    ALL_INSTAGRAM_REELS,
    type InstagramReel,
    type ReelSortOption,
} from '@/data/instagram-reels';
import { VideosReelsSortBar } from './VideosReelsSortBar';

export interface VideosReelsSectionProps {
    reels: InstagramReel[];
    allReels?: InstagramReel[];
    columns?: number;
    onSelectReel: (reel: InstagramReel) => void;
    labels: {
        title: string;
        intro: string;
        play: string;
        socialInstagram: string;
        seeMore?: string;
        sortByFeatured?: string;
        sortByViews?: string;
        sortByDateDesc?: string;
        sortByDateAsc?: string;
    };
}

/**
 * Section des vidéos & Reels verticaux officiels du CUC.
 * Présentation cinématique 9:16 avec choix dynamique de 2 à 6 colonnes,
 * affichage du nombre de vues certifié sur chaque vidéo,
 * tri interactif (mis en avant, vues, dates) et pagination progressive "Voir plus".
 */
export const VideosReelsSection: React.FC<VideosReelsSectionProps> = ({
    reels,
    allReels = ALL_INSTAGRAM_REELS,
    columns,
    onSelectReel,
    labels,
}) => {
    const targetCols = columns ? Math.min(Math.max(columns, 2), 6) : 6;
    const [sortBy, setSortBy] = React.useState<ReelSortOption>('featured');
    const [visibleCount, setVisibleCount] = React.useState<number>(targetCols);

    // Réinitialise le décompte si le nombre de colonnes change
    React.useEffect(() => {
        setVisibleCount((prev) => Math.max(prev, targetCols));
    }, [targetCols]);

    // Fusion des vidéos : les reels mis en avant (Cockpit) complétés par le catalogue complet
    const combinedReels = React.useMemo(() => {
        const featuredIds = new Set(reels.map((r) => r.shortcode));
        const featuredList = reels.map((r) => ({ ...r, isFeatured: true }));
        const others = allReels.filter((r) => !featuredIds.has(r.shortcode));
        return [...featuredList, ...others];
    }, [reels, allReels]);

    // Tri dynamique selon l'option sélectionnée (s'applique à toutes les vidéos, y compris mises en avant)
    const sortedReels = React.useMemo(() => {
        const list = [...combinedReels];
        if (sortBy === 'views') {
            return list.sort((a, b) => (b.views || 0) - (a.views || 0));
        }
        if (sortBy === 'recent') {
            return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        }
        if (sortBy === 'oldest') {
            return list.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        }
        // 'featured' : ordre initial des vidéos mises en avant en priorité
        return list;
    }, [combinedReels, sortBy]);

    const displayedReels = React.useMemo(() => {
        return sortedReels.slice(0, visibleCount);
    }, [sortedReels, visibleCount]);

    const hasMore = visibleCount < sortedReels.length;

    const handleLoadMore = () => {
        // Charge une double rangée de colonnes supplémentaire
        const step = Math.max(targetCols * 2, 6);
        setVisibleCount((prev) => Math.min(prev + step, sortedReels.length));
    };

    const gridClassName =
        targetCols === 2
            ? 'max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'
            : targetCols === 3
            ? 'max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
            : targetCols === 4
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5'
            : targetCols === 5
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4'
            : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4';

    const totalViews = React.useMemo(() => {
        return combinedReels.reduce((sum, r) => sum + (r.views || 0), 0);
    }, [combinedReels]);

    return (
        <section id="reels" className="py-20 bg-[#060608] border-t border-zinc-800 scroll-mt-28 relative">
            <div className="page-shell">
                {/* Header de section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <InstagramLogo className="w-4 h-4 text-[#FFE500]" />
                            <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider">
                                INSTAGRAM @CAMPUS.UNIVERS.CASCADES
                            </span>
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
                        className="inline-flex items-center gap-2 px-5 py-3 border border-zinc-800 bg-[#0c0c10] hover:border-[#FFE500] text-xs font-mono-tech uppercase text-zinc-300 hover:text-white transition-all duration-200 group self-start md:self-auto"
                    >
                        <span>{labels.socialInstagram}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#FFE500] group-hover:translate-x-0.5 transition-transform" />
                    </a>
                </div>

                {/* Barre de tri (Mis en avant, Vues, Plus récentes, Plus anciennes) & Total des vues */}
                <VideosReelsSortBar
                    sortBy={sortBy}
                    onChangeSort={setSortBy}
                    totalCount={sortedReels.length}
                    totalViews={totalViews}
                    labels={{
                        sortByFeatured: labels.sortByFeatured,
                        sortByViews: labels.sortByViews,
                        sortByDateDesc: labels.sortByDateDesc,
                        sortByDateAsc: labels.sortByDateAsc,
                    }}
                />

                {/* Grille principale continue (2 à 6 colonnes) */}
                <div className={gridClassName}>
                    {displayedReels.map((reel) => {
                        const hasDescription = !!(reel.description && reel.description.trim().length > 0);
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
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#121218] to-black flex items-center justify-center">
                                        <InstagramLogo className="w-12 h-12 text-zinc-800" />
                                    </div>
                                )}

                                {/* Dégradé cinématique sombre */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                                {/* Nombre de vues certifié en haut à droite sur chaque vidéo */}
                                {reel.viewsFormatted && (
                                    <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono-tech text-white">
                                        <Eye className="w-3 h-3 text-[#FFE500]" />
                                        <span>{reel.viewsFormatted}</span>
                                    </div>
                                )}

                                {/* Bouton Play central avec halo */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 group-hover:border-[#FFE500] group-hover:scale-110 flex items-center justify-center transition-all duration-300 text-white group-hover:text-[#FFE500] shadow-[0_0_25px_rgba(0,0,0,0.8)]">
                                        <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
                                    </div>
                                </div>

                                {/* Métadonnées */}
                                <div className="relative z-10 p-4 sm:p-5">
                                    <h3 className="text-sm sm:text-base font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors mb-1 line-clamp-2">
                                        {reel.title}
                                    </h3>
                                    {hasDescription && (
                                        <p className="text-[11px] sm:text-xs font-tech text-zinc-300 leading-tight line-clamp-2">
                                            {reel.description}
                                        </p>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* Bouton Voir plus (charge la suite directement dans la même grille) */}
                {hasMore && (
                    <div className="mt-12 text-center">
                        <button
                            type="button"
                            onClick={handleLoadMore}
                            className="inline-flex items-center gap-2.5 px-8 py-3.5 border border-zinc-700 hover:border-[#FFE500] bg-[#0e0e14] hover:bg-[#14141c] text-xs font-mono-tech uppercase text-zinc-200 hover:text-white rounded-xl shadow-lg transition-all duration-200 group cursor-pointer"
                        >
                            <span>
                                {labels.seeMore
                                    ? labels.seeMore
                                    : `Voir plus (${sortedReels.length - visibleCount} restantes)`}
                            </span>
                            <ChevronDown className="w-4 h-4 text-[#FFE500] group-hover:translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};
