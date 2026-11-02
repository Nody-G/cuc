'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { Film, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { StudioParallaxCard } from '@/components/ui/parallax';
import type { FilmCredit } from '@/types';
import { type HighlightProject } from './home-tournages-data';
import { CoordinatedFilmsCarousel } from './CoordinatedFilmsCarousel';

interface TournagesPillarsCardProps {
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
    ctaProduction?: string;
    ctaCatalog: string;
    filmsByTitle: Map<string, FilmCredit>;
    featuredProductions?: HighlightProject[];
    coordinatedFilms: FilmCredit[];
    directorFor: (film?: FilmCredit) => string | undefined;
    onOpenFilm: (film: FilmCredit) => void;
}

/**
 * Carte studio : les 3 piliers éditoriaux et le carrousel infini des films
 * coordonnés en cascade par Lucas Dollfus.
 */
export const TournagesPillarsCard: React.FC<TournagesPillarsCardProps> = ({
    pillar1Title,
    pillar1Desc,
    pillar2Title,
    pillar2Desc,
    pillar3Title,
    pillar3Desc,
    ctaCatalog,
    coordinatedFilms,
    directorFor,
    onOpenFilm,
}) => {
    return (
        <StudioParallaxCard maxTilt={2}>
            <div className="bg-[#0e0e14]/95 backdrop-blur-md border border-[#FFE500]/50 p-6 sm:p-8 lg:p-10 relative shadow-[0_0_40px_rgba(255,229,0,0.08)] flex flex-col gap-8">
                {/* 1. Les 3 Piliers éditoriaux en grille horizontale 3 colonnes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Pilier 1 */}
                    <div className="p-5 sm:p-6 bg-[#14141c]/90 border border-zinc-800 hover:border-[#FFE500]/50 transition-all flex flex-col justify-between h-full group shadow-sm">
                        <div>
                            <div className="flex items-center gap-2.5 text-xs font-mono-tech text-[#FFE500] uppercase font-bold mb-3">
                                <span className="p-1.5 bg-[#FFE500]/10 border border-[#FFE500]/30 rounded-xs">
                                    <Film className="w-4 h-4 text-[#FFE500]" />
                                </span>
                                <span data-cuc-field="sections_data.tournages.pillar1_title">
                                    {pillar1Title}
                                </span>
                            </div>
                            <p
                                data-cuc-field="sections_data.tournages.pillar1_desc"
                                className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed"
                            >
                                {pillar1Desc}
                            </p>
                        </div>
                    </div>

                    {/* Pilier 2 */}
                    <div className="p-5 sm:p-6 bg-[#14141c]/90 border border-zinc-800 hover:border-[#FFE500]/50 transition-all flex flex-col justify-between h-full group shadow-sm">
                        <div>
                            <div className="flex items-center gap-2.5 text-xs font-mono-tech text-[#FFE500] uppercase font-bold mb-3">
                                <span className="p-1.5 bg-[#FFE500]/10 border border-[#FFE500]/30 rounded-xs">
                                    <Sparkles className="w-4 h-4 text-[#FFE500]" />
                                </span>
                                <span data-cuc-field="sections_data.tournages.pillar2_title">
                                    {pillar2Title}
                                </span>
                            </div>
                            <p
                                data-cuc-field="sections_data.tournages.pillar2_desc"
                                className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed"
                            >
                                {pillar2Desc}
                            </p>
                        </div>
                    </div>

                    {/* Pilier 3 */}
                    <div className="p-5 sm:p-6 bg-[#14141c]/90 border border-zinc-800 hover:border-[#FFE500]/50 transition-all flex flex-col justify-between h-full group shadow-sm">
                        <div>
                            <div className="flex items-center gap-2.5 text-xs font-mono-tech text-[#FFE500] uppercase font-bold mb-3">
                                <span className="p-1.5 bg-[#FFE500]/10 border border-[#FFE500]/30 rounded-xs">
                                    <ShieldCheck className="w-4 h-4 text-[#FFE500]" />
                                </span>
                                <span data-cuc-field="sections_data.tournages.pillar3_title">
                                    {pillar3Title}
                                </span>
                            </div>
                            <p
                                data-cuc-field="sections_data.tournages.pillar3_desc"
                                className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed"
                            >
                                {pillar3Desc}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Carrousel infini bidirectionnel des films coordonnés par Lucas Dollfus */}
                <CoordinatedFilmsCarousel
                    films={coordinatedFilms}
                    directorFor={directorFor}
                    onOpenFilm={onOpenFilm}
                />

                {/* 3. Lien vers le catalogue complet */}
                <div className="flex justify-center pt-3 border-t border-zinc-800/80">
                    <Link href="/cuc-team-cascadeur#filmographie" className="group">
                        <span className="text-xs font-mono-tech text-zinc-400 group-hover:text-[#FFE500] transition-colors flex items-center gap-1.5 font-bold uppercase tracking-wider py-1">
                            <span data-cuc-field="sections_data.tournages.cta_catalog">
                                {ctaCatalog}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#FFE500] group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Link>
                </div>
            </div>
        </StudioParallaxCard>
    );
};
