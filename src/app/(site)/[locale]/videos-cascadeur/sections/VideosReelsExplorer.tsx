'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Eye, ArrowUpDown, Flame, Calendar, Sparkles } from 'lucide-react';
import { InstagramLogo } from '@/components/ui/logos/SocialLogos';
import type { InstagramReel, ReelCategory } from './instagram-reels.data';

export type SortOption = 'views' | 'dateDesc' | 'dateAsc';

export interface VideosReelsExplorerLabels {
    title: string;
    subtitle: string;
    sortByViews: string;
    sortByDateDesc: string;
    sortByDateAsc: string;
    filterAll: string;
    filterMecanique: string;
    filterCombat: string;
    filterSpectacle: string;
    filterCampus: string;
}

export interface VideosReelsExplorerProps {
    allReels: InstagramReel[];
    onSelectReel: (reel: InstagramReel) => void;
    labels: VideosReelsExplorerLabels;
}

/**
 * Explorateur interactif de l'ensemble des vidéos et Reels Instagram du CUC.
 * Permet le tri par nombre de vues, date et filtrage par thématique de cascade.
 */
export const VideosReelsExplorer: React.FC<VideosReelsExplorerProps> = ({
    allReels,
    onSelectReel,
    labels,
}) => {
    const [sortBy, setSortBy] = React.useState<SortOption>('views');
    const [activeCategory, setActiveCategory] = React.useState<ReelCategory>('all');

    const categories: { key: ReelCategory; label: string }[] = [
        { key: 'all', label: labels.filterAll },
        { key: 'mecanique', label: labels.filterMecanique },
        { key: 'combat', label: labels.filterCombat },
        { key: 'spectacle', label: labels.filterSpectacle },
        { key: 'campus', label: labels.filterCampus },
    ];

    const filteredAndSortedReels = React.useMemo(() => {
        let list = allReels.filter((r) => {
            if (activeCategory === 'all') return true;
            return r.category === activeCategory;
        });

        return list.slice().sort((a, b) => {
            if (sortBy === 'views') {
                return (b.views || 0) - (a.views || 0);
            }
            if (sortBy === 'dateDesc') {
                return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
            }
            if (sortBy === 'dateAsc') {
                return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
            }
            return 0;
        });
    }, [allReels, activeCategory, sortBy]);

    return (
        <div className="mt-14 pt-12 border-t border-zinc-800/80 animate-in fade-in duration-300">
            {/* Barre de contrôle : Titre, Filtres thématiques & Options de tri */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles className="w-4 h-4 text-[#FFE500]" />
                        <span className="text-xs font-mono-tech uppercase text-[#FFE500] tracking-wider font-bold">
                            VIDÉOTHÈQUE ÉTENDUE
                        </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                        {labels.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-tech text-zinc-400 mt-1">
                        {labels.subtitle} ({filteredAndSortedReels.length} vidéos)
                    </p>
                </div>

                {/* Sélecteur de Tri */}
                <div className="flex items-center gap-2 bg-[#0c0c12] p-1.5 rounded-xl border border-zinc-800 self-start lg:self-auto">
                    <span className="text-[11px] font-mono-tech uppercase text-zinc-400 px-2 flex items-center gap-1">
                        <ArrowUpDown className="w-3 h-3 text-[#FFE500]" />
                        Tri :
                    </span>
                    <button
                        type="button"
                        onClick={() => setSortBy('views')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-tech uppercase transition-all cursor-pointer ${
                            sortBy === 'views'
                                ? 'bg-[#FFE500] text-black font-bold shadow-[0_0_15px_rgba(255,229,0,0.3)]'
                                : 'text-zinc-300 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Flame className="w-3.5 h-3.5" />
                        <span>{labels.sortByViews}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setSortBy('dateDesc')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-tech uppercase transition-all cursor-pointer ${
                            sortBy === 'dateDesc'
                                ? 'bg-[#FFE500] text-black font-bold shadow-[0_0_15px_rgba(255,229,0,0.3)]'
                                : 'text-zinc-300 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{labels.sortByDateDesc}</span>
                    </button>
                </div>
            </div>

            {/* Onglets Filtres par Catégorie de Cascades */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
                {categories.map((cat) => (
                    <button
                        key={cat.key}
                        type="button"
                        onClick={() => setActiveCategory(cat.key)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-mono-tech uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                            activeCategory === cat.key
                                ? 'bg-zinc-200 text-black font-bold'
                                : 'bg-[#121218] text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Grille des vidéos avec nombre de vues */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {filteredAndSortedReels.map((reel) => (
                    <article
                        key={reel.id}
                        onClick={() => onSelectReel(reel)}
                        className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-[#0c0c10] border border-zinc-800/80 hover:border-[#FFE500]/70 cursor-pointer shadow-lg hover:shadow-[0_10px_35px_rgba(255,229,0,0.15)] transition-all duration-300 flex flex-col justify-end"
                    >
                        {reel.coverImage ? (
                            <Image
                                src={reel.coverImage}
                                alt={reel.title}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                                className="object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-[#121218] flex items-center justify-center">
                                <InstagramLogo className="w-12 h-12 text-zinc-800" />
                            </div>
                        )}

                        {/* Dégradé sombre */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                        {/* Indicateur de Vues en haut à droite */}
                        {reel.viewsFormatted && (
                            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono-tech text-white">
                                <Eye className="w-3 h-3 text-[#FFE500]" />
                                <span>{reel.viewsFormatted}</span>
                            </div>
                        )}

                        {/* Bouton Play central */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 backdrop-blur-md border border-white/20 group-hover:border-[#FFE500] group-hover:scale-110 flex items-center justify-center transition-all duration-300 text-white group-hover:text-[#FFE500] shadow-[0_0_25px_rgba(0,0,0,0.8)]">
                                <Play className="w-5 h-5 fill-current translate-x-0.5" />
                            </div>
                        </div>

                        {/* Titre et description */}
                        <div className="relative z-10 p-3.5 sm:p-4">
                            <h4 className="text-xs sm:text-sm font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors mb-1 line-clamp-2">
                                {reel.title}
                            </h4>
                            {reel.description && (
                                <p className="text-[10px] sm:text-[11px] font-tech text-zinc-300 leading-tight line-clamp-2">
                                    {reel.description}
                                </p>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};
