'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { Film, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { StudioParallaxCard } from '@/components/ui/parallax';
import { creditTitleKey } from '@/lib/credit-title';
import { FilmCard, type FilmCardRole } from '@/components/sections/films/FilmCard';
import type { FilmCredit } from '@/types';
import { FEATURED_PRODUCTIONS } from './home-tournages-data';

interface TournagesPillarsCardProps {
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
    ctaProduction: string;
    ctaCatalog: string;
    filmsByTitle: Map<string, FilmCredit>;
    roleFor: (film?: FilmCredit) => FilmCardRole | null;
    footerFor: (film?: FilmCredit) => string;
    onOpenFilm: (film: FilmCredit) => void;
}

/**
 * Carte studio : les 3 piliers éditoriaux et la sélection de productions.
 * Jaquettes canoniques `FilmCard` — présentation et navigation IDENTIQUES
 * au showcase « LES FILMS DOUBLÉS & COORDONNÉS PAR LE CUC » et à la fiche
 * coach (affiche 2/3, badge d'année, clic → fiche détaillée). Repli vers le
 * catalogue si la production n'a pas encore de fiche.
 */
export const TournagesPillarsCard: React.FC<TournagesPillarsCardProps> = ({
    pillar1Title,
    pillar1Desc,
    pillar2Title,
    pillar2Desc,
    pillar3Title,
    pillar3Desc,
    ctaProduction,
    ctaCatalog,
    filmsByTitle,
    roleFor,
    footerFor,
    onOpenFilm,
}) => (
    <StudioParallaxCard maxTilt={2}>
        <div className="bg-[#0e0e14]/95 backdrop-blur-md border border-[#FFE500]/50 p-6 sm:p-10 relative shadow-[0_0_40px_rgba(255,229,0,0.08)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: 3 Pillars */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="p-4 bg-[#14141c] border border-zinc-800 hover:border-[#FFE500]/50 transition-colors">
                        <div className="flex items-center gap-2 text-xs font-mono-tech text-[#FFE500] uppercase font-bold mb-1">
                            <Film className="w-3.5 h-3.5" />
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

                    <div className="p-4 bg-[#14141c] border border-zinc-800 hover:border-[#FFE500]/50 transition-colors">
                        <div className="flex items-center gap-2 text-xs font-mono-tech text-[#FFE500] uppercase font-bold mb-1">
                            <Sparkles className="w-3.5 h-3.5" />
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

                    <div className="p-4 bg-[#14141c] border border-zinc-800 hover:border-[#FFE500]/50 transition-colors">
                        <div className="flex items-center gap-2 text-xs font-mono-tech text-[#FFE500] uppercase font-bold mb-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
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

                    <div className="pt-2 flex flex-wrap items-center gap-4">
                        <Link href="/contact-cuc?demande=tournage-production">
                            <TacticalButton variant="primary" size="md">
                                <span data-cuc-field="sections_data.tournages.cta_production">
                                    {ctaProduction}
                                </span>
                            </TacticalButton>
                        </Link>
                        <Link href="/cuc-team-cascadeur#filmographie">
                            <span className="text-xs font-mono-tech text-zinc-400 hover:text-[#FFE500] transition-colors flex items-center gap-1">
                                <span data-cuc-field="sections_data.tournages.cta_catalog">
                                    {ctaCatalog}
                                </span>
                                <ChevronRight className="w-3 h-3" />
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Right Column: Mini Showcase of Featured Production Posters */}
                <div className="lg:col-span-5">
                    <div className="grid grid-cols-2 gap-3">
                        {FEATURED_PRODUCTIONS.map((prod, idx) => {
                            const match = filmsByTitle.get(creditTitleKey(prod.title));
                            return (
                                <FilmCard
                                    key={match?.id ?? `home-${prod.title}`}
                                    film={
                                        match ?? {
                                            id: `home-${idx}`,
                                            title: prod.title,
                                            year: prod.year,
                                            image: prod.poster,
                                        }
                                    }
                                    sizes="(max-width: 1024px) 50vw, 20vw"
                                    role={roleFor(match)}
                                    footer={footerFor(match)}
                                    onOpen={match ? () => onOpenFilm(match) : undefined}
                                    href={match ? undefined : '/cuc-team-cascadeur#filmographie'}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    </StudioParallaxCard>
);
