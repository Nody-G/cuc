'use client';

import React from 'react';
import Image from 'next/image';
import { Play, ExternalLink, Eye, Sparkles, ChevronDown } from 'lucide-react';
import { InstagramLogo } from '@/components/ui/logos/SocialLogos';
import {
    ALL_INSTAGRAM_REELS,
    type InstagramReel,
} from './instagram-reels.data';
import { VideosReelsExplorer } from './VideosReelsExplorer';

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
        exploreMore?: string;
        hideExplorer?: string;
        explorerTitle?: string;
        explorerSubtitle?: string;
        sortByViews?: string;
        sortByDateDesc?: string;
        sortByDateAsc?: string;
        filterAll?: string;
        filterMecanique?: string;
        filterCombat?: string;
        filterSpectacle?: string;
        filterCampus?: string;
    };
}

/**
 * Section des vidéos & Reels verticaux officiels du CUC.
 * Présentation cinématique 9:16 — choix dynamique de 2 à 6 colonnes,
 * affichage du nombre de vues et explorateur étendu triable.
 */
export const VideosReelsSection: React.FC<VideosReelsSectionProps> = ({
    reels,
    allReels = ALL_INSTAGRAM_REELS,
    columns,
    onSelectReel,
    labels,
}) => {
    const [isExplorerOpen, setIsExplorerOpen] = React.useState(false);

    if (!reels || reels.length === 0) {
        return null;
    }

    const targetCols = columns ? Math.min(Math.max(columns, 2), 6) : Math.min(Math.max(reels.length, 2), 6);
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

    return (
        <section id="reels" className="py-20 bg-[#060608] border-t border-zinc-800 scroll-mt-28 relative">
            <div className="page-shell">
                {/* Header de section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
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

                {/* Grille principale configurée (2 à 6 colonnes) */}
                <div className={gridClassName}>
                    {reels.map((reel) => {
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

                                {/* Nombre de vues épuré en haut à droite */}
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

                {/* Bouton pour explorer toute la vidéothèque Instagram */}
                <div className="mt-12 text-center">
                    <button
                        type="button"
                        onClick={() => setIsExplorerOpen((prev) => !prev)}
                        className="inline-flex items-center gap-2.5 px-6 py-3.5 border border-zinc-700 hover:border-[#FFE500] bg-[#0e0e14] hover:bg-[#14141c] text-xs font-mono-tech uppercase text-zinc-200 hover:text-white rounded-xl shadow-lg transition-all duration-200 group cursor-pointer"
                    >
                        <Sparkles className="w-4 h-4 text-[#FFE500] group-hover:rotate-12 transition-transform" />
                        <span>
                            {isExplorerOpen
                                ? (labels.hideExplorer || 'Masquer la vidéothèque étendue')
                                : (labels.exploreMore || `Explorer toute la vidéothèque Instagram (${allReels.length} vidéos)`)}
                        </span>
                        <ChevronDown
                            className={`w-4 h-4 text-[#FFE500] transition-transform duration-300 ${
                                isExplorerOpen ? 'rotate-180' : ''
                            }`}
                        />
                    </button>
                </div>

                {/* Explorateur étendu interactif (Tri & Filtres) */}
                {isExplorerOpen && (
                    <VideosReelsExplorer
                        allReels={allReels}
                        onSelectReel={onSelectReel}
                        labels={{
                            title: labels.explorerTitle || 'Toutes les vidéos Instagram',
                            subtitle:
                                labels.explorerSubtitle ||
                                'Triez et filtrez l’ensemble des Reels officiels du Campus Univers Cascades',
                            sortByViews: labels.sortByViews || 'Nombre de vues',
                            sortByDateDesc: labels.sortByDateDesc || 'Plus récentes',
                            sortByDateAsc: labels.sortByDateAsc || 'Plus anciennes',
                            filterAll: labels.filterAll || 'Toutes',
                            filterMecanique: labels.filterMecanique || 'Cascades mécaniques',
                            filterCombat: labels.filterCombat || 'Combats scéniques',
                            filterSpectacle: labels.filterSpectacle || 'Spectacles & Scène',
                            filterCampus: labels.filterCampus || 'Vie du campus',
                        }}
                    />
                )}
            </div>
        </section>
    );
};
